export const STOPS = [
  { id: "hello", title: "Hello", progress: 0.0, timeOfDay: "dawn" },
  { id: "about", title: "About", progress: 0.14, timeOfDay: "morning" },
  { id: "skills", title: "Skills Garden", progress: 0.3, timeOfDay: "late morning" },
  { id: "projects", title: "Stepping Stones", progress: 0.48, timeOfDay: "noon" },
  { id: "experience", title: "Experience Trail", progress: 0.66, timeOfDay: "golden hour" },
  { id: "fun", title: "Fun Facts Campfire", progress: 0.83, timeOfDay: "dusk" },
  { id: "contact", title: "Contact Pond", progress: 1.0, timeOfDay: "night" },
] as const;

export type Stop = (typeof STOPS)[number];
export type StopId = Stop["id"];

// Progress units per input pixel. Tuned for a ~90-120 s casual wheel/swipe journey (unverified by eye).
export const WHEEL_K = 0.00004;
export const TOUCH_K = 0.0001;
export const SNAP_WINDOW = 0.025;
export const SNAP_DELAY = 150; // ms
export const MAX_VELOCITY = 0.9; // progress units per second

// ---- walk engine tuning ----
export const SMOOTH_TAU = 0.09; // s; progress chases target exponentially (~99% in 0.4 s)
export const SNAP_DURATION = 0.7; // s
export const GOTO_MIN = 1.2; // s
export const GOTO_MAX = 3.2; // s
export const RESIST = 0.6; // input multiplier inside SNAP_WINDOW
export const MAX_EVENT_DELTA = 0.05; // per-event clamp on target change
export const MOMENTUM_MS = 600; // touch momentum decay
export const FINE_STEP = 0.02; // Shift+Arrow
export const SETTLE_ENTER = 0.01;
export const SETTLE_LEAVE = 0.012;
export const SETTLE_VELOCITY = 0.01;
export const SETTLE_MS = 250;
export const FLICK_VELOCITY = 0.75; // |velocity| that makes the tortoise hide
export const HIDE_MS = 900;

// ---- world geometry (design canvas 1440 x 900; everything scales by --s) ----
export const DESIGN_W = 1440;
export const DESIGN_H = 900;
export const WORLD_W = 12 * DESIGN_W; // 17280
export const TILE_W = 6000;
export const MAX_SCALE = 1.25;
/** Path layer covers the whole walk plus the widest plausible viewport (2560 / 1.25). */
export const PATH_W = WORLD_W + 2200;

export const LAYER_SPEED = {
  sky: 0.05,
  far: 0.15,
  mid: 0.3,
  trees: 0.55,
  path: 1,
  foreground: 1.35,
} as const;

/** Tortoise screen x as a fraction of viewport width. */
export function anchorFraction(vw: number, vh = Infinity): number {
  if (vh <= 450 && vw > vh) return 0.27; // landscape phone: side panel takes the right half
  if (vw >= 1024) return 0.35;
  if (vw >= 640) return 0.4;
  return 0.5;
}

export const TORTOISE_W = 220; // design units

export function stopById(id: string): Stop | undefined {
  return STOPS.find((s) => s.id === id);
}

export function nearestStop(p: number): { stop: Stop; dist: number } {
  let best: Stop = STOPS[0];
  let dist = Infinity;
  for (const s of STOPS) {
    const d = Math.abs(p - s.progress);
    if (d < dist) {
      dist = d;
      best = s;
    }
  }
  return { stop: best, dist };
}
