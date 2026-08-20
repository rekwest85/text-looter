<script lang="ts">
  import { pendingLoot, player, pushLog } from "../../core/state";
  import { RARITY_BY_ID, rarityClass } from "../../data/rarities";
  import { AFFIX_BY_ID, BASE_BY_ID } from "../../data/items";
  import { affixValueText } from "../../systems/loot";
  import { hapticNotification } from "../../platform/capacitor";

  function close() {
    pendingLoot.set(null);
  }

  function equip() {
    const item = $pendingLoot?.item;
    if (!item) return;
    const base = BASE_BY_ID[item.baseId];
    const slot = base.slot;
    player.update((p) => {
      // Unequip existing
      p.equipped[slot] = item;
      return p;
    });
    pushLog({ tick: 0, source: "system", color: "#ffd700", text: `Equipped ${item.name}` });
    hapticNotification("success");
    pendingLoot.set(null);
  }

  function stash() {
    const item = $pendingLoot?.item;
    if (!item) return;
    player.update((p) => {
      // Find first empty inventory slot
      const idx = p.inventory.findIndex((s) => s === null);
      if (idx >= 0) p.inventory[idx] = item;
      return p;
    });
    pushLog({ tick: 0, source: "system", color: "#888", text: `Stashed ${item.name}` });
    pendingLoot.set(null);
  }

  function sell() {
    const item = $pendingLoot?.item;
    if (!item) return;
    const gold = (item.rarity * 5) + (item.ilvl * 2);
    player.update((p) => { p.gold += gold; return p; });
    pushLog({ tick: 0, source: "system", color: "#ffd700", text: `Sold ${item.name} for ${gold}g` });
    pendingLoot.set(null);
  }

  $: item = $pendingLoot?.item;
  $: base = item ? BASE_BY_ID[item.baseId] : null;
  $: rdef = item ? RARITY_BY_ID[item.rarity] : null;
  $: rarityClassName = item ? `r-${item.rarity}` : "";
</script>

<div class="modal-backdrop" onclick={close}>
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <div class="header">
      <div class="title-block">
        <div class="rarity {rarityClassName}">
          ✦ {item?.name} ✦
        </div>
        <div class="type">
          {base?.name} · {item?.rarity && RARITY_BY_ID[item.rarity].name} · iLvl {item?.ilvl}
        </div>
      </div>
      <div class="sockets">
        {#each Array(item?.sockets || 0) as _, i}
          <div class="socket empty"></div>
        {/each}
      </div>
    </div>

    <div class="affixes">
      {#if item && rdef && rdef.prefixSlots > 0}
        <div class="prefix-section">
          {#each item.prefixAffixes as pf}
            <div class="affix prefix">{affixValueText(pf)}</div>
          {/each}
          {#if item.prefixAffixes.length < rdef.prefixSlots}
            {#each Array(rdef.prefixSlots - item.prefixAffixes.length) as _}
              <div class="affix empty">—</div>
            {/each}
          {/if}
        </div>
      {/if}
      {#if item && rdef && rdef.suffixSlots > 0}
        <div class="suffix-section">
          {#each item.suffixAffixes as sf}
            <div class="affix suffix">{affixValueText(sf)}</div>
          {/each}
          {#if item.suffixAffixes.length < rdef.suffixSlots}
            {#each Array(rdef.suffixSlots - item.suffixAffixes.length) as _}
              <div class="affix empty">—</div>
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <div class="actions">
      <button class="btn primary focusable" onclick={equip} data-id="equip">⚔ Equip</button>
      <button class="btn focusable" onclick={stash} data-id="stash">⊟ Stash</button>
      <button class="btn focusable" onclick={sell} data-id="sell">⛁ Sell</button>
      <button class="btn focusable" onclick={close} data-id="close">✕ Close</button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal {
    background: linear-gradient(180deg, #14141c 0%, #05050a 100%);
    border: 2px solid var(--accent);
    border-radius: 8px;
    padding: 28px 36px;
    min-width: 600px;
    max-width: 800px;
    box-shadow: 0 0 60px rgba(255, 215, 0, 0.5), inset 0 0 40px rgba(255, 215, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--bg-3);
  }

  .rarity {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-align: center;
    margin-bottom: 6px;
  }

  .type {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--fg-2);
    text-align: center;
    letter-spacing: 0.1em;
  }

  .sockets {
    display: flex;
    gap: 8px;
  }

  .socket {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--bg-4);
    background: var(--bg-1);
  }

  .affixes {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 80px;
  }

  .affix {
    font-family: var(--font-mono);
    font-size: 14px;
    padding: 4px 8px;
  }

  .affix.prefix { color: #aaaaff; }
  .affix.suffix { color: #aaffaa; }
  .affix.empty { color: var(--bg-4); font-style: italic; }

  .actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 8px;
  }
</style>
