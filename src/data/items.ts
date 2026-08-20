/**
 * Base items — sample set for Phase 0.
 * Full ~100 base list will be added in Phase 2.
 */
import type { BaseItem, Affix } from "../core/types";

export const BASE_ITEMS: BaseItem[] = [
  // Weapons
  { id: "rusty_sword",     name: "Rusty Sword",      slot: "weapon", weaponType: "sword",  ilvl: 1,  implicits: ["weap_dmg_phys"], socketRange: [0, 2], budget: 10, dropWeight: 10 },
  { id: "short_sword",     name: "Short Sword",      slot: "weapon", weaponType: "sword",  ilvl: 1,  implicits: ["weap_dmg_phys"], socketRange: [0, 2], budget: 12, dropWeight: 8 },
  { id: "long_sword",      name: "Long Sword",       slot: "weapon", weaponType: "sword",  ilvl: 8,  implicits: ["weap_dmg_phys"], socketRange: [1, 3], budget: 18, dropWeight: 6 },
  { id: "great_sword",     name: "Great Sword",      slot: "weapon", weaponType: "sword",  ilvl: 15, implicits: ["weap_dmg_phys"], socketRange: [1, 4], budget: 28, dropWeight: 4 },
  { id: "war_axe",         name: "War Axe",          slot: "weapon", weaponType: "axe",    ilvl: 5,  implicits: ["weap_dmg_phys"], socketRange: [1, 3], budget: 16, dropWeight: 6 },
  { id: "maul",            name: "Maul",             slot: "weapon", weaponType: "mace",   ilvl: 10, implicits: ["weap_dmg_phys"], socketRange: [1, 3], budget: 20, dropWeight: 5 },
  { id: "short_bow",       name: "Short Bow",        slot: "weapon", weaponType: "bow",    ilvl: 3,  implicits: ["weap_dmg_phys"], socketRange: [0, 2], budget: 14, dropWeight: 6 },
  { id: "war_bow",         name: "War Bow",          slot: "weapon", weaponType: "bow",    ilvl: 12, implicits: ["weap_dmg_phys"], socketRange: [1, 3], budget: 22, dropWeight: 4 },
  { id: "oak_staff",       name: "Oak Staff",        slot: "weapon", weaponType: "staff",  ilvl: 1,  implicits: ["weap_dmg_phys"], socketRange: [1, 3], budget: 12, dropWeight: 6 },
  { id: "arcane_staff",    name: "Arcane Staff",     slot: "weapon", weaponType: "staff",  ilvl: 20, implicits: ["weap_dmg_phys", "weap_mana"], socketRange: [2, 4], budget: 32, dropWeight: 3 },
  { id: "iron_dagger",     name: "Iron Dagger",      slot: "weapon", weaponType: "dagger", ilvl: 1,  implicits: ["weap_dmg_phys"], socketRange: [0, 1], budget: 8, dropWeight: 8 },
  { id: "spear",           name: "Spear",            slot: "weapon", weaponType: "spear",  ilvl: 6,  implicits: ["weap_dmg_phys"], socketRange: [1, 2], budget: 14, dropWeight: 6 },

  // Offhands
  { id: "wood_shield",     name: "Wood Shield",      slot: "offhand", offhandType: "shield", ilvl: 1,  implicits: ["armor_block"], socketRange: [0, 2], budget: 10, dropWeight: 8 },
  { id: "iron_shield",     name: "Iron Shield",      slot: "offhand", offhandType: "shield", ilvl: 12, implicits: ["armor_block"], socketRange: [1, 3], budget: 20, dropWeight: 5 },
  { id: "quiver",          name: "Quiver",           slot: "offhand", offhandType: "quiver", ilvl: 1,  implicits: ["quiver_damage"], socketRange: [0, 2], budget: 10, dropWeight: 6 },
  { id: "arcane_focus",    name: "Arcane Focus",     slot: "offhand", offhandType: "focus",  ilvl: 8,  implicits: ["armor_mana"], socketRange: [1, 3], budget: 18, dropWeight: 5 },

  // Helmets
  { id: "leather_cap",     name: "Leather Cap",      slot: "helmet", ilvl: 1,  implicits: ["armor_phys"], socketRange: [0, 1], budget: 8, dropWeight: 8 },
  { id: "iron_helm",       name: "Iron Helm",        slot: "helmet", ilvl: 8,  implicits: ["armor_phys"], socketRange: [1, 2], budget: 16, dropWeight: 5 },
  { id: "great_helm",      name: "Great Helm",       slot: "helmet", ilvl: 18, implicits: ["armor_phys"], socketRange: [1, 3], budget: 26, dropWeight: 3 },

  // Face
  { id: "cloth_mask",      name: "Cloth Mask",       slot: "face",  ilvl: 1,  implicits: [], socketRange: [0, 1], budget: 6, dropWeight: 6 },
  { id: "iron_visor",      name: "Iron Visor",       slot: "face",  ilvl: 12, implicits: ["armor_phys"], socketRange: [0, 2], budget: 14, dropWeight: 4 },

  // Shoulders
  { id: "cloth_pauldrons", name: "Cloth Pauldrons",  slot: "shoulders", ilvl: 1, implicits: ["armor_phys"], socketRange: [0, 1], budget: 6, dropWeight: 6 },
  { id: "iron_pauldrons",  name: "Iron Pauldrons",   slot: "shoulders", ilvl: 10, implicits: ["armor_phys"], socketRange: [1, 2], budget: 14, dropWeight: 4 },

  // Chest
  { id: "leather_vest",    name: "Leather Vest",     slot: "chest", ilvl: 1,  implicits: ["armor_phys"], socketRange: [0, 2], budget: 12, dropWeight: 8 },
  { id: "chainmail",       name: "Chainmail",        slot: "chest", ilvl: 6,  implicits: ["armor_phys"], socketRange: [1, 3], budget: 20, dropWeight: 6 },
  { id: "plate_armor",     name: "Plate Armor",      slot: "chest", ilvl: 14, implicits: ["armor_phys"], socketRange: [2, 4], budget: 30, dropWeight: 4 },

  // Belt
  { id: "rope_belt",       name: "Rope Belt",        slot: "belt", ilvl: 1,  implicits: [], socketRange: [0, 1], budget: 6, dropWeight: 6 },
  { id: "war_belt",        name: "War Belt",         slot: "belt", ilvl: 10, implicits: ["armor_phys"], socketRange: [0, 2], budget: 14, dropWeight: 4 },

  // Pants
  { id: "cloth_pants",     name: "Cloth Pants",      slot: "pants", ilvl: 1,  implicits: ["armor_phys"], socketRange: [0, 1], budget: 8, dropWeight: 6 },
  { id: "iron_greaves",    name: "Iron Greaves",     slot: "pants", ilvl: 10, implicits: ["armor_phys"], socketRange: [1, 2], budget: 16, dropWeight: 4 },

  // Boots
  { id: "leather_boots",   name: "Leather Boots",    slot: "boots", ilvl: 1,  implicits: ["armor_phys"], socketRange: [0, 1], budget: 8, dropWeight: 6 },
  { id: "iron_boots",      name: "Iron Boots",       slot: "boots", ilvl: 8,  implicits: ["armor_phys"], socketRange: [1, 2], budget: 16, dropWeight: 4 },
  { id: "swift_boots",     name: "Swift Boots",      slot: "boots", ilvl: 16, implicits: ["armor_phys", "boots_speed"], socketRange: [1, 2], budget: 22, dropWeight: 3 },

  // Gloves
  { id: "cloth_gloves",    name: "Cloth Gloves",     slot: "gloves", ilvl: 1,  implicits: ["armor_phys"], socketRange: [0, 1], budget: 6, dropWeight: 6 },
  { id: "iron_gauntlets",  name: "Iron Gauntlets",   slot: "gloves", ilvl: 12, implicits: ["armor_phys"], socketRange: [1, 2], budget: 16, dropWeight: 4 },

  // Rings
  { id: "copper_ring",     name: "Copper Ring",      slot: "ring1", ilvl: 1,  implicits: [], socketRange: [0, 1], budget: 6, dropWeight: 8 },
  { id: "silver_ring",     name: "Silver Ring",      slot: "ring2", ilvl: 8,  implicits: [], socketRange: [0, 1], budget: 12, dropWeight: 5 },
  { id: "gold_ring",       name: "Gold Ring",        slot: "ring1", ilvl: 20, implicits: [], socketRange: [0, 2], budget: 20, dropWeight: 3 },

  // Amulet
  { id: "bone_amulet",     name: "Bone Amulet",      slot: "amulet", ilvl: 1,  implicits: [], socketRange: [0, 1], budget: 8, dropWeight: 6 },
  { id: "crystal_amulet",  name: "Crystal Amulet",   slot: "amulet", ilvl: 18, implicits: ["amulet_mana"], socketRange: [1, 2], budget: 18, dropWeight: 3 },

  // Cape
  { id: "torn_cape",       name: "Torn Cape",        slot: "cape",  ilvl: 1,  implicits: [], socketRange: [0, 1], budget: 6, dropWeight: 6 },
  { id: "war_cape",        name: "War Cape",         slot: "cape",  ilvl: 15, implicits: ["cape_resist"], socketRange: [1, 2], budget: 16, dropWeight: 4 },

  // Bracer
  { id: "leather_bracer",  name: "Leather Bracer",   slot: "bracer", ilvl: 1,  implicits: [], socketRange: [0, 1], budget: 6, dropWeight: 6 },
  { id: "iron_bracer",     name: "Iron Bracer",      slot: "bracer", ilvl: 10, implicits: ["armor_phys"], socketRange: [1, 2], budget: 14, dropWeight: 4 },
];

export const BASE_BY_ID: Record<string, BaseItem> = Object.fromEntries(
  BASE_ITEMS.map((b) => [b.id, b])
);

// ─────────────────────────────────────────────────────────────────────────────
// Sample affix pool (Phase 0 demonstrates the system)
// ─────────────────────────────────────────────────────────────────────────────

export const AFFIXES: Affix[] = [
  // Prefixes
  { id: "goldfind",         kind: "prefix", name: "Plundering",   tier: 1, ilvl: 1, rolls: [{ min: 1, max: 5 }, { min: 6, max: 10 }, { min: 11, max: 20 }, { min: 21, max: 30 }, { min: 31, max: 45 }, { min: 46, max: 60 }, { min: 61, max: 80 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "phys_pct_phys",    kind: "prefix", name: "Heavy",        tier: 1, ilvl: 1, rolls: [{ min: 5, max: 10 }, { min: 11, max: 20 }, { min: 21, max: 35 }, { min: 36, max: 50 }, { min: 51, max: 70 }, { min: 71, max: 90 }, { min: 91, max: 120 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "of_power",         kind: "prefix", name: "Cruel",        tier: 1, ilvl: 1, rolls: [{ min: 3, max: 8 }, { min: 9, max: 18 }, { min: 19, max: 32 }, { min: 33, max: 50 }, { min: 51, max: 75 }, { min: 76, max: 100 }, { min: 101, max: 150 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "fiery",            kind: "prefix", name: "Fiery",        tier: 1, ilvl: 8, rolls: [{ min: 1, max: 6 }, { min: 7, max: 14 }, { min: 15, max: 25 }, { min: 26, max: 40 }, { min: 41, max: 60 }, { min: 61, max: 90 }, { min: 91, max: 130 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "frozen",           kind: "prefix", name: "Frozen",       tier: 1, ilvl: 8, rolls: [{ min: 1, max: 6 }, { min: 7, max: 14 }, { min: 15, max: 25 }, { min: 26, max: 40 }, { min: 41, max: 60 }, { min: 61, max: 90 }, { min: 91, max: 130 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "lightning",        kind: "prefix", name: "Thunderous",   tier: 1, ilvl: 12, rolls: [{ min: 1, max: 6 }, { min: 7, max: 14 }, { min: 15, max: 25 }, { min: 26, max: 40 }, { min: 41, max: 60 }, { min: 61, max: 90 }, { min: 91, max: 130 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "venom",            kind: "prefix", name: "Venomous",     tier: 1, ilvl: 12, rolls: [{ min: 1, max: 6 }, { min: 7, max: 14 }, { min: 15, max: 25 }, { min: 26, max: 40 }, { min: 41, max: 60 }, { min: 61, max: 90 }, { min: 91, max: 130 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "holy",             kind: "prefix", name: "Holy",         tier: 1, ilvl: 18, rolls: [{ min: 1, max: 6 }, { min: 7, max: 14 }, { min: 15, max: 25 }, { min: 26, max: 40 }, { min: 41, max: 60 }, { min: 61, max: 90 }, { min: 91, max: 130 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "shadow",           kind: "prefix", name: "Shadow",       tier: 1, ilvl: 18, rolls: [{ min: 1, max: 6 }, { min: 7, max: 14 }, { min: 15, max: 25 }, { min: 26, max: 40 }, { min: 41, max: 60 }, { min: 61, max: 90 }, { min: 91, max: 130 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "voidbind",         kind: "prefix", name: "Void-touched", tier: 1, ilvl: 28, rolls: [{ min: 1, max: 6 }, { min: 7, max: 14 }, { min: 15, max: 25 }, { min: 26, max: 40 }, { min: 41, max: 60 }, { min: 61, max: 90 }, { min: 91, max: 130 }].map((r, i) => ({ min: r.min, max: r.max })) },

  // Suffixes
  { id: "of_life",          kind: "suffix", name: "of the Bear",  tier: 1, ilvl: 1,  rolls: [{ min: 5, max: 10 }, { min: 11, max: 20 }, { min: 21, max: 35 }, { min: 36, max: 55 }, { min: 56, max: 80 }, { min: 81, max: 110 }, { min: 111, max: 150 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "of_mana",          kind: "suffix", name: "of the Owl",   tier: 1, ilvl: 1,  rolls: [{ min: 3, max: 8 }, { min: 9, max: 18 }, { min: 19, max: 32 }, { min: 33, max: 50 }, { min: 51, max: 75 }, { min: 76, max: 100 }, { min: 101, max: 140 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "of_resist",        kind: "suffix", name: "of the Ward",  tier: 1, ilvl: 8,  rolls: [{ min: 1, max: 3 }, { min: 4, max: 6 }, { min: 7, max: 10 }, { min: 11, max: 15 }, { min: 16, max: 22 }, { min: 23, max: 30 }, { min: 31, max: 40 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "of_speed",         kind: "suffix", name: "of the Hawk",  tier: 1, ilvl: 12, rolls: [{ min: 1, max: 3 }, { min: 4, max: 6 }, { min: 7, max: 10 }, { min: 11, max: 15 }, { min: 16, max: 22 }, { min: 23, max: 30 }, { min: 31, max: 40 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "of_crit",          kind: "suffix", name: "of Precision", tier: 1, ilvl: 18, rolls: [{ min: 1, max: 2 }, { min: 3, max: 5 }, { min: 6, max: 8 }, { min: 9, max: 12 }, { min: 13, max: 16 }, { min: 17, max: 22 }, { min: 23, max: 30 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "of_revenge",       kind: "suffix", name: "of Thorns",    tier: 1, ilvl: 14, rolls: [{ min: 1, max: 5 }, { min: 6, max: 12 }, { min: 13, max: 20 }, { min: 21, max: 32 }, { min: 33, max: 48 }, { min: 49, max: 65 }, { min: 66, max: 90 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "of_leech",         kind: "suffix", name: "of the Vampire", tier: 1, ilvl: 20, rolls: [{ min: 1, max: 1 }, { min: 2, max: 3 }, { min: 4, max: 5 }, { min: 6, max: 8 }, { min: 9, max: 11 }, { min: 12, max: 15 }, { min: 16, max: 20 }].map((r, i) => ({ min: r.min, max: r.max })) },
  { id: "of_iq",            kind: "suffix", name: "of the Sage",  tier: 1, ilvl: 24, rolls: [{ min: 1, max: 2 }, { min: 3, max: 5 }, { min: 6, max: 10 }, { min: 11, max: 18 }, { min: 19, max: 28 }, { min: 29, max: 40 }, { min: 41, max: 55 }].map((r, i) => ({ min: r.min, max: r.max })) },
];

export const AFFIX_BY_ID: Record<string, Affix> = Object.fromEntries(
  AFFIXES.map((a) => [a.id, a])
);

// ─────────────────────────────────────────────────────────────────────────────
// Slot display info
// ─────────────────────────────────────────────────────────────────────────────

export const EQUIP_SLOTS: Array<{ id: string; label: string; short: string }> = [
  { id: "helmet",    label: "Helmet",     short: "Hlm" },
  { id: "face",      label: "Face",       short: "Fce" },
  { id: "shoulders", label: "Shoulders",  short: "Shl" },
  { id: "chest",     label: "Chest",      short: "Cht" },
  { id: "belt",      label: "Belt",       short: "Blt" },
  { id: "pants",     label: "Pants",      short: "Pnt" },
  { id: "boots",     label: "Boots",      short: "Bts" },
  { id: "gloves",    label: "Gloves",     short: "Glv" },
  { id: "ring1",     label: "Ring 1",     short: "Rg1" },
  { id: "ring2",     label: "Ring 2",     short: "Rg2" },
  { id: "amulet",    label: "Amulet",     short: "Aml" },
  { id: "weapon",    label: "Weapon",     short: "Wpn" },
  { id: "offhand",   label: "Off-Hand",   short: "Ofh" },
  { id: "cape",      label: "Cape",       short: "Cap" },
  { id: "bracer",    label: "Bracer",     short: "Brc" },
  { id: "rune1",     label: "Rune 1",     short: "Rn1" },
  { id: "rune2",     label: "Rune 2",     short: "Rn2" },
  { id: "gem1",      label: "Gem 1",      short: "Gm1" },
  { id: "gem2",      label: "Gem 2",      short: "Gm2" },
  { id: "artifact",  label: "Artifact",   short: "Art" },
];
