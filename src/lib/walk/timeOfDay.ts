// Time-of-day keyframes (03 §6) and the pure sampler. Each property has its own small table so the
// stars, shadows and light layers can ramp on their own schedule. Colors are parsed once to OKLab and
// interpolated there, so dusk goes peach -> plum without passing through a muddy grey. Results are
// written to CSS variables, never to shape fills.

type Lab = readonly [number, number, number];

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

/** "#RRGGBB" -> OKLab. */
function hexToLab(h: string): Lab {
  const r = lin(parseInt(h.slice(1, 3), 16) / 255);
  const g = lin(parseInt(h.slice(3, 5), 16) / 255);
  const b = lin(parseInt(h.slice(5, 7), 16) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const to255 = (c: number) => Math.round(Math.min(Math.max(gam(Math.min(Math.max(c, 0), 1)), 0), 1) * 255);

/** OKLab -> "rgb(r g b)" (clamped to sRGB). */
function labToCss(L: number, a: number, b: number): string {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return `rgb(${to255(r)} ${to255(g)} ${to255(bl)})`;
}

type Curve<T> = ReadonlyArray<readonly [number, T]>;

const lab = (rows: ReadonlyArray<readonly [number, string]>): Curve<Lab> =>
  rows.map(([p, h]) => [p, hexToLab(h)] as const);

const SKY_TOP = lab([
  [0.0, "#F3D9C4"], [0.14, "#DCEBE4"], [0.3, "#CFE5E0"], [0.48, "#BFDDE0"],
  [0.66, "#F2B84B"], [0.83, "#E8875B"], [1.0, "#2E3B5F"],
]);
const SKY_BOTTOM = lab([
  [0.0, "#F8E7C8"], [0.14, "#F6EEDC"], [0.3, "#F6EEDC"], [0.48, "#E4F0E8"],
  [0.66, "#F2B297"], [0.83, "#5B4B6B"], [1.0, "#1F2A44"],
]);
const TINT = lab([
  [0.0, "#F2B297"], [0.14, "#F2B297"], [0.48, "#F2B297"], [0.66, "#F2B84B"],
  [0.83, "#5B4B6B"], [1.0, "#1F2A44"],
]);
const TINT_A: Curve<number> = [[0.0, 0.06], [0.14, 0], [0.48, 0], [0.66, 0.1], [0.83, 0.12], [1.0, 0.14]];
const STARS: Curve<number> = [[0.0, 0], [0.78, 0], [0.83, 0.4], [1.0, 1]];
const GRAIN: Curve<number> = [
  [0.0, 0.08], [0.14, 0.07], [0.3, 0.06], [0.48, 0.06], [0.66, 0.08], [0.83, 0.09], [1.0, 0.1],
];
// Sun: y as a fraction of viewport height. Sets at ~0.9 (hidden behind the far hills first).
const SUN_Y: Curve<number> = [
  [0.0, 0.78], [0.14, 0.62], [0.3, 0.48], [0.48, 0.34], [0.66, 0.58], [0.83, 0.92], [1.0, 0.98],
];
const SUN_S: Curve<number> = [[0.0, 1], [0.48, 1], [0.66, 1.6], [0.83, 1.3], [1.0, 1]];
const SUN_A: Curve<number> = [[0.0, 1], [0.66, 1], [0.83, 0.5], [0.9, 0], [1.0, 0]];
const SUN_X: Curve<number> = [[0.0, 0.2], [0.83, 0.78], [1.0, 0.8]];
const MOON_Y: Curve<number> = [[0.0, 1.15], [0.8, 1.15], [1.0, 0.3]];
const MOON_A: Curve<number> = [[0.0, 0], [0.82, 0], [0.92, 1], [1.0, 1]];
const MOON_X: Curve<number> = [[0.0, 0.5], [0.8, 0.5], [1.0, 0.7]];
// Ground shadows: length (scaleX) is longest at golden hour, opacity multiplier is faint at noon/night.
const SHADOW_LEN: Curve<number> = [
  [0.0, 1.5], [0.14, 1.2], [0.3, 0.8], [0.48, 0.5], [0.66, 1.6], [0.83, 1.2], [1.0, 0.6],
];
const SHADOW_OP: Curve<number> = [
  [0.0, 0.9], [0.14, 0.8], [0.3, 0.6], [0.48, 0.45], [0.66, 1], [0.83, 0.7], [1.0, 0.35],
];
const VIGNETTE: Curve<number> = [[0.0, 0.1], [0.48, 0.05], [0.66, 0.2], [0.83, 0.4], [1.0, 0.6]];
const RAYS: Curve<number> = [[0.0, 0], [0.56, 0], [0.66, 0.55], [0.77, 0]];
const MOON_GLOW: Curve<number> = [[0.0, 0], [0.82, 0], [1.0, 1]];

// Ambient particle windows: each type fades in and out over its own span of the walk. Chosen so at
// most two types overlap at any transition.
const FX_DEW: Curve<number> = [[0.0, 0.9], [0.1, 0.9], [0.16, 0]];
const FX_MOTES: Curve<number> = [[0.0, 0], [0.12, 0], [0.2, 1], [0.5, 1], [0.6, 0]];
const FX_BIRDS: Curve<number> = [[0.0, 0], [0.58, 0], [0.63, 1], [0.73, 1], [0.78, 0]];
const FX_MOTHS: Curve<number> = [[0.0, 0], [0.76, 0], [0.8, 1], [0.88, 1], [0.93, 0]];
const FX_FIREFLIES: Curve<number> = [[0.0, 0], [0.82, 0], [0.9, 1], [1.0, 1]];

export const FX_TYPES = ["dew", "motes", "birds", "moths", "fireflies"] as const;
export type FxType = (typeof FX_TYPES)[number];

function seg<T>(c: Curve<T>, p: number): [T, T, number] {
  if (p <= c[0][0]) return [c[0][1], c[0][1], 0];
  const last = c.length - 1;
  if (p >= c[last][0]) return [c[last][1], c[last][1], 0];
  let i = 0;
  while (c[i + 1][0] < p) i++;
  return [c[i][1], c[i + 1][1], (p - c[i][0]) / (c[i + 1][0] - c[i][0])];
}
const num = (c: Curve<number>, p: number) => {
  const [a, b, t] = seg(c, p);
  return a + (b - a) * t;
};
const color = (c: Curve<Lab>, p: number) => {
  const [a, b, t] = seg(c, p);
  return labToCss(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
};

export interface TimeOfDay {
  skyTop: string;
  skyBottom: string;
  tint: string;
  tintOpacity: number;
  stars: number;
  grain: number;
  sunX: number; sunY: number; sunScale: number; sunOpacity: number;
  moonX: number; moonY: number; moonOpacity: number;
  shadowLen: number;
  shadowOpacity: number;
  vignette: number;
  rays: number;
  moonGlow: number;
  /** 0..1 fade for each ambient particle type (see FX_* windows). */
  fx: Record<FxType, number>;
}

export const emptyTimeOfDay = (): TimeOfDay => ({
  skyTop: "", skyBottom: "", tint: "", tintOpacity: 0, stars: 0, grain: 0,
  sunX: 0, sunY: 0, sunScale: 1, sunOpacity: 1, moonX: 0, moonY: 0, moonOpacity: 0,
  shadowLen: 1, shadowOpacity: 1, vignette: 0, rays: 0, moonGlow: 0,
  fx: { dew: 0, motes: 0, birds: 0, moths: 0, fireflies: 0 },
});

/** Pure: interpolated look at `progress` (0..1). Pass `out` to reuse an object per frame. */
export function sampleTimeOfDay(progress: number, out: TimeOfDay = emptyTimeOfDay()): TimeOfDay {
  const p = Math.min(Math.max(progress, 0), 1);
  out.skyTop = color(SKY_TOP, p);
  out.skyBottom = color(SKY_BOTTOM, p);
  out.tint = color(TINT, p);
  out.tintOpacity = num(TINT_A, p);
  out.stars = num(STARS, p);
  out.grain = num(GRAIN, p);
  out.sunX = num(SUN_X, p);
  out.sunY = num(SUN_Y, p);
  out.sunScale = num(SUN_S, p);
  out.sunOpacity = num(SUN_A, p);
  out.moonX = num(MOON_X, p);
  out.moonY = num(MOON_Y, p);
  out.moonOpacity = num(MOON_A, p);
  out.shadowLen = num(SHADOW_LEN, p);
  out.shadowOpacity = num(SHADOW_OP, p);
  out.vignette = num(VIGNETTE, p);
  out.rays = num(RAYS, p);
  out.moonGlow = num(MOON_GLOW, p);
  out.fx.dew = num(FX_DEW, p);
  out.fx.motes = num(FX_MOTES, p);
  out.fx.birds = num(FX_BIRDS, p);
  out.fx.moths = num(FX_MOTHS, p);
  out.fx.fireflies = num(FX_FIREFLIES, p);
  return out;
}

const scratch = emptyTimeOfDay();
const fxKey: Record<FxType, string> = {
  dew: "fxDew", motes: "fxMotes", birds: "fxBirds", moths: "fxMoths", fireflies: "fxFireflies",
};

// Per root, so a remounted world never trusts a stale cache.
const lastWritten = new WeakMap<HTMLElement, Map<string, string>>();

/** Writes `--name` only when the value differs from the last write: every write restyles the subtree. */
function setVar(root: HTMLElement, name: string, value: string) {
  let cache = lastWritten.get(root);
  if (!cache) lastWritten.set(root, (cache = new Map()));
  if (cache.get(name) === value) return;
  cache.set(name, value);
  root.style.setProperty(name, value);
}

/** Writes the time-of-day variables to `root` and returns the sample (a reused object). */
export function applySky(root: HTMLElement, p: number): TimeOfDay {
  const t = sampleTimeOfDay(p, scratch);
  setVar(root, "--sky-top", t.skyTop);
  setVar(root, "--sky-bottom", t.skyBottom);
  setVar(root, "--tint", t.tint);
  setVar(root, "--tint-opacity", t.tintOpacity.toFixed(2));
  setVar(root, "--grain-opacity", t.grain.toFixed(2));
  setVar(root, "--stars", t.stars.toFixed(2));
  setVar(root, "--shadow-len", t.shadowLen.toFixed(2));
  setVar(root, "--shadow-op", t.shadowOpacity.toFixed(2));
  setVar(root, "--vignette", t.vignette.toFixed(2));
  setVar(root, "--rays", t.rays.toFixed(2));
  setVar(root, "--moon-glow", t.moonGlow.toFixed(2));
  for (const k of FX_TYPES) {
    const v = t.fx[k];
    setVar(root, `--fx-${k}`, v.toFixed(2));
    // CSS only renders (and animates) a particle type while it is inside its window.
    const on = v > 0.005;
    if (on !== (root.dataset[fxKey[k]] !== undefined)) {
      if (on) root.dataset[fxKey[k]] = "";
      else delete root.dataset[fxKey[k]];
    }
  }
  const raysOn = t.rays > 0.005;
  if (raysOn !== (root.dataset.fxRays !== undefined)) {
    if (raysOn) root.dataset.fxRays = "";
    else delete root.dataset.fxRays;
  }
  return t;
}
