/**
 * Seeded RNG — sfc32 (Small Fast Counting).
 * Produces reproducible sequences from a string seed.
 * Same seed in any browser / device = same outputs.
 */

// Hash a string into a 32-bit uint
function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

export function seedFromString(seed: string): [number, number, number, number] {
  const a = hashString(seed + ":a");
  const b = hashString(seed + ":b");
  const c = hashString(seed + ":c");
  const d = hashString(seed + ":d");
  return [a, b, c, d];
}

export function makeRng(seed: string): () => number {
  let [a, b, c, d] = seedFromString(seed);
  return function () {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (a + b | 0) + d | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export function rollInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function rollFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min;
}

/** Weighted random pick. weights need not sum to 1; they're treated as relative. */
export function pickWeighted<T>(rng: () => number, items: T[], weights: number[]): T {
  let total = 0;
  for (const w of weights) total += w;
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Pick a random element from a non-empty array. */
export function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/** Roll a 0..1 chance. */
export function chance(rng: () => number, p: number): boolean {
  return rng() < p;
}
