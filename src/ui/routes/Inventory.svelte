<script lang="ts">
  import { player, pendingLoot } from "../../core/state";
  import { EQUIP_SLOTS, BASE_BY_ID } from "../../data/items";
  import { RARITY_BY_ID } from "../../data/rarities";
  import { push } from "svelte-spa-router";

  function focusSlot(slotId: string, e: MouseEvent | FocusEvent) {
    const el = e.target as HTMLElement;
    document.querySelectorAll('.slot').forEach((s) => s.classList.remove('focused'));
    el.classList.add('focused');
  }

  function unequip(slotId: string) {
    player.update((p) => {
      const item = p.equipped[slotId];
      if (item) {
        const idx = p.inventory.findIndex((s) => s === null);
        if (idx >= 0) p.inventory[idx] = item;
        delete p.equipped[slotId];
      }
      return p;
    });
  }

  $: equipped = $player.equipped;
</script>

<div class="inventory">
  <div class="header">
    <button class="back focusable" on:click={() => push("/town")} data-id="back">◀ Back</button>
    <h1 class="title">Inventory</h1>
    <div class="gold">⛁ {$player.gold}</div>
  </div>

  <div class="content">
    <div class="equipment-panel">
      <h2 class="sub">Equipment</h2>
      <div class="equip-grid">
        {#each EQUIP_SLOTS as slot}
          {@const item = equipped[slot.id]}
          <div class="slot {item ? `r-${item.rarity}` : ''}" class:filled={!!item} class:focusable on:focus={(e) => focusSlot(slot.id, e)} on:click={() => item && unequip(slot.id)} data-id="slot-{slot.id}">
            <div class="slot-label">{slot.short}</div>
            {#if item}
              <div class="slot-item">
                {item.name}
              </div>
            {:else}
              <div class="slot-empty">—</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <div class="bag-panel">
      <h2 class="sub">Bag ({48 - $player.inventory.filter(i => i).length}/48 free)</h2>
      <div class="bag-grid">
        {#each $player.inventory as item, i}
          <div class="bag-slot focusable {item ? `r-${item.rarity}` : ''}" class:filled={!!item} data-id="bag-{i}">
            {#if item}
              <div class="bag-item">
                {item.name}
              </div>
            {:else}
              <div class="bag-empty">{i + 1}</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .inventory {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 16px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--bg-3);
    margin-bottom: 16px;
  }

  .back {
    background: var(--bg-2);
    border: 1px solid var(--bg-4);
    padding: 6px 12px;
    border-radius: 3px;
    cursor: pointer;
    color: var(--fg-0);
  }

  .title {
    flex: 1;
    font-size: 24px;
    color: var(--accent);
  }

  .gold {
    font-family: var(--font-mono);
    color: var(--accent);
    font-size: 14px;
  }

  .sub {
    font-size: 14px;
    color: var(--accent-soft);
    margin-bottom: 8px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    overflow: hidden;
  }

  .equipment-panel,
  .bag-panel {
    background: var(--bg-1);
    border: 1px solid var(--bg-3);
    border-radius: 4px;
    padding: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .equip-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
    overflow-y: auto;
  }

  .slot {
    aspect-ratio: 1;
    background: var(--bg-2);
    border: 1px solid var(--bg-3);
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 120ms;
    padding: 4px;
  }

  .slot:hover, .slot.focused {
    border-color: var(--accent);
    box-shadow: 0 0 8px var(--focus-ring-glow);
  }

  .slot.filled {
    background: var(--bg-3);
  }

  .slot-label {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--fg-3);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .slot-item {
    font-family: var(--font-mono);
    font-size: 10px;
    text-align: center;
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .slot-empty {
    color: var(--bg-4);
    font-size: 16px;
  }

  .bag-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
    overflow-y: auto;
  }

  .bag-slot {
    aspect-ratio: 1;
    background: var(--bg-2);
    border: 1px solid var(--bg-3);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 2px;
  }

  .bag-slot:hover, .bag-slot.focused {
    border-color: var(--accent);
  }

  .bag-item {
    font-family: var(--font-mono);
    font-size: 8px;
    text-align: center;
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .bag-empty {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--bg-4);
  }
</style>
