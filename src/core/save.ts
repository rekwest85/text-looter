/**
 * Save system — Dexie wrapper for IndexedDB.
 * Schema:
 *   characters: one per save slot (player + inventory + progress)
 *   settings: per-game settings (gamepad bindings, audio, etc.)
 *   codex: discoveries log
 *   ladder: best Pit depths, Crucible waves, etc.
 */
import Dexie, { type Table } from "dexie";
import type { Item, Rarity } from "./types";

export interface PersistedCharacter {
  id: number;            // 1..5 slot id
  name: string;
  classId: string;
  level: number;
  xp: number;
  paragonLevel: number;
  skillPoints: number;
  masteryPoints: number;
  gold: number;
  inventory: (Item | null)[];
  equipped: Record<string, Item | null>;
  stash: Record<string, Item | null>;
  unlockedActs: number[];
  unlockedZones: string[];
  codex: { monsters: string[]; items: string[]; locations: string[]; lore: string[] };
  reputation: Record<string, number>;
  playTime: number;
  createdAt: number;
  lastPlayedAt: number;
  currentZone: string;
  difficulty: "normal" | "nightmare" | "hell" | "eternal";
  style: string;
  position: { x: number; y: number };
}

export interface PersistedSettings {
  id: string;            // single row, id = "global"
  musicVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  particlesEnabled: boolean;
  motionBlur: boolean;
  reduceMotion: boolean;
  colorblindMode: string;
  textSize: string;
  gamepadBindings: Record<string, number>;
  gamepadDeadzone: number;
  showTouchOverlay: boolean;
}

export interface PersistedLadder {
  id: string;            // composite key
  kind: "pit" | "crucible" | "boss_kill" | "level";
  charId: number;
  score: number;
  detail: string;
  at: number;
}

class GameDb extends Dexie {
  characters!: Table<PersistedCharacter, number>;
  settings!: Table<PersistedSettings, string>;
  ladder!: Table<PersistedLadder, string>;

  constructor() {
    super("TextLooterRPG");
    this.version(1).stores({
      characters: "id, lastPlayedAt, level",
      settings: "id",
      ladder: "id, kind, score",
    });
  }
}

export const db = new GameDb();

export async function loadSettings(): Promise<PersistedSettings | null> {
  return (await db.settings.get("global")) ?? null;
}

export async function saveSettings(s: PersistedSettings): Promise<void> {
  await db.settings.put(s);
}

export async function listSaveSlots(): Promise<PersistedCharacter[]> {
  return await db.characters.orderBy("lastPlayedAt").reverse().toArray();
}

export async function loadCharacter(id: number): Promise<PersistedCharacter | null> {
  return (await db.characters.get(id)) ?? null;
}

export async function saveCharacter(c: PersistedCharacter): Promise<void> {
  c.lastPlayedAt = Date.now();
  await db.characters.put(c);
}

export async function deleteCharacter(id: number): Promise<void> {
  await db.characters.delete(id);
}

export async function newCharacter(name: string, classId: string): Promise<PersistedCharacter> {
  const existing = await db.characters.count();
  const id = existing + 1;
  const now = Date.now();
  const c: PersistedCharacter = {
    id,
    name,
    classId,
    level: 1,
    xp: 0,
    paragonLevel: 0,
    skillPoints: 0,
    masteryPoints: 0,
    gold: 0,
    inventory: new Array(48).fill(null),
    equipped: {},
    stash: {},
    unlockedActs: [1],
    unlockedZones: ["hollows_rest", "buried_barracks"],
    codex: { monsters: [], items: [], locations: [], lore: [] },
    reputation: { salvagers: 0, crown: 0, verdant: 0, void: 0 },
    playTime: 0,
    createdAt: now,
    lastPlayedAt: now,
    currentZone: "hollows_rest",
    difficulty: "normal",
    style: "",
    position: { x: 0, y: 0 },
  };
  await db.characters.put(c);
  return c;
}
