/**
 * Loot generator — produces an Item from a treasure class context.
 * Phase 0: simple weighted rarity roll + affix roll, deterministic via seed.
 */
import { makeRng, rollInt, chance, pickWeighted } from "../core/rng";
import { RARITY_LIST, rarityDef } from "../data/rarities";
import { BASE_ITEMS, BASE_BY_ID, AFFIXES, AFFIX_BY_ID } from "../data/items";
import type { Item, Rarity, AffixRoll, DamageType } from "../core/types";

let uidCounter = 1;

export function generateLoot(seed: string, opts: {
  itemLevel: number;
  magicFind: number;
  forceRarity?: Rarity;
  forceBaseId?: string;
  champion?: boolean;
  unique?: boolean;
  boss?: boolean;
}): Item {
  const rng = makeRng(seed);
  const ilvl = opts.itemLevel;
  const mf = (opts.magicFind ?? 0) / 100;

  // ── 1. Pick rarity ───────────────────────────────────────────────
  const eligibleRarities = RARITY_LIST.filter((r) => {
    // Higher rarities cap at tier 7, but ilvl gates affix availability
    return r.id <= Math.min(20, Math.max(1, Math.floor(ilvl / 4) + 4));
  });

  let rarity: Rarity;
  if (opts.forceRarity) {
    rarity = opts.forceRarity;
  } else {
    // Apply MF: shift probability mass upward
    const adjusted = eligibleRarities.map((r) => ({
      r,
      w: r.dropWeight * (r.id >= 5 ? 1 + mf * 0.5 : 1) * (opts.boss ? (r.id >= 8 ? 5 : 1) : 1) * (opts.unique ? (r.id >= 8 ? 3 : 1) : 1) * (opts.champion ? (r.id >= 5 ? 1.5 : 1) : 1),
    }));
    const result = pickWeighted(rng, adjusted.map((a) => a.r), adjusted.map((a) => a.w));
    rarity = result.id;
  }

  // ── 2. Pick base ────────────────────────────────────────────────
  const baseCandidates = opts.forceBaseId
    ? [BASE_BY_ID[opts.forceBaseId]].filter(Boolean)
    : BASE_ITEMS.filter((b) => b.ilvl <= ilvl + 3 && b.ilvl >= Math.max(1, ilvl - 8));
  if (baseCandidates.length === 0) {
    // Fallback
    baseCandidates.push(BASE_ITEMS[0]);
  }
  const base = pickWeighted(rng, baseCandidates, baseCandidates.map((b) => b.dropWeight));

  // ── 3. Build item ───────────────────────────────────────────────
  const rdef = rarityDef(rarity);
  const prefixCount = rdef.prefixSlots;
  const suffixCount = rdef.suffixSlots;

  // Roll prefixes
  const prefixAffixes: AffixRoll[] = [];
  for (let i = 0; i < prefixCount; i++) {
    const a = rollAffix(rng, "prefix", base, ilvl, rdef.tierCap);
    if (a) prefixAffixes.push(a);
  }
  const suffixAffixes: AffixRoll[] = [];
  for (let i = 0; i < suffixCount; i++) {
    const a = rollAffix(rng, "suffix", base, ilvl, rdef.tierCap);
    if (a) suffixAffixes.push(a);
  }

  // Quality bonus (0..20)
  const quality = rollInt(rng, 0, 20);

  // Sockets — roll within base range
  const [smin, smax] = base.socketRange;
  const sockets = rollInt(rng, smin, Math.max(smin, smax));

  // Implicit values (sample)
  const implicitValues: Record<string, number> = {};

  // Name generation
  const prefixName = prefixAffixes[0]?.name ? prefixAffixes[0].name + " " : "";
  const suffixName = suffixAffixes[0]?.name ? " " + suffixAffixes[0].name : "";
  const name = `${prefixName}${base.name}${suffixName}`;

  // Potential
  const potential = 20 + (ilvl * 5) + (rdef.id * 3);

  const item: Item = {
    uid: `item-${uidCounter++}-${Math.floor(rng() * 1e9)}`,
    baseId: base.id,
    rarity,
    prefixAffixes,
    suffixAffixes,
    implicitValues,
    sockets,
    quality,
    identified: true,
    ilvl,
    potential,
    name,
  };

  return item;
}

function rollAffix(rng: () => number, kind: "prefix" | "suffix", base: any, ilvl: number, tierCap: number): AffixRoll | null {
  const pool = AFFIXES.filter((a) => a.kind === kind && a.ilvl <= ilvl);
  if (pool.length === 0) return null;
  const a = pool[rollInt(rng, 0, pool.length - 1)];
  const tier = Math.min(tierCap, 7 - Math.max(0, Math.floor((ilvl - a.ilvl) / 6)));
  const tierIdx = Math.max(0, Math.min(6, tier - 1));
  const range = a.rolls[tierIdx];
  const value = rollInt(rng, range.min, range.max);
  return { affixId: a.id, value, tier };
}

export function affixValueText(roll: AffixRoll): string {
  const a = AFFIX_BY_ID[roll.affixId];
  if (!a) return `+${roll.value}`;
  return formatAffix(a.id, roll.value);
}

function formatAffix(id: string, value: number): string {
  switch (id) {
    case "goldfind":    return `+${value}% Gold Find`;
    case "phys_pct_phys": return `+${value}% Physical Damage`;
    case "of_power":    return `+${value} Damage`;
    case "fiery":       return `+${value} Fire Damage`;
    case "frozen":      return `+${value} Frost Damage`;
    case "lightning":   return `+${value} Lightning Damage`;
    case "venom":       return `+${value} Poison Damage`;
    case "holy":        return `+${value} Holy Damage`;
    case "shadow":      return `+${value} Dark Damage`;
    case "voidbind":    return `+${value} Void Damage`;
    case "of_life":     return `+${value} Life`;
    case "of_mana":     return `+${value} Mana`;
    case "of_resist":   return `+${value}% All Resistances`;
    case "of_speed":    return `+${value}% Attack Speed`;
    case "of_crit":     return `+${value}% Critical Chance`;
    case "of_revenge":  return `+${value} Thorns`;
    case "of_leech":    return `+${value}% Life Leech`;
    case "of_iq":       return `+${value}% Magic Find`;
    default:            return `+${value}`;
  }
}
