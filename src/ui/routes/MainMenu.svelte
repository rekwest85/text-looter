<script lang="ts">
  import { onMount } from "svelte";
  import { route, saveSlots, gamepadConnected, isNative } from "../../core/state";
  import { db, listSaveSlots, newCharacter, deleteCharacter } from "../../core/save";
  import { push } from "svelte-spa-router";

  let slots: any[] = [];

  async function refresh() {
    slots = await listSaveSlots();
  }

  onMount(refresh);

  async function createNew() {
    push("/create");
  }

  async function continueSlot(slot: any) {
    push("/town");
  }

  async function overWriteOrCreate(classId: string) {
    await newCharacter("Wanderer", classId);
    await refresh();
    push("/town");
  }

  function settings() {
    push("/settings");
  }

  $: gamepadConnectedVal = $gamepadConnected;
</script>

<div class="main-menu">
  <div class="title-block">
    <h1 class="title game-title">Text Looter</h1>
    <p class="subtitle">A heavy-loot ARPG for handhelds</p>
  </div>

  <div class="menu-list">
    <button class="btn primary focusable" on:click={createNew} data-id="new">⚔ New Game</button>
    {#each slots.slice(0, 3) as slot}
      <button class="btn focusable" on:click={() => continueSlot(slot)} data-id="continue-{slot.id}">
        ▶ Continue — {slot.name} ▸ Lv {slot.level} ▸ Act {slot.actId}
      </button>
    {/each}
    <button class="btn focusable" on:click={settings} data-id="settings">⚙ Settings</button>
    {#if gamepadConnectedVal}
      <p class="hint">🎮 Gamepad connected</p>
    {:else}
      <p class="hint">Connect a gamepad or use keyboard (WASD + Enter)</p>
    {/if}
    {#if $isNative}
      <p class="hint">📱 Native build</p>
    {/if}
  </div>

  <div class="footer">
    <p>v0.0.0 — Phase 0 skeleton</p>
  </div>
</div>

<style>
  .main-menu {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    padding: 40px;
    background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.04) 0%, transparent 60%);
  }

  .title-block {
    text-align: center;
  }

  .game-title {
    font-size: 72px;
    background: linear-gradient(180deg, #ffd700 0%, #b8960f 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }

  .subtitle {
    font-family: var(--font-mono);
    color: var(--fg-2);
    font-size: 14px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .menu-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    min-width: 480px;
  }

  .hint {
    color: var(--fg-3);
    font-size: 12px;
    font-family: var(--font-mono);
    margin-top: 12px;
    letter-spacing: 0.08em;
  }

  .footer {
    position: absolute;
    bottom: 16px;
    color: var(--fg-3);
    font-family: var(--font-mono);
    font-size: 11px;
  }
</style>
