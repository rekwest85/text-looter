/**
 * Core types — the data model of the game.
 * All game state derives from these types.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Rarity
// ─────────────────────────────────────────────────────────────────────────────

export const RARITY = {
  WORN: 1,
  COMMON: 2,
  FINE: 3,
  SUPERIOR: 4,
  MAGIC: 5,
  RARE: 6,
  EPIC: 7,
  LEGENDARY: 8,
  MYTHIC: 9,
  ANCESTRAL: 10,
  VOIDTOUCHED: 11,
  CELESTIAL: 12,
  INFERNAL: 13,
  FROSTFORGED: 14,
  STORMBORN: 15,
  UMBRAL: 16,
  RADIANT: 17,
  ETERNAL: 18,
  PRIMORDIAL: 19,
  THE_ONE: 20,
} as const;

export type RarityKey = keyof typeof RARITY;
export type Rarity = (typeof RARITY)[RarityKey];

export interface RarityDef {
  id: Rarity;
  name: string;
  short: string;
  color: string;
  glow: string;
  dropWeight: number;
  prefixSlots: number;
  suffixSlots: number;
  tierCap: number;
  hasBeam: boolean;
  hasRing: boolean;
  hasSparks: boolean;
  hasDistortion: boolean;
  hasCustomSting: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Items
// ─────────────────────────────────────────────────────────────────────────────

export type EquipSlot =
  | "helmet" | "face"
  | "shoulders"
  | "chest" | "belt"
  | "pants" | "boots"
  | "gloves"
  | "ring1" | "ring2" | "amulet"
  | "weapon"
  | "offhand"
  | "cape" | "bracer"
  | "rune1" | "rune2" | "gem1" | "gem2"
  | "artifact";

export type WeaponType = "sword" | "axe" | "mace" | "bow" | "crossbow"
  | "staff" | "wand" | "dagger" | "spear" | "fist";

export type OffhandType = "shield" | "quiver" | "focus" | "totem" | "tome";

export type DamageType = "phys" | "fire" | "frost" | "lightning" | "poison"
  | "holy" | "dark" | "void";

export interface Affix {
  id: string;
  kind: "prefix" | "suffix";
  name: string;
  tier: number;          // 1..7
  ilvl: number;          // min item level
  rolls: Array<{ min: number; max: number }>;
  slot?: EquipSlot | EquipSlot[];  // null = any slot
  weights?: { [slot: string]: number };  // slot-specific multiplier
}

export interface BaseItem {
  id: string;
  name: string;
  slot: EquipSlot;
  weaponType?: WeaponType;
  offhandType?: OffhandType;
  ilvl: number;
  implicits: string[];   // affix ids always present
  socketRange: [number, number];
  budget: number;        // stat budget
  dropWeight: number;
}

export interface Item {
  uid: string;
  baseId: string;
  rarity: Rarity;
  prefixAffixes: AffixRoll[];
  suffixAffixes: AffixRoll[];
  implicitValues: { [affixId: string]: number };
  sockets: number;
  quality: number;       // 0..20
  identified: boolean;
  ilvl: number;
  potential: number;
  name: string;
}

export interface AffixRoll {
  affixId: string;
  value: number;
  tier: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Combat
// ─────────────────────────────────────────────────────────────────────────────

export interface Enemy {
  uid: string;
  baseId: string;
  name: string;
  glyph: string;          // ASCII char
  color: string;
  level: number;
  hp: number;
  maxHp: number;
  position: { x: number; y: number };
  isChampion: boolean;
  isUnique: boolean;
  isBoss: boolean;
  damageType: DamageType;
  damageMin: number;
  damageMax: number;
  attackSpeed: number;     // ticks per attack
  resistances: Partial<Record<DamageType, number>>;
  lootTable: string;
  isDead: boolean;
}

export interface CombatLogEntry {
  id: number;
  tick: number;
  source: "player" | "enemy" | "system" | "loot" | "env";
  text: string;
  color?: string;
  rarity?: Rarity;
}

// ─────────────────────────────────────────────────────────────────────────────
// Map
// ─────────────────────────────────────────────────────────────────────────────

export type TileType = "wall" | "floor" | "door" | "stairs_down" | "stairs_up"
  | "water" | "lava" | "chest" | "shrine" | "lore" | "exit";

export interface MapCell {
  type: TileType;
  seen: boolean;
  visible: boolean;
  glyph: string;
  color: string;
}

export interface DungeonMap {
  width: number;
  height: number;
  cells: MapCell[][];
  rooms: Array<{ x: number; y: number; w: number; h: number; id: number }>;
  spawns: Array<{ x: number; y: number; kind: string }>;
  chests: Array<{ x: number; y: number; id: number; lootTier: number }>;
  stairs: { x: number; y: number } | null;
  seed: string;
  level: number;
}
