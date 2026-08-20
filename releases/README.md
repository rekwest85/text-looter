# Releases

Downloadable APKs for sideloading onto Android handhelds. No Play Store, no signing service.

## v0.1.0 — Phase 0 Skeleton

[Download APK](v0.1.0/text-looter-v0.1.0.apk) (3.25 MB)

**What works:**
- Main menu, character creation (6 classes), town hub (Hollow's Rest)
- Procedurally-generated dungeon (BSP, 60×40 grid) with FOV
- Combat tick (20 Hz): auto-attack, AoE Whirlwind, bump-attack
- 20-tier rarity system with color-coded item names + glow
- Sample item pool (~30 bases, ~18 affixes) and loot generator
- Loot drop modal with Pixi.js particle beam effect
- Inventory (20 equip slots + 48-slot bag)
- Gamepad navigation (D-pad focus, A=click, B=back, START=pause)
- Keyboard fallback (WASD + Enter/Esc)
- Touch fallback overlay
- Dexie (IndexedDB) save system
- Settings (audio, display, controls, accessibility)

**Install:**
1. On your Android device, enable "Install from unknown sources" in Settings → Security
2. Tap the APK link above
3. Install
4. Launch "Text Looter RPG"

Or via ADB from a computer:
```bash
adb install -r text-looter-v0.1.0.apk
```

**Tested on:** AYN Thor (16:9), RG 477V (4:3)
