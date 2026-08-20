/**
 * Combat simulator — drives the 20-tick per second game loop.
 * Phase 0: simple melee auto-attack + AoE light attack on cooldown.
 */
import { get } from "svelte/store";
import { player, enemies, combatLog, pushLog, dungeonMap, pendingLoot, beamTrigger } from "../core/state";
import { makeRng, rollInt, chance } from "../core/rng";
import { generateLoot } from "./loot";
import { isWalkable } from "./procgen";
import type { Enemy, Item, DamageType } from "../core/types";

const TICK_RATE = 20; // ticks per second
let tickCounter = 0;
let autoTick = 0;        // player auto-attack timer
let skillTick = 0;       // skill cooldown timer
let enemyTick = 0;       // enemies attack timer
let rng = makeRng("combat-default");

let running = false;

export function startCombat() {
  rng = makeRng("combat-" + Date.now());
  tickCounter = 0;
  autoTick = 0;
  skillTick = 0;
  enemyTick = 0;
  running = true;
  loop();
}

export function stopCombat() {
  running = false;
}

function loop() {
  if (!running) return;
  setTimeout(() => {
    try {
      tick();
    } catch (e) {
      console.error("combat tick error", e);
    }
    loop();
  }, 1000 / TICK_RATE);
}

function tick() {
  tickCounter++;
  const p = get(player);
  const es = get(enemies);
  const map = get(dungeonMap);
  if (!map) return;

  // Player auto-attack
  autoTick++;
  if (autoTick >= 5) {
    autoTick = 0;
    playerAutoAttack(p, es);
  }

  // Skill
  skillTick++;
  if (skillTick >= 30) {
    skillTick = 0;
    playerSkill(p, es);
  }

  // Enemies attack
  enemyTick++;
  if (enemyTick >= 6) {
    enemyTick = 0;
    enemiesAttack(p, es);
  }

  // Process dead enemies
  processDead(es);
}

function playerAutoAttack(p: any, es: Enemy[]) {
  // Find nearest enemy in range
  const target = pickNearestInRange(p, es, 1);
  if (!target) return;

  const damage = rollInt(rng, 6, 12) + (p.level * 1);
  const isCrit = chance(rng, 0.1);
  const finalDmg = isCrit ? Math.floor(damage * 1.8) : damage;

  enemies.update((arr) => {
    const i = arr.findIndex((e) => e.uid === target.uid);
    if (i >= 0) {
      arr[i] = { ...arr[i], hp: Math.max(0, arr[i].hp - finalDmg) };
      if (arr[i].hp === 0) arr[i].isDead = true;
    }
    return arr;
  });

  pushLog({
    tick: tickCounter,
    source: "player",
    color: isCrit ? "#ffd700" : "#c8a878",
    text: isCrit
      ? `⚔ You crit ${target.name} for ${finalDmg} dmg (×1.8)`
      : `⚔ You hit ${target.name} for ${finalDmg} dmg`,
  });
}

function playerSkill(p: any, es: Enemy[]) {
  const targets = pickInRange(p, es, 3);
  if (targets.length === 0) return;
  const damage = rollInt(rng, 18, 28) + (p.level * 3);

  enemies.update((arr) => {
    for (const t of targets) {
      const i = arr.findIndex((e) => e.uid === t.uid);
      if (i >= 0) {
        arr[i] = { ...arr[i], hp: Math.max(0, arr[i].hp - damage) };
        if (arr[i].hp === 0) arr[i].isDead = true;
      }
    }
    return arr;
  });

  pushLog({
    tick: tickCounter,
    source: "player",
    color: "#88ffff",
    text: `⚡ Whirlwind hits ${targets.length} enemy(ies) for ${damage} dmg each`,
  });
}

function enemiesAttack(p: any, es: Enemy[]) {
  for (const e of es) {
    if (e.isDead) continue;
    const dx = Math.abs(e.position.x - p.position.x);
    const dy = Math.abs(e.position.y - p.position.y);
    if (dx + dy > 1) continue;
    const dmg = rollInt(rng, e.damageMin, e.damageMax);
    player.update((pl) => {
      pl.hp = Math.max(0, pl.hp - dmg);
      return pl;
    });
    pushLog({
      tick: tickCounter,
      source: "enemy",
      color: e.color,
      text: `${e.glyph} ${e.name} hits you for ${dmg} ${e.damageType.toUpperCase()} dmg`,
    });
  }
}

function pickNearestInRange(p: any, es: Enemy[], range: number): Enemy | null {
  let best: Enemy | null = null;
  let bestD = Infinity;
  for (const e of es) {
    if (e.isDead) continue;
    const d = Math.abs(e.position.x - p.position.x) + Math.abs(e.position.y - p.position.y);
    if (d <= range && d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}

function pickInRange(p: any, es: Enemy[], range: number): Enemy[] {
  return es.filter((e) => {
    if (e.isDead) return false;
    const d = Math.abs(e.position.x - p.position.x) + Math.abs(e.position.y - p.position.y);
    return d <= range;
  });
}

function processDead(es: Enemy[]) {
  for (const e of es) {
    if (!e.isDead) continue;
    if (e._lootProcessed) continue;
    e._lootProcessed = true;
    handleKill(e);
  }
}

function handleKill(e: Enemy) {
  // XP + gold
  const xp = 5 + (e.level * 3) * (e.isChampion ? 3 : e.isUnique ? 6 : 1);
  const gold = rollInt(rng, 1, 8) * (e.isChampion ? 3 : e.isUnique ? 8 : 1);
  player.update((p) => {
    p.xp += xp;
    p.gold += gold;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level++;
      p.xpNext = Math.floor(p.xpNext * 1.3);
      p.maxHp += 10;
      p.hp = p.maxHp;
      p.maxMana += 5;
      p.mana = p.maxMana;
      pushLog({
        tick: tickCounter,
        source: "system",
        color: "#ffd700",
        text: `★ Level up! You are now level ${p.level} ★`,
      });
    }
    return p;
  });

  pushLog({
    tick: tickCounter,
    source: "system",
    color: "#888",
    text: `${e.name} dies — +${xp} XP, +${gold} gold`,
  });

  // Loot drop?
  const dropChance = e.isBoss ? 1.0 : e.isUnique ? 0.95 : e.isChampion ? 0.55 : 0.18;
  if (chance(rng, dropChance)) {
    const item = generateLoot(`${e.uid}-${tickCounter}`, {
      itemLevel: e.level + 1,
      magicFind: 0,
      champion: e.isChampion,
      unique: e.isUnique,
      boss: e.isBoss,
    });
    deliverLoot(item, e.name);
  }
}

function deliverLoot(item: Item, sourceLabel: string) {
  pushLog({
    tick: tickCounter,
    source: "loot",
    rarity: item.rarity,
    text: `✦ ${item.name} dropped by ${sourceLabel} ✦`,
  });
  pendingLoot.set({ item, sourceLabel });
  beamTrigger.set({ item, t: Date.now() });
}

export function takeDamage(amount: number, type: DamageType) {
  player.update((p) => {
    p.hp = Math.max(0, p.hp - amount);
    return p;
  });
  pushLog({
    tick: tickCounter,
    source: "enemy",
    color: "#ff3c3c",
    text: `You take ${amount} ${type.toUpperCase()} damage`,
  });
}

export function movePlayer(dx: number, dy: number) {
  const p = get(player);
  const map = get(dungeonMap);
  if (!map) return;
  const nx = p.position.x + dx;
  const ny = p.position.y + dy;
  if (!isWalkable(map.cells, nx, ny)) return;

  // Check if any enemy occupies that cell
  const es = get(enemies);
  const blocker = es.find((e) => !e.isDead && e.position.x === nx && e.position.y === ny);
  if (blocker) {
    // Bump-attack: deal small damage
    const dmg = rollInt(rng, 3, 6);
    enemies.update((arr) => {
      const i = arr.findIndex((e) => e.uid === blocker.uid);
      if (i >= 0) {
        arr[i] = { ...arr[i], hp: Math.max(0, arr[i].hp - dmg) };
        if (arr[i].hp === 0) arr[i].isDead = true;
      }
      return arr;
    });
    pushLog({
      tick: tickCounter,
      source: "player",
      color: "#c8a878",
      text: `You bash ${blocker.name} for ${dmg} dmg`,
    });
    return;
  }

  player.update((pl) => {
    pl.position = { x: nx, y: ny };
    if (dx > 0) pl.facing = "east";
    else if (dx < 0) pl.facing = "west";
    else if (dy > 0) pl.facing = "south";
    else pl.facing = "north";
    return pl;
  });

  // Check for stairs down
  const cell = map.cells[ny][nx];
  if (cell.type === "stairs_down") {
    pushLog({
      tick: tickCounter,
      source: "system",
      color: "#ffd700",
      text: "▼ You descend deeper into the dungeon ▼",
    });
  }
}

export function setRunning(v: boolean) {
  running = v;
  if (v) startCombat();
}
