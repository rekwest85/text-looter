/**
 * The 20-tier rarity table.
 * Color = hex used for names, borders, glow.
 * Glow = CSS color for outer glow.
 * DropWeight = relative weight in the loot table (higher = more common).
 */
import type { Rarity, RarityDef } from "../core/types";

export const RARITY_LIST: RarityDef[] = [
  { id:  1, name: "Worn",         short: "wrn", color: "#666666", glow: "rgba(102,102,102,0.3)", dropWeight: 40, prefixSlots: 0, suffixSlots: 0, tierCap: 0, hasBeam: false, hasRing: false, hasSparks: false, hasDistortion: false, hasCustomSting: false },
  { id:  2, name: "Common",       short: "com", color: "#bfbfbf", glow: "rgba(191,191,191,0.3)", dropWeight: 25, prefixSlots: 0, suffixSlots: 0, tierCap: 0, hasBeam: false, hasRing: false, hasSparks: false, hasDistortion: false, hasCustomSting: false },
  { id:  3, name: "Fine",         short: "fin", color: "#d4d4d4", glow: "rgba(212,212,212,0.4)", dropWeight: 15, prefixSlots: 0, suffixSlots: 0, tierCap: 0, hasBeam: false, hasRing: false, hasSparks: false, hasDistortion: false, hasCustomSting: false },
  { id:  4, name: "Superior",     short: "sup", color: "#e8e8e8", glow: "rgba(232,232,232,0.5)", dropWeight: 8, prefixSlots: 0, suffixSlots: 0, tierCap: 0, hasBeam: false, hasRing: false, hasSparks: false, hasDistortion: false, hasCustomSting: false },
  { id:  5, name: "Magic",        short: "mag", color: "#8888ff", glow: "rgba(136,136,255,0.65)",dropWeight: 5, prefixSlots: 1, suffixSlots: 1, tierCap: 3, hasBeam: true, hasRing: false, hasSparks: false, hasDistortion: false, hasCustomSting: false },
  { id:  6, name: "Rare",         short: "rar", color: "#ffff77", glow: "rgba(255,255,119,0.75)", dropWeight: 2.5, prefixSlots: 2, suffixSlots: 2, tierCap: 5, hasBeam: true, hasRing: true, hasSparks: false, hasDistortion: false, hasCustomSting: false },
  { id:  7, name: "Epic",         short: "epc", color: "#a060ff", glow: "rgba(160,96,255,0.85)", dropWeight: 1.0, prefixSlots: 3, suffixSlots: 3, tierCap: 6, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: false, hasCustomSting: false },
  { id:  8, name: "Legendary",    short: "leg", color: "#ff8a3c", glow: "rgba(255,138,60,0.9)", dropWeight: 0.4, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: false, hasCustomSting: false },
  { id:  9, name: "Mythic",       short: "myt", color: "#ff3c7a", glow: "rgba(255,60,122,0.95)", dropWeight: 0.15, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: false, hasCustomSting: false },
  { id: 10, name: "Ancestral",    short: "anc", color: "#3cffd0", glow: "rgba(60,255,208,0.95)", dropWeight: 0.06, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: false, hasCustomSting: false },
  { id: 11, name: "Voidtouched",  short: "vdt", color: "#9d3cff", glow: "rgba(157,60,255,1.0)", dropWeight: 0.025, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: true, hasCustomSting: false },
  { id: 12, name: "Celestial",    short: "cel", color: "#ffd700", glow: "rgba(255,215,0,1.0)", dropWeight: 0.010, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: false, hasCustomSting: true },
  { id: 13, name: "Infernal",     short: "inf", color: "#ff4422", glow: "rgba(255,68,34,0.95)", dropWeight: 0.005, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: false, hasCustomSting: true },
  { id: 14, name: "Frostforged",  short: "frs", color: "#7ce8ff", glow: "rgba(124,232,255,0.95)", dropWeight: 0.005, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: false, hasCustomSting: true },
  { id: 15, name: "Stormborn",    short: "stm", color: "#fff066", glow: "rgba(255,240,102,0.95)", dropWeight: 0.005, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: false, hasCustomSting: true },
  { id: 16, name: "Umbral",       short: "umb", color: "#bb88ff", glow: "rgba(187,136,255,1.0)", dropWeight: 0.002, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: true, hasCustomSting: true },
  { id: 17, name: "Radiant",      short: "rad", color: "#ffffff", glow: "rgba(255,255,255,1.0)", dropWeight: 0.001, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: true, hasCustomSting: true },
  { id: 18, name: "Eternal",      short: "etr", color: "#00ff95", glow: "rgba(0,255,149,1.0)", dropWeight: 0.0005, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: true, hasCustomSting: true },
  { id: 19, name: "Primordial",   short: "prm", color: "#ff00ff", glow: "rgba(255,0,255,1.0)", dropWeight: 0.0002, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: true, hasCustomSting: true },
  { id: 20, name: "The One",      short: "ONE", color: "#ffffff", glow: "rgba(255,255,255,1.0)", dropWeight: 0.00005, prefixSlots: 3, suffixSlots: 3, tierCap: 7, hasBeam: true, hasRing: true, hasSparks: true, hasDistortion: true, hasCustomSting: true },
];

export const RARITY_BY_ID: Record<number, RarityDef> = Object.fromEntries(
  RARITY_LIST.map((r) => [r.id, r])
);

export function rarityDef(r: Rarity): RarityDef {
  return RARITY_BY_ID[r];
}

export function rarityClass(r: Rarity): string {
  return `r-${r}`;
}

export function rarityColor(r: Rarity): string {
  return RARITY_BY_ID[r].color;
}

export function rarityName(r: Rarity): string {
  return RARITY_BY_ID[r].name;
}
