"use client";

import { useMemo, type CSSProperties } from "react";
import { rng } from "@/lib/walk/art";
import { useWalkStore } from "@/lib/walk/store";
import { SHORT_LANDSCAPE, useMedia } from "@/lib/useMedia";
import { countFor, usePerf, type Perf, type QualityTier } from "@/lib/perf/tier";

// Fx — the single viewport-space particle manager. Every type is CSS-animated (transform/opacity
// only), renders a tier-dependent count once, and is shown only inside its progress window: the
// world tick writes `--fx-<type>` (0..1) plus `data-fx-<type>` on `.world` (see timeOfDay.ts), and
// the CSS hides + pauses a type outside its window. Pausing on `visibilitychange` is handled by
// `.world[data-paused]`. Under reduced motion only static twinkles / glowing dots remain.
// Campfire sparks and lantern moths stay in FunSet (P11) and read the same tier.
const COUNTS: Record<"dew" | "motes" | "birds" | "fireflies", Record<QualityTier, number>> = {
  dew: { high: 14, medium: 9, low: 5 },
  motes: { high: 18, medium: 11, low: 6 },
  birds: { high: 5, medium: 4, low: 3 },
  fireflies: { high: 28, medium: 18, low: 12 },
};
/** The first few fireflies sit around the tortoise and pulse brighter. */
const NEAR = 5;

type Style = CSSProperties & Record<`--${string}`, string>;

/** Particle budget per breakpoint on top of the perf tier (03 §5): narrow drops a tier, short landscape is low. */
function useEffectivePerf(): Perf {
  const perf = usePerf();
  const narrow = useMedia("(max-width: 639px)");
  const shortLandscape = useMedia(SHORT_LANDSCAPE);
  if (shortLandscape) return perf.tier === "low" ? perf : { ...perf, tier: "low" };
  if (narrow && perf.tier !== "low") return { ...perf, tier: perf.tier === "high" ? "medium" : "low" };
  return perf;
}

interface Fly {
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  p: number[];
  near: boolean;
}

function makeFlies(count: number): Fly[] {
  const r = rng(7001);
  return Array.from({ length: count }, (_, i) => {
    const near = i < NEAR;
    return {
      // lower 60% of the viewport; "near" ones cluster round the tortoise (left third)
      x: near ? 24 + r() * 22 : 4 + r() * 92,
      y: near ? 52 + r() * 24 : 30 + r() * 58,
      size: 3 + r() * 3,
      dur: 11 + r() * 9,
      delay: -r() * 16,
      // three bezier waypoints (px offsets) the keyframes pass through
      p: Array.from({ length: 6 }, () => Math.round((r() - 0.5) * 120)),
      near,
    };
  });
}

/** Fireflies (night): they gather slightly toward the centre once the Contact Pond has settled. */
export function Fireflies({ perf }: { perf: Perf }) {
  const on = useWalkStore((s) => s.activeStop === "contact");
  const count = countFor(COUNTS.fireflies, perf);
  const flies = useMemo(() => makeFlies(count), [count]);
  return (
    <div className="fx-type fx-fireflies fireflies" data-on={on ? "" : undefined}>
      {flies.map((f, i) => (
        <span
          key={i}
          className="ff"
          data-near={f.near ? "" : undefined}
          style={
            {
              left: `${f.x.toFixed(1)}%`,
              top: `${f.y.toFixed(1)}%`,
              width: f.size,
              height: f.size,
              animationDuration: `${f.dur.toFixed(1)}s, ${(2.2 + (i % 5) * 0.6).toFixed(1)}s`,
              animationDelay: `${f.delay.toFixed(1)}s, ${(-i * 0.7).toFixed(1)}s`,
              "--x1": `${f.p[0]}px`,
              "--y1": `${f.p[1]}px`,
              "--x2": `${f.p[2]}px`,
              "--y2": `${f.p[3]}px`,
              "--x3": `${f.p[4]}px`,
              "--y3": `${f.p[5]}px`,
            } as Style
          }
        />
      ))}
    </div>
  );
}

/** Dew twinkles (dawn): tiny sparkles low in the frame, over the grass. */
function Dew({ perf }: { perf: Perf }) {
  const count = countFor(COUNTS.dew, perf);
  const dots = useMemo(() => {
    const r = rng(7101);
    return Array.from({ length: count }, () => ({
      x: 3 + r() * 94,
      y: 62 + r() * 32,
      size: 3 + r() * 3,
      dur: 2.4 + r() * 2.6,
      delay: -r() * 5,
    }));
  }, [count]);
  return (
    <div className="fx-type fx-dew">
      {dots.map((d, i) => (
        <i
          key={i}
          className="dew"
          style={{ left: `${d.x.toFixed(1)}%`, top: `${d.y.toFixed(1)}%`, width: d.size, height: d.size, animationDuration: `${d.dur.toFixed(1)}s`, animationDelay: `${d.delay.toFixed(1)}s` }}
        />
      ))}
    </div>
  );
}

/** Pollen / dust motes (day): slow drifting specks. */
function Motes({ perf }: { perf: Perf }) {
  const count = countFor(COUNTS.motes, perf);
  const motes = useMemo(() => {
    const r = rng(7201);
    return Array.from({ length: count }, () => ({
      x: 2 + r() * 96,
      y: 18 + r() * 70,
      size: 2 + r() * 2.4,
      dur: 14 + r() * 12,
      delay: -r() * 20,
      dx: Math.round(40 + r() * 90),
      dy: Math.round((r() - 0.7) * 70),
    }));
  }, [count]);
  return (
    <div className="fx-type fx-motes">
      {motes.map((m, i) => (
        <i
          key={i}
          className="mote"
          style={
            {
              left: `${m.x.toFixed(1)}%`,
              top: `${m.y.toFixed(1)}%`,
              width: m.size,
              height: m.size,
              animationDuration: `${m.dur.toFixed(1)}s`,
              animationDelay: `${m.delay.toFixed(1)}s`,
              "--dx": `${m.dx}px`,
              "--dy": `${m.dy}px`,
            } as Style
          }
        />
      ))}
    </div>
  );
}

/** One flock (golden hour) crossing the sky now and then. */
function Birds({ perf }: { perf: Perf }) {
  const count = countFor(COUNTS.birds, perf);
  return (
    <div className="fx-type fx-birds">
      <svg className="flock" viewBox="0 0 240 70" width="240" height="70">
        {Array.from({ length: count }, (_, b) => (
          <g key={b} transform={`translate(${6 + b * 44} ${22 + (b % 2) * 22 - b * 3})`}>
            <path
              className="bird"
              d="M0 0 q10 -10 20 0 q10 -10 20 0"
              fill="none"
              stroke="var(--forest)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ animationDelay: `${-b * 0.23}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Low-sun rays (golden hour): soft, slow shimmer; static under reduced motion. */
function Rays() {
  return (
    <div className="fx-rays">
      {[0, 1, 2, 3].map((k) => (
        <i key={k} style={{ left: `${38 + k * 15}%`, animationDelay: `${-k * 2.4}s` }} />
      ))}
    </div>
  );
}

export function Fx() {
  const perf = useEffectivePerf();
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  return (
    <div id="fx" aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Rays />
      <Dew perf={perf} />
      {!reduced && <Motes perf={perf} />}
      {!reduced && <Birds perf={perf} />}
      <Fireflies perf={perf} />
    </div>
  );
}
