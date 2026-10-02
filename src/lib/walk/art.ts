import { TILE_W } from "./constants";

/** Deterministic PRNG so SSR and client agree and art is stable between reloads. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const OUTLINE = {
  stroke: "var(--forest)",
  strokeOpacity: 0.7,
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const HARMONICS = [2, 3, 5, 8, 13]; // integers => the silhouette is exactly periodic over `width`
const WEIGHTS = [1, 0.62, 0.4, 0.24, 0.14];

export interface Hills {
  d: string;
  yAt: (x: number) => number;
}

/**
 * A closed hill silhouette that tiles seamlessly: y(0) === y(width) by construction.
 * `top` is the mean ridge height in layer coordinates; `bottom` closes the polygon.
 */
export function hills(seed: number, top: number, amp: number, bottom: number, width = TILE_W): Hills {
  const r = rng(seed);
  const phases = HARMONICS.map(() => r() * Math.PI * 2);
  const yAt = (x: number) => {
    let y = top;
    for (let i = 0; i < HARMONICS.length; i++) {
      y -= amp * WEIGHTS[i] * Math.sin((2 * Math.PI * HARMONICS[i] * x) / width + phases[i]);
    }
    return y;
  };
  const step = 40;
  let d = "";
  for (let x = 0; x <= width; x += step) d += `${x ? "L" : "M"}${x} ${yAt(x).toFixed(1)}`;
  d += `L${width} ${bottom}L0 ${bottom}Z`;
  return { d, yAt };
}

/** Scatter x positions along a tile with jittered spacing. */
export function scatter(seed: number, min: number, max: number, width = TILE_W): number[] {
  const r = rng(seed);
  const out: number[] = [];
  let x = r() * max;
  while (x < width) {
    out.push(Math.round(x));
    x += min + r() * (max - min);
  }
  return out;
}

/** Grass tuft: `blades` slightly right-leaning blades from (0,0), tallest in the middle. */
export function tuftPath(blades: number, h: number, seed: number): string {
  const r = rng(seed);
  let d = "";
  for (let i = 0; i < blades; i++) {
    const x = (i - (blades - 1) / 2) * 7;
    const bh = h * (0.55 + 0.45 * (1 - Math.abs(i - (blades - 1) / 2) / blades)) * (0.85 + r() * 0.3);
    const lean = 6 + r() * 8; // plants lean right (style rule 6)
    d += `M${x - 3} 0Q${x} ${-bh * 0.6} ${x + lean} ${-bh}Q${x + 3} ${-bh * 0.5} ${x + 3} 0Z`;
  }
  return d;
}
