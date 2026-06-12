/**
 * Deterministic, seedable pseudo-random generator.
 *
 * The same generation logic must run in Node (when building a {@link Fingerprint})
 * and — for in-page noise — inside the injected script. Keep this dependency-free
 * and self-contained so it can be stringified and shipped to the page verbatim
 * (see {@link prngSource}).
 */

/** Hash an arbitrary string to a 32-bit integer (xmur3). */
export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** A small, fast, deterministic PRNG with a handful of convenience helpers. */
export class Rng {
  private state: number;

  constructor(seed: string | number) {
    this.state = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
    // Avoid a zero state which would collapse the generator.
    if (this.state === 0) this.state = 0x9e3779b9;
  }

  /** Next float in [0, 1) (mulberry32). */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Float in [min, max). */
  float(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** True with probability `p` (default 0.5). */
  bool(p = 0.5): boolean {
    return this.next() < p;
  }

  /** Pick one element from a non-empty array. */
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /** Fisher–Yates shuffle (returns a new array). */
  shuffle<T>(arr: readonly T[]): T[] {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** Pick `n` distinct elements (or all, if `n` exceeds length). */
  sample<T>(arr: readonly T[], n: number): T[] {
    return this.shuffle(arr).slice(0, Math.min(n, arr.length));
  }
}

/**
 * Generate a random seed string. Uses Node's `crypto.randomBytes` when
 * available and falls back to `Math.random`-derived hex otherwise.
 */
export function randomSeed(): string {
  try {
    const { randomBytes } = require('crypto') as typeof import('crypto');
    return randomBytes(16).toString('hex');
  } catch {
    let s = '';
    for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
  }
}

/**
 * Source code of a minimal mulberry32 RNG, for embedding inside the injected
 * page script. Returns a function body that, given a numeric seed, yields a
 * `() => number` generator. Kept byte-identical in spirit to {@link Rng.next}
 * so in-page noise matches the host's expectations.
 */
export function prngSource(): string {
  return `function(seed){var s=seed>>>0||0x9e3779b9;return function(){var t=(s+=0x6d2b79f5);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}`;
}

/** Source of the xmur3 string hash, for embedding in the page script. */
export function hashSource(): string {
  return `function(str){var h=1779033703^str.length;for(var i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=(h<<13)|(h>>>19);}h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return(h^=h>>>16)>>>0;}`;
}
