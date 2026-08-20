<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "../../core/router";
  import { player, location, dungeonMap, enemies } from "../../core/state";
  import { generateDungeon } from "../../systems/procgen";
  import { spawnEnemies } from "../../systems/spawns";
  import { get } from "svelte/store";

  // Document-level click logger so we can see if any click reaches the
  // document at all (bypasses every Svelte event-binding question).
  onMount(() => {
    document.addEventListener("click", (e) => {
      const t = e.target as HTMLElement | null;
      const tag = (t?.tagName ?? "?") + "#" + (t?.id ?? "") + "." + (t?.className ?? "");
      console.log("[doc click]", tag, "defaultPrevented:", e.defaultPrevented);
      if (typeof window !== "undefined") {
        (window as any).__lastDocClick = tag;
      }
    }, true);
  });

  // Plain DOM diagnostic — uses a regular <div> that we update via direct
  // DOM manipulation. This bypasses ALL Svelte reactivity so we can confirm
  // the click handler actually ran even if runes/$state is broken.
  function setDomStatus(msg: string, isError = false) {
    if (typeof document === "undefined") return;
    const el = document.getElementById("__town_debug");
    if (el) {
      el.textContent = (isError ? "❌ " : "") + msg;
      el.style.background = isError ? "rgba(80, 0, 0, 0.95)" : "rgba(0, 0, 0, 0.95)";
      el.style.borderTopColor = isError ? "#ff3c3c" : "#2a2a38";
    }
  }

  function findStairs(map: any): { x: number; y: number } | null {
    for (let y = 0; y < map.cells.length; y++) {
      for (let x = 0; x < map.cells[0].length; x++) {
        if (map.cells[y][x].type === "stairs_up") return { x, y };
      }
    }
    return null;
  }

  function goDungeon(event?: Event) {
    const ts = new Date().toISOString();
    if (typeof window !== "undefined") {
      (window as any).__lastClick = `goDungeon ${ts}`;
    }
    console.log(`[${ts}] [goDungeon] HANDLER FIRED`, event?.type, event?.target);
    setDomStatus("Click 1: handler entered");

    try {
      setDomStatus("Step 1: reading location store");
      const loc = get(location);
      const seed = `${loc.zoneId}-floor1`;
      setDomStatus(`Step 2: seed = ${seed}`);

      setDomStatus("Step 3: generating dungeon");
      const map = generateDungeon(seed, 1);
      setDomStatus(`Step 4: map generated ${map.width}x${map.height}`);

      setDomStatus("Step 5: setting dungeonMap store");
      dungeonMap.set(map);
      setDomStatus("Step 6: dungeonMap set");

      setDomStatus("Step 7: spawning enemies");
      const es = spawnEnemies(map, 1, seed);
      setDomStatus(`Step 8: ${es.length} enemies spawned`);

      setDomStatus("Step 9: setting enemies store");
      enemies.set(es);
      setDomStatus("Step 10: enemies set");

      setDomStatus("Step 11: finding start position");
      const start = findStairs(map) ?? { x: 1, y: 1 };
      setDomStatus(`Step 12: start at (${start.x},${start.y})`);

      setDomStatus("Step 13: updating player");
      player.update((p) => {
        p.position = start;
        return p;
      });
      setDomStatus("Step 14: player updated");

      setDomStatus("Step 15: updating location");
      location.update((l) => ({ ...l, isTown: false }));
      setDomStatus("Step 16: location updated");

      setDomStatus("Step 17: navigating to /dungeon");
      navigate("/dungeon");
      setDomStatus("Step 18: navigate() returned");
    } catch (e: any) {
      const msg = e?.message || String(e);
      const stack = e?.stack || "";
      console.error("[goDungeon] FAILED:", e);
      if (typeof window !== "undefined") {
        (window as any).__lastError = { message: msg, stack };
      }
      setDomStatus(`ERROR: ${msg}\n${stack.split("\n").slice(0, 3).join("\n")}`, true);
    }
  }

  function openInventory(event?: Event) {
    const ts = new Date().toISOString();
    if (typeof window !== "undefined") {
      (window as any).__lastClick = `openInventory ${ts}`;
    }
    console.log(`[${ts}] [openInventory] HANDLER FIRED`, event?.type);
    setDomStatus("Inventory: navigating");
    navigate("/inventory");
  }

  function toSettings(event?: Event) {
    const ts = new Date().toISOString();
    if (typeof window !== "undefined") {
      (window as any).__lastClick = `toSettings ${ts}`;
    }
    console.log(`[${ts}] [toSettings] HANDLER FIRED`, event?.type);
    setDomStatus("Settings: navigating");
    navigate("/settings");
  }
</script>

<div class="town">
  <div class="header">
    <div class="title-strip">
      <h1 class="title">Hollow's Rest</h1>
      <p class="subtitle">A frontier of salvage and ash — Act 1</p>
    </div>
  </div>

  <div class="content">
    <div class="narrative">
      <p>The wind carries the smell of old smoke. Around the salvage camp, broken wagons and burnt-out carriages form a rough palisade. A blacksmith's hammer rings in the distance. A grizzled woman by the well looks up as you pass.</p>
      <p class="small">"Another one come down from the wastes. You here to die, or to loot?"</p>
    </div>

    <div class="services">
      <h2 class="title sub">Services</h2>
      <div class="services-grid">
        <button class="btn focusable" onclick={openInventory} data-id="inv">🎒 Inventory</button>
        <button class="btn focusable" onclick={goDungeon} data-id="dungeon">⚔ Enter Dungeon</button>
        <button class="btn focusable" onclick={toSettings} data-id="settings">⚙ Settings</button>
      </div>
    </div>

    <div class="player-stats">
      <h2 class="title sub">{$player.name} — Lv {$player.level}</h2>
      <div class="stats">
        <div class="stat">
          <span class="label">HP</span>
          <div class="bar"><div class="fill hp" style="width:{$player.hp / $player.maxHp * 100}%"></div></div>
          <span class="value">{$player.hp}/{$player.maxHp}</span>
        </div>
        <div class="stat">
          <span class="label">Mana</span>
          <div class="bar"><div class="fill mana" style="width:{$player.mana / $player.maxMana * 100}%"></div></div>
          <span class="value">{$player.mana}/{$player.maxMana}</span>
        </div>
        <div class="stat">
          <span class="label">Gold</span>
          <span class="value">{$player.gold}</span>
        </div>
        <div class="stat">
          <span class="label">XP</span>
          <div class="bar"><div class="fill xp" style="width:{$player.xp / $player.xpNext * 100}%"></div></div>
          <span class="value">{$player.xp}/{$player.xpNext}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Plain DOM debug bar — updated via setDomStatus, no Svelte reactivity -->
  <div id="__town_debug" class="debug-panel">
    <span class="debug-label">DEBUG</span>
    <span class="debug-msg">Idle</span>
  </div>
</div>

<style>
  .town {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 24px 40px;
    padding-bottom: 56px;
    background: radial-gradient(ellipse at top, rgba(80, 60, 30, 0.15) 0%, transparent 60%);
  }

  .header {
    border-bottom: 2px solid var(--bg-3);
    padding-bottom: 16px;
    margin-bottom: 24px;
  }

  .title-strip .title {
    font-size: 32px;
    color: var(--accent);
    margin-bottom: 4px;
  }

  .subtitle {
    font-family: var(--font-mono);
    color: var(--fg-2);
    font-size: 12px;
    letter-spacing: 0.1em;
  }

  .content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 24px;
    flex: 1;
  }

  .narrative {
    grid-column: 1 / -1;
    background: linear-gradient(180deg, var(--bg-1) 0%, transparent 100%);
    padding: 18px 20px;
    border-radius: 4px;
    border-left: 3px solid var(--accent);
    font-family: var(--font-serif);
    font-size: 14px;
    line-height: 1.6;
    color: var(--fg-1);
  }

  .narrative .small {
    margin-top: 12px;
    color: var(--accent);
    font-style: italic;
    font-family: var(--font-display);
  }

  .services {
    background: var(--bg-1);
    border: 1px solid var(--bg-3);
    border-radius: 4px;
    padding: 16px;
  }

  .services .sub {
    font-size: 16px;
    margin-bottom: 12px;
    color: var(--accent-soft);
  }

  .services-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .player-stats {
    background: var(--bg-1);
    border: 1px solid var(--bg-3);
    border-radius: 4px;
    padding: 16px;
  }

  .player-stats .sub {
    font-size: 16px;
    margin-bottom: 12px;
    color: var(--accent-soft);
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .stat {
    display: grid;
    grid-template-columns: 60px 1fr 90px;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 12px;
  }

  .label {
    color: var(--fg-2);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .value {
    color: var(--fg-0);
    text-align: right;
  }

  .bar {
    height: 8px;
    background: var(--bg-3);
    border-radius: 4px;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    transition: width 200ms;
  }

  .fill.hp {
    background: linear-gradient(90deg, #aa2222 0%, #ff4444 100%);
  }

  .fill.mana {
    background: linear-gradient(90deg, #2244aa 0%, #4488ff 100%);
  }

  .fill.xp {
    background: linear-gradient(90deg, #aa8800 0%, #ffd700 100%);
  }

  /* Plain DOM debug panel — not bound via Svelte to avoid any reactivity issues */
  :global(#__town_debug.debug-panel) {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: rgba(0, 0, 0, 0.9);
    border-top: 1px solid #2a2a38;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    font-family: monospace, "Courier New", monospace;
    font-size: 11px;
    color: #c8c8d0;
    z-index: 10000;
    transition: background 200ms;
  }

  :global(#__town_debug .debug-label) {
    color: #ffd700;
    font-weight: bold;
    letter-spacing: 0.15em;
    flex-shrink: 0;
  }

  :global(#__town_debug .debug-msg) {
    color: #c8c8d0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre-wrap;
    word-break: break-all;
    flex: 1;
  }
</style>
