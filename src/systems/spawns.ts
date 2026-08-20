/**
 * Enemy spawner — populates a dungeon with monsters from a pool.
 * Phase 0: simple pool. Full pool + champion/unique logic in Phase 1.
 */
import { makeRng, rollInt, chance, pick } from "../core/rng";
import type { Enemy } from "../core/types";
import type { DungeonMap } from "./procgen";

interface EnemyTemplate {
  id: string;
  name: string;
  glyph: string;
  color: string;
  baseHp: number;
  baseDamage: number;
  attackSpeed: number;
  damageType: any;
  lootTier: number;
}

const POOL: EnemyTemplate[] = [
  { id: "flesh_hound",    name: "Flesh Hound",   glyph: "h", color: "#cc6666", baseHp: 20,  baseDamage: 3,  attackSpeed: 6,  damageType: "phys", lootTier: 1 },
  { id: "rotting_corpse", name: "Rotting Corpse",glyph: "z", color: "#88aa66", baseHp: 30,  baseDamage: 4,  attackSpeed: 7,  damageType: "poison", lootTier: 1 },
  { id: "skeleton_knight",name: "Skeleton Knight",glyph: "K", color: "#dddddd", baseHp: 45,  baseDamage: 6,  attackSpeed: 8,  damageType: "phys", lootTier: 2 },
  { id: "ash_wraith",     name: "Ash Wraith",    glyph: "w", color: "#aa6644", baseHp: 35,  baseDamage: 8,  attackSpeed: 7,  damageType: "fire", lootTier: 2 },
  { id: "frostbound",     name: "Frostbound",    glyph: "F", color: "#7ce8ff", baseHp: 60,  baseDamage: 9,  attackSpeed: 9,  damageType: "frost", lootTier: 3 },
  { id: "lightning_ape",  name: "Lightning Ape", glyph: "a", color: "#fff066", baseHp: 55,  baseDamage: 10, attackSpeed: 8,  damageType: "lightning", lootTier: 3 },
];

export function spawnEnemies(map: DungeonMap, floorLevel: number, seed: string): Enemy[] {
  const rng = makeRng(seed + ":enemies");
  const tier = Math.min(POOL.length, Math.floor(floorLevel / 2) + 1);
  const available = POOL.slice(0, Math.max(1, tier));
  const enemies: Enemy[] = [];

  for (const spawn of map.spawns) {
    const tpl = pick(rng, available);
    const hp = tpl.baseHp + (floorLevel * 8);
    const dmg = tpl.baseDamage + (floorLevel * 1.5);
    const isChampion = chance(rng, 0.06);
    const isUnique = chance(rng, 0.015);
    const enemyHp = hp * (isChampion ? 2.5 : isUnique ? 4 : 1);

    enemies.push({
      uid: `e-${spawn.x}-${spawn.y}-${Math.floor(rng() * 1e6)}`,
      baseId: tpl.id,
      name: (isChampion ? "Champion " : isUnique ? "Ancient " : "") + tpl.name,
      glyph: isChampion ? tpl.glyph.toUpperCase() : tpl.glyph,
      color: (isUnique ? "#ffd700" : isChampion ? "#a060ff" : tpl.color),
      level: floorLevel,
      hp: enemyHp,
      maxHp: enemyHp,
      position: { x: spawn.x, y: spawn.y },
      isChampion,
      isUnique,
      isBoss: false,
      damageType: tpl.damageType,
      damageMin: Math.max(1, Math.floor(dmg * 0.8)),
      damageMax: Math.ceil(dmg * 1.2),
      attackSpeed: tpl.attackSpeed,
      resistances: {},
      lootTable: tpl.id,
      isDead: false,
    });
  }
  return enemies;
}

/** Pre-baked boss for a floor. */
export function spawnBoss(map: DungeonMap, floorLevel: number, seed: string): Enemy {
  const rng = makeRng(seed + ":boss");
  const tpl = POOL[Math.min(POOL.length - 1, Math.floor(floorLevel / 3) + 2)];
  const hp = (tpl.baseHp + (floorLevel * 8)) * 6;
  const dmg = (tpl.baseDamage + (floorLevel * 1.5)) * 2;

  // Place boss at the stairs_down
  const pos = map.stairs ?? { x: map.width - 2, y: map.height - 2 };

  return {
    uid: `boss-${Math.floor(rng() * 1e6)}`,
    baseId: tpl.id,
    name: `The Hollow ${tpl.name}`,
    glyph: "B",
    color: "#ff3c7a",
    level: floorLevel + 3,
    hp,
    maxHp: hp,
    position: { x: pos.x, y: pos.y },
    isChampion: false,
    isUnique: true,
    isBoss: true,
    damageType: tpl.damageType,
    damageMin: Math.floor(dmg * 0.8),
    damageMax: Math.ceil(dmg * 1.2),
    attackSpeed: tpl.attackSpeed - 1,
    resistances: { phys: 25, fire: 25, frost: 25, lightning: 25 },
    lootTable: tpl.id,
    isDead: false,
  };
}
