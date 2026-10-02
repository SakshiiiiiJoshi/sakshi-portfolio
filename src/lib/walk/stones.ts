import { projects } from "@/content/projects";

/** The stream segment: progress range in which the camera is locked and progress selects a stone. */
export const STONE_SEG = { start: 0.43, end: 0.55 } as const;
const SEG_W = STONE_SEG.end - STONE_SEG.start;
/** Camera ramps either side of the segment (identity outside [RAMP_IN_START, RAMP_OUT_END]). */
const RAMP_IN_START = 0.38;
const RAMP_OUT_END = 0.6;
const LOCK_AT = 0.48;
/** Fraction of a stone cell the progress must overshoot before the index flips back (anti-jitter). */
const HYSTERESIS = 0.12;

/** Number of sub-stops in the segment: one per project plus the "More on GitHub" stone. */
export const stoneCount = (n: number = projects.length) => n + 1;

export const inSegment = (p: number) => p >= STONE_SEG.start && p <= STONE_SEG.end;

/** Continuous cell coordinate: 0 at segment start, N+1 at its end. */
const cell = (p: number, n: number) => ((p - STONE_SEG.start) / SEG_W) * stoneCount(n);

/**
 * Stone index for a progress value: -1 on the near bank, 0..n for stones (n is the "More" stone),
 * n+1 on the far bank. `prev` adds hysteresis so a boundary never flickers.
 */
export function stoneIndexAt(p: number, n: number, prev: number): number {
  const c = cell(p, n);
  const last = n + 1;
  if (prev >= -1 && prev <= last) {
    const lo = prev === -1 ? -Infinity : prev - HYSTERESIS;
    const hi = prev === last ? Infinity : prev + 1 + HYSTERESIS;
    if (c > lo && c < hi) return prev;
  }
  return Math.min(Math.max(Math.floor(c), -1), last);
}

/** Progress at the middle of stone i's cell (what keyboard / click / snap glide to). */
export function stoneCenter(i: number, n: number): number {
  const k = Math.min(Math.max(i, 0), n);
  return STONE_SEG.start + ((k + 0.5) / stoneCount(n)) * SEG_W;
}

/**
 * Camera progress. Identity away from the stream; across the segment the pan is held at the stream
 * (the tortoise hops instead). Cubic ramps match the identity slope on the outside edge and a zero
 * slope at the hold, so entering and leaving the stream never jerks, and every later stop keeps its
 * world position.
 */
export function camProgress(p: number): number {
  if (p <= RAMP_IN_START || p >= RAMP_OUT_END) return p;
  if (p < STONE_SEG.start) {
    const t = (p - RAMP_IN_START) / (STONE_SEG.start - RAMP_IN_START);
    return RAMP_IN_START + (LOCK_AT - RAMP_IN_START) * (0.5 * t + 2 * t * t - 1.5 * t * t * t);
  }
  if (p <= STONE_SEG.end) return LOCK_AT;
  const t = (p - STONE_SEG.end) / (RAMP_OUT_END - STONE_SEG.end);
  return LOCK_AT + (RAMP_OUT_END - LOCK_AT) * (2.5833 * t * t - 1.5833 * t * t * t);
}

// ---- stone geometry, in set viewBox units (x = 700 is where the tortoise stands on the near bank) ----
export const BANK_NEAR_X = 700;
export const WATER_FROM = 760;
const FIRST_X = 850;
const SPAN = 600; // x extent the stones may use
const MAX_STEP = 150;
/** Foot y of the tortoise on the near bank (path dip at the stream). */
export const BANK_Y = 722;

export interface StoneSpot {
  x: number;
  /** y of the stone's top surface (where the tortoise's foot rests). */
  y: number;
  rx: number;
  ry: number;
}

/** Stones 0..n (the last is "More"): spacing recalculates so N = 1…5 all fit the water. */
export function stoneLayout(n: number): StoneSpot[] {
  const total = stoneCount(n);
  const step = total > 1 ? Math.min(MAX_STEP, SPAN / (total - 1)) : 0;
  return Array.from({ length: total }, (_, i) => {
    const t = total > 1 ? i / (total - 1) : 0.5;
    const more = i === n;
    return {
      x: FIRST_X + i * step,
      y: BANK_Y + 6 - Math.sin(t * Math.PI) * 14, // gentle arc
      rx: more ? 46 : 58,
      ry: more ? 15 : 18,
    };
  });
}

/** Where the far bank starts (the tortoise lands here after the last stone). */
export function farBank(n: number): { x: number; y: number } {
  const last = stoneLayout(n)[n];
  return { x: last.x + 120, y: BANK_Y - 10 };
}

export const waterEnd = (n: number) => farBank(n).x - 30;

/** Tortoise offset from its anchor, in design units, for a stone index (-1 near bank, n+1 far bank). */
export function hopTarget(index: number, n: number): { x: number; y: number } {
  if (index < 0) return { x: 0, y: 0 };
  if (index > n) {
    const f = farBank(n);
    return { x: f.x - BANK_NEAR_X, y: f.y - BANK_Y };
  }
  const s = stoneLayout(n)[index];
  return { x: s.x - BANK_NEAR_X, y: s.y - BANK_Y - 4 };
}

/** After the segment the offset eases back to 0 while the camera catches up (p in end..RAMP_OUT_END). */
export function bankBlend(p: number): number {
  if (p <= STONE_SEG.end) return 1;
  if (p >= RAMP_OUT_END) return 0;
  const t = (p - STONE_SEG.end) / (RAMP_OUT_END - STONE_SEG.end);
  return 1 - t * t * (3 - 2 * t);
}

/**
 * The tortoise's live offset from its anchor (design units). Tweened by StopProjects during a hop
 * (`active`), otherwise derived from the store's stone index each frame. `lift` is the hop arc.
 */
export const ride = { x: 0, y: 0, lift: 0, active: false };
