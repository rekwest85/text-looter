<script lang="ts">
  import { combatLog } from "../../core/state";
  import { RARITY_BY_ID } from "../../data/rarities";

  let viewport: HTMLDivElement;

  // Auto-scroll to bottom on new entries
  $: if (viewport && $combatLog) {
    queueMicrotask(() => {
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    });
  }
</script>

<div class="combat-log">
  <div class="header">
    <span class="title">Combat Log</span>
    <span class="count">{$combatLog.length}</span>
  </div>
  <div class="entries" bind:this={viewport}>
    {#each $combatLog as entry (entry.id)}
      <div class="entry" style="color: {entry.color || (entry.rarity ? RARITY_BY_ID[entry.rarity].color : '#888')}">
        <span class="source">
          {#if entry.source === 'player'}⚔{:else if entry.source === 'enemy'}{entry.text.split(' ')[0]}{:else if entry.source === 'system'}♪{:else if entry.source === 'loot'}✦{:else}·{/if}
        </span>
        <span class="text">{entry.text}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .combat-log {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--bg-1);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: linear-gradient(180deg, var(--bg-2) 0%, transparent 100%);
    border-bottom: 1px solid var(--bg-3);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .title {
    color: var(--accent-soft);
  }

  .count {
    color: var(--fg-3);
  }

  .entries {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.5;
  }

  .entries::-webkit-scrollbar {
    width: 6px;
  }

  .entries::-webkit-scrollbar-thumb {
    background: var(--bg-3);
    border-radius: 3px;
  }

  .entry {
    padding: 2px 0;
    display: flex;
    gap: 6px;
    align-items: flex-start;
    animation: fadeIn 200ms ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-4px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .source {
    width: 14px;
    text-align: center;
    flex-shrink: 0;
  }

  .text {
    flex: 1;
  }
</style>
