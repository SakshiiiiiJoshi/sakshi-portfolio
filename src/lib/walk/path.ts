import { PATH_W, WORLD_W } from "./constants";

export interface PathSample {
  x: number;
  y: number;
  angle: number;
}

/** Design-canvas y of the path centreline, keyed by progress. Tuned by eye in /world-lab. */
const KEYS: ReadonlyArray<readonly [number, number]> = [
  [0.0, 690], // flat, soft hill start
  [0.05, 684],
  [0.09, 668],
  [0.14, 676], // rolling meadow
  [0.19, 654],
  [0.24, 680],
  [0.3, 684], // flat garden clearing
  [0.37, 684],
  [0.43, 700],
  [0.48, 722], // dip at the stream
  [0.53, 706],
  [0.58, 670], // the climb
  [0.66, 632],
  [0.75, 596],
  [0.83, 584], // crest, flat campfire clearing
  [0.88, 590],
  [0.94, 632], // descent
  [1.0, 678], // pond bank
];

const SAMPLES = 600;
const SLOPE_SPAN = 64; // units either side used for the tangent
const MAX_ANGLE = 14;

// Keys live in progress space, but the path is a function of world x (x = p * WORLD_W),
// so the curve is x-monotone: the tangent can never flip.
const knots = KEYS.map(([p, y]) => [p * WORLD_W, y] as const);

function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

/** Centreline y at world x (design units). Clamped flat beyond the ends. */
function yAt(x: number): number {
  if (x <= knots[0][0]) return knots[0][1];
  const last = knots.length - 1;
  if (x >= knots[last][0]) return knots[last][1];
  let i = 0;
  while (knots[i + 1][0] < x) i++;
  const [x1, y1] = knots[i];
  const [x2, y2] = knots[i + 1];
  const y0 = knots[Math.max(i - 1, 0)][1];
  const y3 = knots[Math.min(i + 2, last)][1];
  return catmull(y0, y1, y2, y3, (x - x1) / (x2 - x1));
}

// Pre-sampled over [0, PATH_W]: sampling is a table lookup + lerp per frame.
const STEP = PATH_W / (SAMPLES - 1);
const ys = new Float32Array(SAMPLES);
for (let i = 0; i < SAMPLES; i++) ys[i] = yAt(i * STEP);

function lookupY(x: number): number {
  const f = Math.min(Math.max(x / STEP, 0), SAMPLES - 1);
  const i = Math.min(Math.floor(f), SAMPLES - 2);
  return ys[i] + (ys[i + 1] - ys[i]) * (f - i);
}

/** Centreline y at a world x (design units), table lookup. */
export const pathYAt = lookupY;

/**
 * Tortoise position on the path at `progress` (design units, world space).
 * `anchorX` is the tortoise's screen x in design units (viewport fraction / scale).
 * Angle is in degrees, clamped to +-14.
 */
export function getPathPoint(progress: number, anchorX: number): PathSample {
  const p = Math.min(Math.max(progress, 0), 1);
  const x = p * WORLD_W + anchorX;
  const y = lookupY(x);
  const slope = (lookupY(x + SLOPE_SPAN) - lookupY(x - SLOPE_SPAN)) / (2 * SLOPE_SPAN);
  const angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, (Math.atan(slope) * 180) / Math.PI));
  return { x, y, angle };
}

/** The path's `d` attribute, in world coordinates (single source of truth with the sampler). */
export const PATH_D = (() => {
  const n = 240;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * PATH_W;
    d += `${i ? "L" : "M"}${x.toFixed(0)} ${lookupY(x).toFixed(1)}`;
  }
  return d;
})();

/** Highest point of the ribbon, used to size the path layer. */
export const PATH_MIN_Y = Math.min(...Array.from(ys));
