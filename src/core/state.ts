import { writable, derived, type Writable } from "svelte/store";
import type { Item, Rarity, EquipSlot, Enemy, CombatLogEntry, DungeonMap } from "./types";

/** Which screen we're on. */
export type Route =
  | "mainmenu"
  | "createchar"
  | "town"
  | "dungeon"
  | "stash"
  | "inventory"
  | "codex"
  | "settings";

export const route: Writable<Route> = writable("mainmenu");

/** Connection to Capacitor / native. */
export const isNative: Writable<boolean> = writable(false);

/** Gamepad connected (any index). */
export const gamepadConnected: Writable<boolean> = writable(false);

/** Currently pressed key (for UI hints). */
export const lastInput: Writable<string> = writable("");

/** Player state (Phase 1 placeholder). */
export interface PlayerState {
  name: string;
  classId: string;
  level: number;
  xp: number;
  xpNext: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  gold: number;
  position: { x: number; y: number };
  facing: "north" | "south" | "east" | "west";
  inventory: (Item | null)[];
  equipped: Partial<Record<EquipSlot, Item | null>>;
  paragonLevel: number;
  skillCooldowns: Record<string, number>;
  buffs: Array<{ id: string; name: string; ticks: number; icon: string }>;
}

export const player: Writable<PlayerState> = writable({
  name: "Wanderer",
  classId: "warrior",
  level: 1,
  xp: 0,
  xpNext: 100,
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  gold: 0,
  position: { x: 0, y: 0 },
  facing: "south",
  inventory: new Array(48).fill(null),
  equipped: {},
  paragonLevel: 0,
  skillCooldowns: {},
  buffs: [],
});

/** Current dungeon map (only set when in dungeon). */
export const dungeonMap: Writable<DungeonMap | null> = writable(null);

/** Enemies currently in the dungeon. */
export const enemies: Writable<Enemy[]> = writable([]);

/** Combat log. */
export const combatLog: Writable<CombatLogEntry[]> = writable([]);
let logIdCounter = 0;

export function pushLog(entry: Omit<CombatLogEntry, "id">) {
  combatLog.update((log) => {
    const next = [...log, { ...entry, id: logIdCounter++ }];
    // Trim to last 200 entries
    return next.slice(-200);
  });
}

/** Pending loot drop modal. */
export interface PendingLoot {
  item: Item;
  sourceLabel: string;
}
export const pendingLoot: Writable<PendingLoot | null> = writable(null);

/** Loot beam sparkle trigger (incremented to retrigger animation). */
export const beamTrigger: Writable<{ item: Item; t: number } | null> = writable(null);

/** Current zone / location. */
export interface LocationState {
  actId: number;
  zoneId: string;
  zoneName: string;
  biome: string;
  isTown: boolean;
}
export const location: Writable<LocationState> = writable({
  actId: 1,
  zoneId: "hollows_rest",
  zoneName: "Hollow's Rest",
  biome: "ashen",
  isTown: true,
});

/** Settings. */
export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  particlesEnabled: boolean;
  motionBlur: boolean;
  reduceMotion: boolean;
  colorblindMode: "none" | "protan" | "deutan" | "tritan";
  textSize: "small" | "medium" | "large";
  gamepadDeadzone: number;
  showTouchOverlay: boolean;
}
export const settings: Writable<GameSettings> = writable({
  musicVolume: 0.7,
  sfxVolume: 0.9,
  ambienceVolume: 0.5,
  particlesEnabled: true,
  motionBlur: false,
  reduceMotion: false,
  colorblindMode: "none",
  textSize: "medium",
  gamepadDeadzone: 0.2,
  showTouchOverlay: false,
});

/** Save metadata. */
export interface SaveSlot {
  id: number;
  name: string;
  classId: string;
  level: number;
  gold: number;
  lastPlayed: number;
  playTime: number;
  actId: number;
  zoneId: string;
}
export const saveSlots: Writable<SaveSlot[]> = writable([]);
