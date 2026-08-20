<script lang="ts">
  import { navigate } from "../../core/router";
  import { player, location, dungeonMap, enemies } from "../../core/state";
  import { generateDungeon } from "../../systems/procgen";
  import { spawnEnemies } from "../../systems/spawns";
  import { get } from "svelte/store";

  function findStairs(map: any): { x: number; y: number } | null {
    for (let y = 0; y < map.cells.length; y++) {
      for (let x = 0; x < map.cells[0].length; x++) {
        if (map.cells[y][x].type === "stairs_up") return { x, y };
      }
    }
    return null;
  }

  function goDungeon() {
    try {
      // Read the location store VALUE, not the store object
      const loc = get(location);
      const seed = `${loc.zoneId}-floor1`;
      const map = generateDungeon(seed, 1);
      dungeonMap.set(map);
      const es = spawnEnemies(map, 1, seed);
      enemies.set(es);

      const start = findStairs(map) ?? { x: 1, y: 1 };
      player.update((p) => {
        p.position = start;
        return p;
      });

      location.update((l) => ({ ...l, isTown: false }));
      // Combat is started by Dungeon.svelte onMount — not here.
      navigate("/dungeon");
    } catch (e) {
      console.error("goDungeon failed", e);
      throw e;
    }
  }

  function openInventory() {
    navigate("/inventory");
  }

  function toSettings() {
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
        <button class="btn focusable" on:click={openInventory} data-id="inv">🎒 Inventory</button>
        <button class="btn focusable" on:click={goDungeon} data-id="dungeon">⚔ Enter Dungeon</button>
        <button class="btn focusable" on:click={toSettings} data-id="settings">⚙ Settings</button>
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
</div>

<style>
  .town {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 24px 40px;
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
</style>
