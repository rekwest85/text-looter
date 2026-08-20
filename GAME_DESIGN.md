# Text Looter RPG — Game Design & Engineering Plan

A solo-play, controller-first, text-and-buttons ARPG for Android handhelds (RG 477V, AYN Thor, Odin Portal, etc.). Single APK, unsigned sideload, no Play Store. Inspired by Diablo II / Path of Exile / Grim Dawn / Titan Quest, but rendered as structured text on a dark canvas with high-end 2D particle VFX — no models, no textures of characters, no raster maps.

---

## 0. Executive Summary

| Pillar | Decision |
|---|---|
| Format | Single-player, offline-first, persistent single character (optionally multiple save slots) |
| Visuals | DOM/HTML for layout + CSS for theme + **Pixi.js** (WebGL) for animated UI chrome, particles, beams, screen shake, post-fx |
| Rendering target | 1280×720 logical (handhelds range 4:3 → 16:9; UI scales & anchors responsively, 4:3 favored since RG 477V is 4:3) |
| Build target | Web app wrapped by **Capacitor** → unsigned **APK** (apksigner) sideloaded via USB / cloud |
| Storage | IndexedDB (large, durable, offline, plays well with Capacitor WebView) |
| RNG | Seeded (Mulberry32 / sfc32) — every dungeon, every drop, every map share is reproducible from seed |
| Inputs | Web **Gamepad API** (primary) + on-screen touch D-pad/buttons fallback + keyboard for dev |
| Audio | WebAudio (synthesized) — no asset pipeline needed; loot beams, hits, ambient |

**Why Pixi.js over Three.js:** benchmarks and library guidance both confirm Pixi.js outperforms Three.js on 2D sprite/particle batching (50%+ FPS advantage at 10k sprites). Since the visual is "text + buttons + particles," we never need a 3D scene. Pixi's `ParticleContainer` is built for exactly this. Three.js adds overhead with no payoff.

**Why Capacitor over TWA:** the game needs to be a *real installable app* that opens instantly without Chrome, with full WebView control over gamepad polling, vibration haptics, immersive mode, audio focus, save file location, and zero URL bar. TWA requires Chrome and origin verification — overkill and more fragile for a sideload-only build. Capacitor is the standard for "web tech, native APK."

---

## 1. Game Pillars

1. **The thrill of the drop.** Loot beams, rarity glow, screen shake, audio sting. The pixel-perfect feeling of a Unique landing must hit every time.
2. **Buildcraft.** 20 slots × affix pool × runes × gems × set bonuses × relics means every character is a puzzle. Theorycrafting > twitch.
3. **Infinite depth.** Procedural maps (BSP + cellular automata hybrid), procedural affixes, endless arena tiers, endless ladder — never "beat the game and quit."
4. **Atmospheric text.** Rich flavor text, codex entries, NPC barks, environmental narration. Combat is a structured log — readable like a novel that you're writing.
5. **One-thumb / one-grip play.** Designed first for handheld controllers (D-pad/ABXY + 2 sticks). Touch overlay is a fallback, never the primary.

---

## 2. Core Loops

```
┌──────────────────────────┐
│  TOWN HUB (per act)      │  ←── stash, vendors, craft, NPCs, waypoint
└────────────┬─────────────┘
             │ depart
             ▼
┌──────────────────────────┐
│  MAP / WORLD MAP        │  ←── act zones, side dungeons, arena
└────────────┬─────────────┘
             │ enter zone
             ▼
┌──────────────────────────┐
│  DUNGEON GRID           │  ←── procedural BSP/CA rooms
│  combat log + grid view │      encounter → kill → loot → repeat
└────────────┬─────────────┘
             │ portal / town portal / death
             ▼
      back to TOWN HUB
```

**Sub-loops (all feed into the main loop):**
- **Craft loop:** find mats → return to town → craft / rune word / socket → equip
- **Codex loop:** discover monster / location / lore → unlock codex entry → permanent stat
- **Endgame loop:** clear Act 6 → unlock Pit (infinite scaling tiers) + Crucible (arena waves) + ladder reset ("Eternal" mode, PoE-league style)
- **Cosmetic / collection loop:** transmog from collected items, pet illusions, portal skins

---

## 3. Tech Stack (locked)

### 3.1 Core
| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** | Type safety on huge data tables (items, affixes, monsters) |
| Bundler | **Vite** | Fast, ESM-native, easy Capacitor copy |
| UI framework | **Lit** (web components) OR **Svelte 4** — recommend **Svelte** | Tiny runtime, great for 4:3 handhelds, animated transitions built-in |
| Canvas / VFX | **Pixi.js v8** | Best 2D WebGL batching, native particle support |
| State | **Zustand** or Svelte stores | Predictable, devtools-friendly, no boilerplate |
| Routing | **svelte-spa-router** | Hash-based, works offline, no server needed |
| Persistence | **Dexie** (IndexedDB wrapper) | Saves, settings, codex, ladder history |
| Audio | **Tone.js** for synth music/SFX OR **Howler.js** for samples | Howler for short SFX (low-latency), Tone for ambient pads |
| RNG | **sfc32** w/ seed strings | Deterministic, fast, well-distributed |

### 3.2 Build / Packaging
| Tool | Purpose |
|---|---|
| **Capacitor 6** | Wraps web build into Android project |
| `apksigner` (NOT `jarsigner`) | Required for Android 11+ APK install — per Ionic bug #8106 |
| Gradle 8.x via Capacitor | Produces unsigned debug APK or self-signed release APK |
| Local keystore (`~/.keystores/text-looter.jks`) | Self-signed; not Play Store |
| Build script | `npm run build:apk` → `vite build` → `cap sync android` → `cd android && ./gradlew assembleRelease` |

**Distribution flow:** Drag-drop the resulting `app-release.apk` to RG 477V / AYN Thor via USB; enable "install from unknown sources"; done. Share APK via cloud drive.

### 3.3 Target device profile (RG 477V class)
- Android 12+
- Snapdragon 865–8 Gen 2 class (overkill for this game)
- 1080p or 1280×720 panels (4:3 ratio prioritized)
- Hardware D-pad + 2 analog sticks + 4 face buttons + 4 shoulders
- Headphone jack + speaker

---

## 4. Visual & Audio Direction

### 4.1 The look
- **Pure black canvas** (`#050507`) — OLED-friendly, makes glow pop
- **Text-first UI**, monospace headings + readable sans body
- **Color = meaning.** Every color is semantic:
  - Rarity color on item name (20 tiers → 20 colors)
  - Damage type color on numbers (phys=tan, fire=red-orange, frost=cyan, lightning=yellow, poison=green, holy=white, dark=violet, void=magenta, true=white-gold)
  - Buff/debuff icon color
  - Elemental ground effect tint
- **Parallax starfield** behind menus — subtle, motion-driven
- **Lighting via Pixi bloom** — items glow, beams cast color on surroundings

### 4.2 The "animated UI" promise
Built entirely in Pixi.js so it runs at 60 fps even with hundreds of particles:
- **Loot beams** — vertical colored column from sky to item (PoE-style); height & width scale with rarity; add particle ring + upward sparks
- **Rarity ground rings** — expanding ring on drop, color-coded
- **Screen shake** — tunable per impact, knockback, boss slam
- **Damage numbers** — float up with physics, color-coded, scale by crit
- **Hit sparks** — at the cell of impact, particle burst in damage color
- **Cast effects** — radial sweep, glyphs
- **Inventory slot glow** — when hovering rare items, the slot border pulses
- **Boss intros** — full-screen vignette, boss name slams in, music shifts
- **Town ambience** — drifting embers, candle flicker on NPCs, weather (snow, ash, rain) per act

### 4.3 Audio
- **Synth-only** — no asset downloads = tiny APK (< 8 MB total target)
- Generative combat music (layered loops per act)
- Loot beam sound = pitch-shifted by rarity tier
- Every UI click = short, varied synth tick

---

## 5. World Structure

### 5.1 Six Acts (story-driven main campaign)

Each act = themed biome + narrative arc + 8–12 zones + town hub + set of boss fights.

| Act | Theme | Hub | Sample zones | Antagonist |
|---|---|---|---|---|
| 1 | Ashen Frontier | **Hollow's Rest** (salvage camp) | Buried Barracks, Rotwood, Cinder Caves | The Fallen Knight |
| 2 | The Sunken Reach | **Deep Harbor** (port town) | Drowned Docks, Coral Catacombs, Tidal Caves | The Tideborn Queen |
| 3 | Hollowpeak Mountains | **High Crossing** (mountain lodge) | Frozen Pass, Wyrm's Tooth, Sunless Mine | The Iron Twins |
| 4 | The Verdant Rot | **Greenmarch** (tree-city) | Fungal Depths, Bramble Maze, Heartwood | The Rootmother |
| 5 | Ashen Cathedral | **The Reliquary** (crusader outpost) | Cursed Nave, Bell Tower, Ossuary | The Sable Cardinal |
| 6 | The Void Threshold | **Last Hearth** (final bastion) | Shattered Planes, Memory Wastes, World Scar | **The Hollow King** (final boss) |

After Act 6 → unlock **The Pit** (infinite scaling dungeon, +1 tier every clear) + **The Crucible** (arena waves, mutators) + **Eternal Mode** (ladder reset).

### 5.2 Home town per act
- Waypoint (return to previous town)
- Stash (shared across acts)
- Vendors: armor, weapons, jewelry, potions, gems, runes, scrolls
- Crafting stations: **Forge** (weapons/armor), **Enchanter** (affix reroll), **Socketsmith** (rune/gem socketing), **Runework Bench** (runewords), **Transmog**, **Codex**, **Mercenary** (hire)
- NPCs with dialogue trees (act-relevant story beats, codex unlocks, side quests)
- Training dummy (test DPS)
- Portal to other acts (post-campaign)

### 5.3 Procedural map generation

**Per-zone generator** (zones are hand-authored theme files — palette, tilesets, monster pools, boss — but layout is procedural):

1. **BSP partition** the area into 12–30 rooms (rectangles)
2. **Connect siblings** with L-corridors + 20% extra loops
3. **Cellular automata pass** on wall borders → natural cave feel
4. **Place set-pieces** at deterministic anchors (entrance, exit, mini-boss, vault, lore room)
5. **Spawn monsters** by room weight × tier × density curve
6. **Spawn loot piles** — chests / shrines / corpses / caches
7. **Compute walkability graph** for pathfinding & line-of-sight

Map is **a 2D grid of cells** (each cell ~ 1 "screen tile"). Rendered as a stylized **ASCII/character tile map** (`#` wall, `.` floor, `≈` water, `▲` stairs, etc.) with Pixi overlay effects (fire, water shimmer, fog of war, animated glyphs on shrines). Fog of war = you see a radius around your character.

### 5.4 Persistent world state
- Zone IDs are seeded strings; same seed = same layout (for codex, daily runs)
- Most zones are **expeditions** (reset on leave) but a handful of **Hideouts** are persistent
- Ladder / Pit uses a global seed-of-the-day

---

## 6. Character & Progression

### 6.1 Class design (6 base classes, each with 3 subclasses = 18 archetypes)

| Base | Subclass 1 | Subclass 2 | Subclass 3 |
|---|---|---|---|
| **Warrior** | Berserker (2H phys) | Guardian (sword+board) | Blademaster (dual wield) |
| **Ranger** | Sharpshooter (bow) | Marksman (crossbow, traps) | Beastmaster (pets) |
| **Mage** | Pyromancer | Cryomancer | Stormcaller |
| **Necromancer** | Summoner | Bone Mage | Plague Doctor |
| **Paladin** | Avenger (holy dmg) | Sentinel (auras) | Inquisitor (hybrid) |
| **Rogue** | Assassin (crit) | Saboteur (traps/poisons) | Shadowblade (dark) |

Subclass is chosen at level 10 (single respec for gold).
Class defines: base stats, starting skills, can-equip restrictions, mastery affixes.

### 6.2 Progression pillars
- **Levels 1–60** (main campaign cap)
- **Paragon / Eternal levels 1–∞** (post-campaign infinite)
- **Skill tree** — 200+ nodes, chooseable up to level cap, respec anytime at town
- **Mastery points** — earned every 5 levels, spent in class-specific capstones
- **Codex power** — discovered entries give small permanent stat (+1 per codex)
- **Reputation** — per faction (4 factions), ranks unlock vendors, recipes, lore

### 6.3 Stats (compact, readable)
Primary: STR, DEX, INT, VIT, WIS
Derived:
- Life, Mana, Energy Shield, Armor, Evasion
- Phys/Fire/Frost/Lightning/Poison/Holy/Dark/Void Resistances (capped at 75%)
- Attack Speed, Cast Speed, Move Speed
- Crit Chance, Crit Multiplier
- Block Chance, Dodge Chance
- Life Regen, Mana Regen, Leech %, Thorns

Each item slot contributes its own stat budget. Stacking rules defined per slot (e.g., +life can roll on most slots, but +% phys damage only on weapons).

---

## 7. Equipment System — 20 Slots

### 7.1 Slot list

```
HEAD:
 1.  Helmet
 2.  Face (mask/visor)

SHOULDERS:
 3.  Shoulders (pauldrons)

CHEST:
 4.  Chest Armor
 5.  Belt

LEGS:
 6.  Pants
 7.  Boots

ARMS:
 8.  Gloves

JEWELRY:
 9.  Ring 1
10.  Ring 2
11.  Amulet

WEAPON (one of):
12.  Weapon (one-handed or two-handed; dual-wield possible)

OFFHAND:
13.  Shield / Quiver / Focus / Totem (depends on weapon)

ACCESSORIES:
14.  Cape
15.  Bracer

CRAFTING-SLOTS:
16.  Rune Slot 1
17.  Rune Slot 2
18.  Gem Slot 1
19.  Gem Slot 2

ENDGAME:
20.  Artifact Slot (relic / set-piece)
```

Each slot has:
- visual border color = highest rarity of item in it (glow at Rare+)
- 1–6 **sockets** (rolled or fixed per base)
- up to 3 **prefix** affixes + 3 **suffix** affixes (rolled)
- **implicit** property (always present on base)
- can hold runes, gems, or relics depending on socket color

### 7.2 Base item diversity
- ~40 weapon bases (swords, axes, maces, bows, crossbows, staves, wands, daggers, spears, fists)
- ~30 armor bases (helmets, chests, pants, gloves, boots, shoulders, belts)
- ~10 offhand bases (shields, quivers, focuses, tomes, totems)
- ~12 accessory bases (rings × styles, amulets × styles, capes, bracers)
- Each base: **implicits**, **stat budget**, **socket count range**, **level req**

---

## 8. Loot System — 20 Rarities, Procedural Affixes

### 8.1 The 20-tier rarity ladder

Inspired by Diablo II / PoE familiarity for tiers 1–5, then escalating into bespoke cosmic tiers.

| # | Tier name | Border color (hex) | Glow | FX on drop | Drop weight |
|---|---|---|---|---|---|
| 1 | Worn | `#666` | none | dust puff | 40 |
| 2 | Common | `#bfbfbf` | none | dust puff | 25 |
| 3 | Fine | `#d4d4d4` | faint | dust puff | 15 |
| 4 | Superior | `#e8e8e8` | faint | dust puff | 8 |
| 5 | Magic | `#8888ff` | pulse | blue beam (thin) | 5 |
| 6 | Rare | `#ffff77` | strong | yellow beam + ring | 2.5 |
| 7 | Epic | `#a060ff` | pulse | purple beam + ring | 1.0 |
| 8 | Legendary | `#ff8a3c` | bright | orange beam + sparks | 0.4 |
| 9 | Mythic | `#ff3c7a` | bright | magenta beam | 0.15 |
| 10 | Ancestral | `#3cffd0` | bright | teal beam | 0.06 |
| 11 | Voidtouched | `#9d3cff` | heavy | violet beam + slow pulse | 0.025 |
| 12 | Celestial | `#ffd700` | radiant | gold beam + halo | 0.010 |
| 13 | Infernal | `#ff2200` | fire | crimson beam + embers | 0.005 |
| 14 | Frostforged | `#7ce8ff` | ice | icy beam + frost particles | 0.005 |
| 15 | Stormborn | `#fff066` | electric | lightning beam + arcs | 0.005 |
| 16 | Umbral | `#1a0033` + `#bb88ff` border | dark pulse | black-purple beam + shadow particles | 0.002 |
| 17 | Radiant | `#ffffff` + prismatic | prismatic | rainbow beam | 0.001 |
| 18 | Eternal | `#00ff95` | cosmic | green-gold beam + slow pulse | 0.0005 |
| 19 | Primordial | `#ff00ff` + `#ffff00` border | warp | warp beam + screen distort | 0.0002 |
| 20 | **The One** | custom animated shader | reality-fracture | full-screen pulse, all FX, custom audio sting | 0.00005 |

Higher tiers stack all lower-tier FX. **The One** = 1 in ~2,000,000 kills; the "holy shit" drop. Plays a unique synth sting; entire UI pulses; beam reaches sky.

**Naming convention per tier** is also thematic (Worn Blade → Ancestral Greatsword → "Eternal Crucible, World-Severer of the Voidborn King").

### 8.2 Affix pool

**~300 affixes total** organized as:
- **Implicit** (1–2 per base, fixed)
- **Prefixes** (~120): offensive (phys/fire/frost/lightning/poison/holy/dark/void damage, +%, crit, attack speed, cast speed, +skills)
- **Suffixes** (~120): defensive (life, mana, resists, armor, evasion, block, dodge, regen, leech, DR)
- **Utility** (~60): magic find, gold find, XP bonus, move speed, item rarity, sockets added

Each affix has a **tier** (T1 weakest … T7 strongest) and a **level requirement** for each tier. Higher rarity items roll more affixes (and from higher tiers):

| Rarity | Prefix slots | Suffix slots | Tier cap |
|---|---|---|---|
| Worn–Superior | 0 | 0 | — |
| Magic | 1 | 1 | T3 |
| Rare | 2 | 2 | T5 |
| Epic | 3 | 3 | T6 |
| Legendary | 3 | 3 | T7 + 1 unique power |
| Mythic+ | 3 | 3 | T7 + 1+ unique powers |

**Magic Find / Item Rarity** scales the drop table smoothly. Player sees the MF% in stats.

### 8.3 Procedural name generation

Pattern: `{prefix-epithet} {base-name} {suffix-epithet}` for items with affixes.
Example: `Glacial Greatsword of the Blasphemers`, `Vortex Crown of Shattered Stars`.

Pool of ~500 prefix-epithets, ~500 suffix-epithets — themed by damage type and affix rolled. Names are deterministic (same affixes → same name).

### 8.4 Drop tables (Treasure Classes, D2-style)

Each monster has a **Treasure Class** (TC): N picks from weighted sub-TCs, with quality bias. TCs reference other TCs → tree of fallbacks. Champion monsters = TC×3. Uniques = TC×5. Bosses = fixed high-tier TC.

### 8.5 Crafting & item modification (potential)

Every item has a `Potential` value (invisible currency). Operations consume it:
- Reroll affix (5)
- Upgrade affix tier (25)
- Add socket (40)
- Reroll implicit (60)
- Imprint (legendary only) (200)

Items with Potential = 0 cannot be modified.

---

## 9. Crafting, Runes, Gems, Relics, Artifacts

### 9.1 Crafting
Two branches:
- **Smithing** — combine mats + base item → upgraded base with new implicit pool, can hit Worn→Superior→Magic→Rare→Epic depending on roll
- **Affix crafting** — at the Enchanter, spend mats to add/upgrade/reroll affixes

Mats: ores, leathers, cloth, essences, dusts, cinders, voidshards (per act-themed).

### 9.2 Gems (socketable)
~24 gems total, types:
- **Weapon gems**: flat added damage, %elemental damage, on-hit effects
- **Armor gems**: +life/mana on hit, regen, DR, thorns
- **Helm gems**: +skills, XP bonus, mana on kill
- **Shield gems**: block bonus, resists, reflect

Each gem levels 1–20, scaling effect. Quality (rough/regular/flawless/perfect) adds a bonus.

### 9.3 Runes (socketable, Runeword system)
~33 runes, each with a unique letter (D2-inspired ordering).
Socket a sequence of runes in correct order into a base with the right number of sockets → **Runeword** unlocks a powerful fixed set of affixes AND a named proc ability.
~50 runewords total. Some are class-locked.

Examples:
- `El + Dol + Eld` = Steel Runeword (+25% attack speed, +10% crushing blow)
- `Lem + Pul + Mal + Um` = King's Word (+skill, life, all-resist — class: Paladin only)

### 9.4 Relics (special slot 20)
Found in endgame. Each gives a global passive and a triggered ability. One equipped at a time. ~40 relics, very rare drops, lore-tied.

### 9.5 Artifacts (set-piece slot 20)
A special category of relics that are part of a **Set** (3-piece / 5-piece). Wearing multiple set pieces unlocks set bonuses that grow in power. ~30 sets across acts.

### 9.6 Crafting tier
- **Apprentice** → **Journeyman** → **Adept** → **Master** → **Grandmaster** per character, leveled by crafting XP. Higher tier = chance for higher-tier affixes / sockets.

---

## 10. Currency / Economy

Single currency: **Gold**. Plus trade-goods:
- **Soul Shards** (dropped by elites, used in high-end crafting)
- **Essences** (per element, drop from themed zones)
- **Voidstones** (endgame, used to reroll legendaries)
- **Codex Pages** (lore unlock currency)

No microtransactions, no real-money shop — this is a personal project.

Gold sinks:
- Repair (yes, durability system — items degrade, can break)
- Crafting mats
- Vendor purchases (potions, scrolls, tomes)
- Gambling (buy random item of itemlevel ± your level)
- Mercenary hire
- Respec (cheap, capped)
- Stash upgrades (more tabs, more rows)

---

## 11. UI / UX Architecture

### 11.1 Screens

```
Main Menu
├── New Game (pick class)
├── Continue
├── Eternal Mode (ladder reset)
├── Settings (audio, video, controls, keybind)
├── Codex
└── Credits

Town Hub (per act)
├── World Map
├── Waypoint (jump to any unlocked zone)
├── Vendors (4 vendors)
├── Crafting Stations (Forge, Enchanter, Socketsmith, Runework, Transmog)
├── Stash
├── Inventory
├── Character Sheet
├── Skill Tree
├── Codex
├── Mercenary
├── Settings

In-Dungeon HUD
├── Health/Mana/Energy bars
├── Buff/debuff icon row
├── Minimap (top-right)
├── Combat log (right column, scrollable)
├── Action bar (bottom, 8 skill slots + ult)
├── Minimap legend
└── Controller hints (contextual)

Loot Drop Modal
├── Item name (rarity color)
├── Item type + base
├── Affix list (color-coded: green=added, red=replaced)
├── Sockets (click to socket)
├── Buttons: Equip / Stash / Sell / Salvage / Compare / Close
└── Item comparison side-by-side

Inventory
├── Grid view (8×6 bag + 20 equip slots)
├── Drag/drop with gamepad (D-pad to select, A to pick/move)
├── Quick-equip via Y button
└── Item tooltip on focus

Settings
├── Audio (music, SFX, ambience sliders)
├── Display (resolution, motion blur, particles quality, text size)
├── Controls (gamepad rebind, touch overlay toggle, sensitivity)
└── Accessibility (colorblind filters, big text, reduce motion)
```

### 11.2 Controller input model

```
D-Pad / Left Stick        → cursor / menu nav
Right Stick               → map pan / minimap zoom
A                         → confirm / pickup / attack
B                         → back / cancel / dodge
X                         → interact / open
Y                         → quick-skill slot 1 / radial menu
L1 / R1                   → tab left/right in panels
L2                        → map / world map
R2                        → inventory
Start                     → menu / pause
Select                    → codex / lore
```

**Radial menu** (hold LB + face button) for skills.

### 11.3 Gamepad-first, touch fallback

A "focusable" element system: every interactive thing has a `.focusable` class. The Gamepad module updates a single `focusedElement` cursor that:
- moves on D-pad / left stick
- snaps to nearest focusable in direction (8-way)
- triggers hover/click on A
- shows a **focus ring** (high-contrast outline)

Touch overlay (visible only when no gamepad detected) provides a virtual D-pad + ABXY on the left/right halves of the screen. Auto-hides when gamepad connects.

### 11.4 Combat log design

The log is the heart of the game. Each line:
```
[12:34:56] ⚔ You crit Flesh Hound for 1,247 ✦FROST✦ damage (×2.3)
[12:34:56] ✦ Flesh Hound dies — drops: ★Glacial Crown★ of the Frozen
[12:34:56] ✧+247 Gold  ✧+12 Souls
```

Lines fade-in with subtle slide, are color-coded by source (player, ally, enemy, system, environment), and can be filtered (Hide loot spam / hide non-crits / etc).

### 11.5 Damage numbers

Float upward from impact cell, color = damage type, scale = magnitude + crit multiplier. Stacking rule: combine nearby numbers into a single float after 0.5s.

---

## 12. Combat System

### 12.1 Action types
- **Auto-attack** (default, every X seconds)
- **Active skills** (8 slots, cooldowns or mana costs)
- **Movement** (click-to-move or D-pad to scroll map, hold A to keep moving)
- **Dodge** (B, short cooldown, iframes)
- **Potion** (start button or item slot, limited charges)

Combat is **tick-based** at 20 ticks/sec, but visually animated between ticks. Player and enemies act simultaneously.

### 12.2 Damage formula (read-once, debug-friendly)

```
Final Damage =
  BaseDamage
  × (1 + Σ%Increased)
  × (1 + Σ%More)
  × CritMultiplier (if crit)
  × (1 - enemyDR)
  × enemyVulnerability
```

Affixes can be **Increased** (additive category) or **More** (multiplicative — rare, powerful).

### 12.3 Status effects
Freeze, Chill, Shock, Ignite, Poison, Bleed, Curse, Stun, Blind, Slow, Vulnerable. Each has stacks / duration / potency.

### 12.4 AI enemies
State machine: Idle → Patrol → Alert → Chase → Attack → Flee → Dead.
Each monster type has a behavior profile (telegraph attacks, enrage at low HP, summon adds, etc.).

### 12.5 Boss design
Multi-phase bosses with:
- Telegraphed big attacks
- Adds to manage
- Invulnerability phases with breakable mechanics
- Lore drop on first kill (codex)
- Guaranteed unique-tier drop on first kill per difficulty

---

## 13. Persistence & Saves

### 13.1 Save model
- **Save slot** = whole IndexedDB database (one character)
- Auto-save every 30s + on zone change + on death + on town entry
- 5 slots available, can rename/delete
- Export / import to JSON file (for backup or device transfer)

### 13.2 What gets saved
- Character sheet, skills, paragon
- Inventory, equipped, stash
- Quest log, codex, waypoints unlocked
- Per-zone state (boss kills, lore discovered, chests opened)
- Settings (gamepad bindings, audio)
- Play time, kill counts, deepest Pit depth

### 13.3 What's not saved
- Procedural layouts (re-seeded from zone id on revisit)
- Live combat state (reset on quit)

### 13.4 Anti-cheat / cloud sync
Not needed — single-player, single-device.

---

## 14. Performance Budget

RG 477V / AYN Thor target: **60 fps at 1080p / 720p** with 300+ particles on screen.

| System | Budget |
|---|---|
| Game logic tick | < 8 ms / 20 tick (1 ms available) |
| Pixi render | < 8 ms / frame |
| DOM render (HUD) | < 2 ms / frame |
| Total frame | 16.6 ms (60 fps) |

**Particle pooling** — every particle system uses a pool of N preallocated sprites. No allocation in render loop.

**Render culling** — only particles within viewport are updated; outside = frozen.

**Detail settings** — Low / Med / High / Ultra presets in settings. Low = no bloom, 50% particle cap, no screen shake. Ultra = everything on.

---

## 15. Build & Distribution Pipeline

### 15.1 Project layout
```
text-looter-rpg/
├── src/
│   ├── core/           (engine, state, save, RNG)
│   ├── data/           (items, monsters, skills, affixes JSON)
│   ├── systems/        (combat, loot, crafting, procgen)
│   ├── ui/             (Svelte components)
│   ├── vfx/            (Pixi particle systems)
│   ├── audio/          (Tone.js synths)
│   └── platform/       (Capacitor bridge, gamepad, haptics)
├── public/             (static assets, icons, fonts)
├── android/            (Capacitor-generated)
├── scripts/
│   └── build-apk.ps1
├── capacitor.config.ts
├── vite.config.ts
├── package.json
├── tsconfig.json
└── GAME_DESIGN.md
```

### 15.2 Build commands

```
npm run dev              # vite dev server (browser testing)
npm run build            # vite build → dist/
npm run android:sync     # cap sync android
npm run android:apk      # gradle assembleRelease → android/app/build/outputs/apk/release/app-release.apk
npm run android:install  # adb install (when device plugged)
npm run signing:gen      # one-time keystore creation
```

### 15.3 APK signing (CRITICAL — Capacitor pitfall)

Per Capacitor issue #8106: `jarsigner` produces broken APKs on Android 11+. Must use **`apksigner`** explicitly in `build.gradle`:

```gradle
signingConfigs {
    release {
        storeFile file("../../keystores/text-looter.jks")
        storePassword System.getenv("KEYSTORE_PASS")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASS")
        signingType "apksigner"   // ← mandatory
    }
}
```

Output APK is **self-signed** (not Play Store cert). Sideloading only.

### 15.4 APK size target
- Capacitor baseline: ~5 MB
- Pixi.js bundle (tree-shaken): ~250 KB
- App code + data: ~3 MB (lots of JSON tables)
- Synth audio: ~200 KB
- **Target: < 12 MB APK** (vs. typical AAA mobile game: 1–5 GB)

### 15.5 Install on device
- Connect handheld via USB
- `adb install app-release.apk` OR drag-drop APK to device's Download folder, open file manager, tap to install (requires "Install unknown apps" enabled for that file manager)

---

## 16. Phased Milestones

> All milestones end with a **playable build** on the handhelds. No "complete the engine first, then content." Each phase ships a slice you can actually play.

### Phase 0 — Skeleton (week 1–2)
- Vite + Svelte + Pixi scaffold
- Capacitor wrap, build first working APK
- Main menu, blank character select, blank town, blank dungeon (placeholder grid)
- Gamepad navigation working end-to-end
- First loot drop modal works

### Phase 1 — Core combat (week 3–5)
- 1 class (Warrior), 4 skills
- Procedural BSP dungeon (1 zone)
- Monster AI + combat loop (20 Hz tick)
- Damage numbers, combat log
- Auto-attack + 1 active skill

### Phase 2 — Loot & gear (week 6–8)
- 20 rarities, 10 affixes, 20 item bases
- 5 equip slots, inventory, drag-drop
- Loot beams + glow VFX
- Simple craft (reroll affix)
- Stash, vendors, gold

### Phase 3 — Acts 1–3 (week 9–14)
- All 20 slots functional
- Class system (6 classes × 1 spec each for now)
- 3 acts, ~10 zones each, 3 boss fights per act
- Story dialogues, codex
- Rune + gem socketing
- Runewords (10 implemented)

### Phase 4 — Acts 4–6 + crafting (week 15–20)
- Remaining 3 acts
- All crafting tiers
- All 50 runewords
- Set items, relics
- Skill tree (200 nodes)
- Paragon levels
- Codex power system

### Phase 5 — Endgame (week 21–24)
- The Pit (infinite scaling)
- The Crucible (arena)
- Eternal Mode (ladder reset)
- Daily seeded dungeon
- Cosmetics / transmog
- Leaderboards (local only — not networked)

### Phase 6 — Polish (week 25+)
- All 20 classes (3 specs each)
- Audio pass (full OST)
- UI animation polish
- Performance pass (target 60 fps on RG 477V)
- Controller binding UI
- Accessibility options (colorblind modes, big text)
- Save backup / restore
- Beta loop on hardware, iterate

---

## 17. Risks & Open Questions

| Risk | Mitigation |
|---|---|
| Capacitor APK signing issues on Android 11+ | Use `apksigner` explicitly; test on RG 477V early (Phase 0) |
| WebView gamepad polling latency | Poll inside `requestAnimationFrame`, not via `gamepadconnected` events alone |
| DOM + Canvas performance mixing (HUD over WebGL) | Use Pixi for HUD chrome too OR absolute position over Canvas, test perf early |
| Save corruption on hard kill | Write-ahead log per save (Dexie transaction + version field) |
| Scope creep (this is a huge design) | Strict Phase gates; each phase must ship a playable build before moving on |
| IndexedDB quota on Android WebView | Usually 50 MB+ available; monitor; offer "export save" if close to limit |
| Controller mapping diversity (RG 477V vs AYN Thor) | Detect by `gamepad.id`, provide per-device default bindings + manual rebind |
| Haptic / vibration on Capacitor | Use `@capacitor/haptics` plugin for impact patterns |

### Open questions to resolve before code
1. **Pixel resolution:** stick to 1280×720 logical, or render at native and scale? (Recommend 1280×720 logical for pixel-perfect text.)
2. **Save slots:** 1 character only, or 5 slots? (Recommend 5.)
3. **Music:** generative synth (Tone.js) or short loop library (Howler.js)? (Recommend Tone.js generative — tiny APK, infinite variety.)
4. **Story depth:** full voice-acted cutscenes or text-only dialogues with portraits? (Recommend text + simple Pixi portraits.)
5. **Daily runs:** seeded for everyone, or per-account? (Per-account seed-of-the-day = simple.)

---

## 18. Inspiration & References (from research)

**Closest analogues:**
- **Enarian Online** (itch.io, Steam 2025) — text ARPG with custom client; closest visual reference
- **Harpagia** (iOS/Android) — offline text RPG with skills + rune-style sockets; reference for pacing
- **Signal Decay** (web) — Melvor-style deep idle + active modes; reference for systems density
- **Pixel Valkyrie** (mobile, Silverfly) — 2D ARPG with deep procedural loot; reference for "ARPG on phone" feel
- **Battlers of Ekrasys** (Steam) — text autobattler with smithmagic system; reference for runeword feel

**Diablo II design lessons (from Asuka Wang's reverse-engineering + David Brevik interviews):**
- Color-coded rarity is sacred — players read the color before the stats
- Treasure Class tree → predictable but cascading variety
- Item level + base quality level = affix tier cap
- Sound on drop is as important as the visual
- Set + Unique + Rare can all be "best in slot" depending on build (don't tie power to rarity)

**PoE design lessons:**
- Item filters are a must for late-game; ship a sane default + allow customization
- Runeword / gem systems create build-defining choices
- Resistances cap at 75% — gating the gear treadmill
- "Magic find" stat is fun but should plateau; don't let it trivialize

**Procedural map generation references:**
- BSP for structured dungeon layouts (well-documented, fast)
- Cellular Automata for organic cave transitions
- MST-based corridor connection for guaranteed reachability
- Hybrid: BSP rooms + CA borders + hand-placed set pieces (best of all worlds)

**Visual / VFX references:**
- Stylized Loot Drops (Unity Asset Store) — the "7-tier drop VFX" template, conceptually
- Loot Beams (Unity Asset Store) — color-coded vertical beams for rarity signaling
- Pixel Valkyrie / Diablo III rarity glows — particle ring + beam

---

## 19. Immediate Next Steps (when you're ready to start building)

1. Scaffold project (`npm create vite@latest text-looter-rpg -- --template svelte-ts`)
2. Add Capacitor (`npm i @capacitor/core @capacitor/cli @capacitor/android && npx cap init`)
3. Add Pixi (`npm i pixi.js`)
4. Add Dexie (`npm i dexie`), Tone (`npm i tone`), Howler (`npm i howler`)
5. Build first APK end-to-end (skeleton only — verify APK installs on RG 477V)
6. Begin Phase 1 — combat tick + dungeon grid + 1 class

Before that — any changes to this design? Specific areas you want me to expand, simplify, or reconsider?