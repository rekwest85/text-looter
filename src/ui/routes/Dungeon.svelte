<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { get } from "svelte/store";
  import { dungeonMap, enemies, player, pendingLoot, location } from "../../core/state";
  import { movePlayer, setRunning } from "../../systems/combat";
  import { computeFOV } from "../../systems/procgen";
  import { BTN } from "../../platform/gamepad";
  import { push } from "svelte-spa-router";
  import LootModal from "../components/LootModal.svelte";
  import CombatLog from "../components/CombatLog.svelte";
  import ActionBar from "../components/ActionBar.svelte";

  let canvasEl: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let containerEl: HTMLDivElement;
  let renderHandle = 0;
  let resizeObserver: ResizeObserver | null = null;

  // Dynamically computed based on container size
  let CELL = 18;
  let viewW = 60;
  let viewH = 26;
  let canvasW = 0;
  let canvasH = 0;

  // Off-screen canvas for the static map (faster redraw)
  let mapCanvas: HTMLCanvasElement | null = null;
  let mapCtx: CanvasRenderingContext2D | null = null;
  let lastMapHash = "";

  function recomputeViewport() {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    canvasW = Math.max(320, Math.floor(rect.width));
    canvasH = Math.max(240, Math.floor(rect.height));

    // Pick a cell size that fits at least 40×22 cells on screen
    const minCellsX = 40;
    const minCellsY = 22;
    const cellByW = Math.floor(canvasW / minCellsX);
    const cellByH = Math.floor(canvasH / minCellsY);
    CELL = Math.max(10, Math.min(cellByW, cellByH, 32));

    viewW = Math.floor(canvasW / CELL);
    viewH = Math.floor(canvasH / CELL);

    if (canvasEl) {
      canvasEl.width = canvasW;
      canvasEl.height = canvasH;
    }
  }

  function renderOnce() {
    const map = get(dungeonMap);
    if (!map || !ctx) return;

    const hash = `${map.seed}-${map.level}`;
    if (hash !== lastMapHash) {
      renderMapOffscreen(map);
      lastMapHash = hash;
    }

    const p = get(player);
    const cx = Math.max(viewW / 2, Math.min(map.width - viewW / 2, p.position.x));
    const cy = Math.max(viewH / 2, Math.min(map.height - viewH / 2, p.position.y));
    const ox = Math.floor(cx - viewW / 2);
    const oy = Math.floor(cy - viewH / 2);

    computeFOV(map.cells, p.position.x, p.position.y, 8);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvasW, canvasH);

    ctx.font = `${CELL}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (let y = 0; y < viewH; y++) {
      for (let x = 0; x < viewW; x++) {
        const mx = ox + x;
        const my = oy + y;
        if (mx < 0 || my < 0 || mx >= map.width || my >= map.height) continue;
        const cell = map.cells[my][mx];
        const px = x * CELL;
        const py = y * CELL;
        if (!cell.visible && !cell.seen) {
          ctx.fillStyle = "#000";
          ctx.fillRect(px, py, CELL, CELL);
          continue;
        }
        if (cell.visible) {
          ctx.fillStyle = "#1a1a24";
          ctx.fillRect(px, py, CELL, CELL);
          ctx.fillStyle = cell.color;
          ctx.fillText(cell.glyph, px + CELL / 2, py + CELL / 2 + 1);
        } else if (cell.seen) {
          ctx.fillStyle = "#05050a";
          ctx.fillRect(px, py, CELL, CELL);
          ctx.fillStyle = "#333";
          ctx.fillText(cell.glyph, px + CELL / 2, py + CELL / 2 + 1);
        }
      }
    }

    const es = get(enemies);
    ctx.font = `bold ${CELL}px "JetBrains Mono", monospace`;
    for (const e of es) {
      if (e.isDead) continue;
      const sx = e.position.x - ox;
      const sy = e.position.y - oy;
      if (sx < 0 || sy < 0 || sx >= viewW || sy >= viewH) continue;
      const cell = map.cells[e.position.y][e.position.x];
      if (!cell.visible) continue;
      ctx.fillStyle = e.color;
      ctx.fillText(e.glyph, sx * CELL + CELL / 2, sy * CELL + CELL / 2 + 1);
      if (e.hp < e.maxHp) {
        const w = CELL - 2;
        ctx.fillStyle = "#000";
        ctx.fillRect(sx * CELL + 1, sy * CELL - 2, w, 2);
        ctx.fillStyle = e.isChampion ? "#a060ff" : e.isUnique ? "#ffd700" : "#ff3c3c";
        ctx.fillRect(sx * CELL + 1, sy * CELL - 2, w * (e.hp / e.maxHp), 2);
      }
    }

    {
      const sx = p.position.x - ox;
      const sy = p.position.y - oy;
      ctx.fillStyle = "#ffd700";
      ctx.fillText("@", sx * CELL + CELL / 2, sy * CELL + CELL / 2 + 1);
      const w = CELL - 2;
      ctx.fillStyle = "#000";
      ctx.fillRect(sx * CELL + 1, sy * CELL + CELL - 2, w, 2);
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(sx * CELL + 1, sy * CELL + CELL - 2, w * (p.hp / p.maxHp), 2);
    }
  }

  function renderMapOffscreen(map: any) {
    if (!mapCtx) return;
    mapCanvas!.width = map.width * 16;
    mapCanvas!.height = map.height * 16;
    mapCtx.fillStyle = "#000";
    mapCtx.fillRect(0, 0, mapCanvas!.width, mapCanvas!.height);
    mapCtx.font = `16px "JetBrains Mono", monospace`;
    mapCtx.textBaseline = "middle";
    mapCtx.textAlign = "center";
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const cell = map.cells[y][x];
        const px = x * 16;
        const py = y * 16;
        mapCtx.fillStyle = cell.color;
        mapCtx.fillText(cell.glyph, px + 8, py + 9);
      }
    }
  }

  function tick() {
    renderOnce();
    renderHandle = requestAnimationFrame(tick);
  }

  function onDpad(e: any) {
    const dir = e.detail.dir;
    const dx = dir === "left" ? -1 : dir === "right" ? 1 : 0;
    const dy = dir === "up" ? -1 : dir === "down" ? 1 : 0;
    if (dx || dy) movePlayer(dx, dy);
  }

  function onButton(e: any) {
    if (e.detail.index === BTN.START) {
      setRunning(false);
      location.update((l) => ({ ...l, isTown: true }));
      push("/town");
    }
  }

  onMount(() => {
    canvasEl = document.createElement("canvas");
    canvasEl.style.cssText = "display:block; image-rendering: pixelated; width: 100%; height: 100%;";
    containerEl.appendChild(canvasEl);
    ctx = canvasEl.getContext("2d")!;

    mapCanvas = document.createElement("canvas");
    mapCtx = mapCanvas.getContext("2d")!;

    recomputeViewport();
    renderOnce();
    renderHandle = requestAnimationFrame(tick);

    // React to resizes (orientation change, window resize, etc.)
    resizeObserver = new ResizeObserver(() => {
      recomputeViewport();
      lastMapHash = ""; // force re-render
    });
    resizeObserver.observe(containerEl);
    window.addEventListener("resize", recomputeViewport);
    window.addEventListener("orientationchange", recomputeViewport);

    window.addEventListener("gamepad:dpad", onDpad);
    window.addEventListener("gamepad:button", onButton);

    return () => {
      window.removeEventListener("gamepad:dpad", onDpad);
      window.removeEventListener("gamepad:button", onButton);
      window.removeEventListener("resize", recomputeViewport);
      window.removeEventListener("orientationchange", recomputeViewport);
    };
  });

  onDestroy(() => {
    cancelAnimationFrame(renderHandle);
    resizeObserver?.disconnect();
    setRunning(false);
  });
</script>

<div class="dungeon">
  <div class="hud">
    <div class="player-info">
      <div class="name">{$player.name}</div>
      <div class="class">Lv {$player.level} — {($player.classId || 'warrior').toUpperCase()}</div>
    </div>
    <div class="bars">
      <div class="bar-row">
        <span class="lab">HP</span>
        <div class="bar"><div class="fill hp" style="width:{$player.hp / $player.maxHp * 100}%"></div></div>
        <span class="val">{$player.hp}/{$player.maxHp}</span>
      </div>
      <div class="bar-row">
        <span class="lab">Mana</span>
        <div class="bar"><div class="fill mana" style="width:{$player.mana / $player.maxMana * 100}%"></div></div>
        <span class="val">{$player.mana}/{$player.maxMana}</span>
      </div>
      <div class="bar-row">
        <span class="lab">XP</span>
        <div class="bar"><div class="fill xp" style="width:{$player.xp / $player.xpNext * 100}%"></div></div>
        <span class="val">{$player.xp}/{$player.xpNext}</span>
      </div>
    </div>
    <div class="zone">
      <div class="zone-name">Buried Barracks</div>
      <div class="gold">⛁ {$player.gold}</div>
    </div>
  </div>

  <div class="play-area">
    <div bind:this={containerEl} class="canvas-host"></div>
    <div class="side-panel">
      <CombatLog />
    </div>
  </div>

  <ActionBar />

  {#if $pendingLoot}
    <LootModal />
  {/if}
</div>

<style>
  .dungeon {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: #000;
  }

  .hud {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
    gap: 16px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--bg-3);
    background: linear-gradient(180deg, rgba(20, 20, 28, 0.95) 0%, transparent 100%);
    flex-shrink: 0;
  }

  .player-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
  }

  .name {
    font-family: var(--font-display);
    font-size: clamp(14px, 1.6vw, 20px);
    color: var(--accent);
    letter-spacing: 0.08em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .class {
    font-family: var(--font-mono);
    font-size: clamp(10px, 1vw, 12px);
    color: var(--fg-2);
    letter-spacing: 0.1em;
  }

  .bars {
    display: flex;
    flex-direction: column;
    gap: 4px;
    justify-content: center;
    min-width: 0;
  }

  .bar-row {
    display: grid;
    grid-template-columns: 40px 1fr 80px;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: clamp(10px, 1vw, 12px);
  }

  .lab {
    color: var(--fg-2);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .val {
    color: var(--fg-0);
    text-align: right;
  }

  .bar {
    height: 6px;
    background: var(--bg-3);
    border-radius: 3px;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    transition: width 200ms;
  }

  .fill.hp  { background: linear-gradient(90deg, #aa2222 0%, #ff4444 100%); }
  .fill.mana{ background: linear-gradient(90deg, #2244aa 0%, #4488ff 100%); }
  .fill.xp  { background: linear-gradient(90deg, #aa8800 0%, #ffd700 100%); }

  .zone {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    min-width: 0;
  }

  .zone-name {
    font-family: var(--font-display);
    font-size: clamp(12px, 1.2vw, 16px);
    color: var(--fg-1);
    letter-spacing: 0.08em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .gold {
    font-family: var(--font-mono);
    font-size: clamp(11px, 1.1vw, 14px);
    color: var(--accent);
  }

  .play-area {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr minmax(280px, 360px);
    gap: 8px;
    padding: 8px;
    overflow: hidden;
    min-height: 0;
  }

  .canvas-host {
    background: #000;
    border: 1px solid var(--bg-3);
    overflow: hidden;
    min-width: 0;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .side-panel {
    background: var(--bg-1);
    border: 1px solid var(--bg-3);
    overflow: hidden;
    min-height: 0;
  }
</style>
