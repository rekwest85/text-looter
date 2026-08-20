/**
 * Procedural dungeon map generator — Phase 0 simple BSP.
 * Full version (BSP + cellular automata + set pieces) ships in Phase 1.
 */
import { makeRng, rollInt, chance } from "../core/rng";
import type { DungeonMap, MapCell, TileType } from "../core/types";

const WALL: MapCell = { type: "wall", seen: false, visible: false, glyph: "#", color: "#3a3a4a" };
const FLOOR: MapCell = { type: "floor", seen: false, visible: false, glyph: ".", color: "#888" };
const DOOR: MapCell = { type: "door", seen: false, visible: false, glyph: "+", color: "#b8960f" };
const STAIRS_D: MapCell = { type: "stairs_down", seen: false, visible: false, glyph: "▼", color: "#ffd700" };
const STAIRS_U: MapCell = { type: "stairs_up", seen: false, visible: false, glyph: "▲", color: "#ffd700" };
const CHEST: MapCell = { type: "chest", seen: false, visible: false, glyph: "▣", color: "#b8960f" };
const SHRINE: MapCell = { type: "shrine", seen: false, visible: false, glyph: "✦", color: "#88ffff" };
const LORE: MapCell = { type: "lore", seen: false, visible: false, glyph: "✧", color: "#ffffff" };
const WATER: MapCell = { type: "water", seen: false, visible: false, glyph: "≈", color: "#4488ff" };

interface Rect { x: number; y: number; w: number; h: number; }

function splitRect(r: Rect, depth: number, rng: () => number): Rect[] {
  if (depth <= 0 || (r.w < 12 && r.h < 12)) return [r];
  const splitVert = r.w > r.h * 1.25 ? true : r.h > r.w * 1.25 ? false : chance(rng, 0.5);
  if (splitVert) {
    const minSplit = 7;
    if (r.w < minSplit * 2) return [r];
    const split = rollInt(rng, minSplit, r.w - minSplit);
    const left = { x: r.x, y: r.y, w: split, h: r.h };
    const right = { x: r.x + split, y: r.y, w: r.w - split, h: r.h };
    return [...splitRect(left, depth - 1, rng), ...splitRect(right, depth - 1, rng)];
  } else {
    const minSplit = 7;
    if (r.h < minSplit * 2) return [r];
    const split = rollInt(rng, minSplit, r.h - minSplit);
    const top = { x: r.x, y: r.y, w: r.w, h: split };
    const bot = { x: r.x, y: r.y + split, w: r.w, h: r.h - split };
    return [...splitRect(top, depth - 1, rng), ...splitRect(bot, depth - 1, rng)];
  }
}

function carveRoom(grid: MapCell[][], r: Rect) {
  for (let y = r.y + 1; y < r.y + r.h - 1; y++) {
    for (let x = r.x + 1; x < r.x + r.w - 1; x++) {
      grid[y][x] = { ...FLOOR };
    }
  }
}

function carveCorridor(grid: MapCell[][], a: { x: number; y: number }, b: { x: number; y: number }, rng: () => number) {
  const x1 = Math.min(a.x, b.x);
  const x2 = Math.max(a.x, b.x);
  const y1 = Math.min(a.y, b.y);
  const y2 = Math.max(a.y, b.y);
  if (chance(rng, 0.5)) {
    for (let x = x1; x <= x2; x++) grid[y1][x] = { ...FLOOR };
    for (let y = y1; y <= y2; y++) grid[y][x2] = { ...FLOOR };
  } else {
    for (let y = y1; y <= y2; y++) grid[y][x1] = { ...FLOOR };
    for (let x = x1; x <= x2; x++) grid[y2][x] = { ...FLOOR };
  }
}

function centerOf(r: Rect): { x: number; y: number } {
  return { x: Math.floor(r.x + r.w / 2), y: Math.floor(r.y + r.h / 2) };
}

export function generateDungeon(seed: string, level: number, opts?: { width?: number; height?: number }): DungeonMap {
  const w = opts?.width ?? 60;
  const h = opts?.height ?? 40;
  const rng = makeRng(seed);

  const grid: MapCell[][] = [];
  for (let y = 0; y < h; y++) {
    const row: MapCell[] = [];
    for (let x = 0; x < w; x++) row.push({ ...WALL });
    grid.push(row);
  }

  // Partition the area into rooms
  const outer: Rect = { x: 0, y: 0, w, h };
  const leaves = splitRect(outer, 4, rng);

  // Carve each leaf as a room (slightly smaller than the partition)
  const rooms: Array<Rect & { id: number }> = [];
  leaves.forEach((leaf, i) => {
    const rw = rollInt(rng, 4, Math.max(5, leaf.w - 2));
    const rh = rollInt(rng, 4, Math.max(5, leaf.h - 2));
    const rx = leaf.x + rollInt(rng, 0, Math.max(0, leaf.w - rw));
    const ry = leaf.y + rollInt(rng, 0, Math.max(0, leaf.h - rh));
    const room: Rect & { id: number } = { x: rx, y: ry, w: rw, h: rh, id: i };
    rooms.push(room);
    carveRoom(grid, room);
  });

  // Connect rooms with corridors (linear chain)
  for (let i = 1; i < rooms.length; i++) {
    const a = centerOf(rooms[i - 1]);
    const b = centerOf(rooms[i]);
    carveCorridor(grid, a, b, rng);
  }

  // Add a few extra loops
  for (let i = 0; i < Math.floor(rooms.length / 3); i++) {
    const a = rooms[rollInt(rng, 0, rooms.length - 1)];
    const b = rooms[rollInt(rng, 0, rooms.length - 1)];
    if (a === b) continue;
    carveCorridor(grid, centerOf(a), centerOf(b), rng);
  }

  // Place entrance (player start) — first room
  const startRoom = rooms[0];
  const start = centerOf(startRoom);
  grid[start.y][start.x] = { ...STAIRS_U };

  // Place exit (stairs down) — last room
  const endRoom = rooms[rooms.length - 1];
  const end = centerOf(endRoom);
  grid[end.y][end.x] = { ...STAIRS_D };

  // Place chests / shrines / lore in random rooms
  const chests: Array<{ x: number; y: number; id: number; lootTier: number }> = [];
  let chestId = 1;
  for (const r of rooms) {
    if (chance(rng, 0.4)) {
      const x = r.x + rollInt(rng, 1, r.w - 2);
      const y = r.y + rollInt(rng, 1, r.h - 2);
      if (grid[y][x].type === "floor") {
        grid[y][x] = { ...CHEST };
        chests.push({ x, y, id: chestId++, lootTier: level + rollInt(rng, -1, 2) });
      }
    }
    if (chance(rng, 0.15)) {
      const x = r.x + rollInt(rng, 1, r.w - 2);
      const y = r.y + rollInt(rng, 1, r.h - 2);
      if (grid[y][x].type === "floor") {
        grid[y][x] = { ...SHRINE };
      }
    }
    if (chance(rng, 0.1)) {
      const x = r.x + rollInt(rng, 1, r.w - 2);
      const y = r.y + rollInt(rng, 1, r.h - 2);
      if (grid[y][x].type === "floor") {
        grid[y][x] = { ...LORE };
      }
    }
  }

  // Spawn tables (we'll fill in enemies in systems/spawns)
  const spawns: Array<{ x: number; y: number; kind: string }> = [];
  for (const r of rooms) {
    if (r === startRoom) continue; // skip start room
    const n = rollInt(rng, 1, 4);
    for (let i = 0; i < n; i++) {
      const x = r.x + rollInt(rng, 1, r.w - 2);
      const y = r.y + rollInt(rng, 1, r.h - 2);
      if (grid[y][x].type === "floor") {
        spawns.push({ x, y, kind: level < 5 ? "flesh_hound" : "skeleton_knight" });
      }
    }
  }

  return {
    width: w,
    height: h,
    cells: grid,
    rooms: rooms.map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h, id: r.id })),
    spawns,
    chests,
    stairs: end,
    seed,
    level,
  };
}

export function isWalkable(grid: MapCell[][], x: number, y: number): boolean {
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return false;
  const t = grid[y][x].type;
  return t === "floor" || t === "door" || t === "stairs_down" || t === "stairs_up" || t === "chest" || t === "shrine" || t === "lore";
}

export function computeFOV(grid: MapCell[][], cx: number, cy: number, radius: number) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      grid[y][x].visible = false;
    }
  }
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) continue;
        if (hasLineOfSight(grid, cx, cy, x, y)) {
          grid[y][x].visible = true;
          grid[y][x].seen = true;
        }
      }
    }
  }
}

function hasLineOfSight(grid: MapCell[][], x0: number, y0: number, x1: number, y1: number): boolean {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0, y = y0;
  while (true) {
    if (x === x1 && y === y1) return true;
    if (!(x === x0 && y === y0)) {
      const t = grid[y][x].type;
      if (t === "wall") return false;
    }
    const e2 = err * 2;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}
