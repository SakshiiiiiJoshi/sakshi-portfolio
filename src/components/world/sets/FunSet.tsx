"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { rng } from "@/lib/walk/art";
import { DESIGN_W, WORLD_W, anchorFraction } from "@/lib/walk/constants";
import { pathYAt } from "@/lib/walk/path";
import { useWalkStore } from "@/lib/walk/store";
import { useMedia } from "@/lib/useMedia";
import { countFor, usePerf } from "@/lib/perf/tier";
import { funFacts } from "@/content/fun";

/**
 * Stop 6 set piece: a hilltop clearing with a campfire, three logs, a tent, a swaying lantern with
 * moths, and a string of pinned notes between two pines. Everything is aria-hidden (StopFun holds the
 * accessible facts). Flame, sparks, lantern and moths are CSS transform/opacity only (`.fun-*` in
 * globals.css), gated on `data-lit` so nothing animates until the tortoise has settled here, and
 * paused while the tab is hidden. Items are seated on the path at the live `--anchor-x`.
 */
const X0 = -600; // svg viewBox origin (set-local units; x = 0 is the tortoise at the stop)
const VB_W = 2400;
const FIRE_X = 230;
const TREE_A = 330;
const TREE_B = 840;
const LANTERN_X = 760;
const MOTHS = { high: 3, medium: 2, low: 1 } as const;
const MOTH_DELAYS = [0, 1.7, 3.1];
const SPARKS = { high: 16, medium: 12, low: 8 } as const;

const FLAME_OUTER = "M0 0 C-48 -6 -62 -52 -30 -96 C-26 -68 -10 -64 -6 -88 C10 -114 6 -134 -4 -156 C36 -124 64 -66 52 -26 C46 -6 22 0 0 0Z";
const FLAME_MID = "M0 0 C-34 -4 -42 -40 -20 -70 C-17 -50 -6 -46 -3 -62 C8 -82 6 -96 0 -112 C26 -88 44 -46 36 -18 C31 -4 15 0 0 0Z";
const FLAME_CORE = "M0 0 C-18 -2 -22 -22 -10 -38 C-8 -28 -2 -26 0 -34 C6 -44 4 -52 0 -60 C14 -48 22 -26 18 -10 C15 -2 8 0 0 0Z";


function Pine({ x, s }: { x: number; s: number }) {
  return (
    <g data-ax={x} data-sink="6">
      <g transform={`scale(${s})`}>
        <rect x="-8" y="-52" width="16" height="54" rx="3" fill="var(--plum)" stroke="var(--forest)" strokeWidth="2.5" />
        <path d="M0 -196 L48 -96 H24 L58 -36 H-58 L-24 -96 H-48 Z" fill="var(--forest)" stroke="var(--forest)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M0 -196 L32 -122 L10 -116 L32 -64 L12 -62 L2 -154Z" fill="var(--plum)" opacity="0.45" />
      </g>
    </g>
  );
}

function Moth({ delay }: { delay: number }) {
  return (
    <g className="fun-orbit" style={{ animationDelay: `${-delay}s` }}>
      <g transform="translate(46 0)">
        <g className="fun-wing" style={{ animationDelay: `${-delay * 0.37}s` }}>
          <ellipse cx="-4" cy="0" rx="4.5" ry="2.6" fill="var(--paper)" />
          <ellipse cx="4" cy="0" rx="4.5" ry="2.6" fill="var(--paper)" />
        </g>
      </g>
    </g>
  );
}

export function FunSet() {
  const svgRef = useRef<SVGSVGElement>(null);
  const lit = useWalkStore((s) => s.settledStop === "fun");
  const narrow = useMedia("(max-width: 639px)");
  const perf = usePerf();
  const sparkCount = narrow ? SPARKS.low : countFor(SPARKS, perf);

  // Seat everything on the ground for the live anchor x (and again on resize).
  useEffect(() => {
    const svg = svgRef.current;
    const world = svg?.closest<HTMLElement>(".world");
    if (!svg || !world) return;
    const seat = () => {
      const raw = parseFloat(getComputedStyle(world).getPropertyValue("--anchor-x"));
      const anchorX = Number.isFinite(raw) ? raw : anchorFraction(DESIGN_W) * DESIGN_W;
      svg.querySelectorAll<SVGGElement>("[data-ax]").forEach((g) => {
        const x = Number(g.dataset.ax);
        const y = pathYAt(0.83 * WORLD_W + anchorX + x) + Number(g.dataset.sink ?? 0);
        g.setAttribute("transform", `translate(${x} ${y.toFixed(1)}) rotate(${g.dataset.lean ?? 0})`);
      });
    };
    seat();
    const ro = new ResizeObserver(seat);
    ro.observe(world);
    return () => ro.disconnect();
  }, []);

  // Hidden tab: pause every animation (CSS honours data-paused).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const sync = () => (document.hidden ? svg.setAttribute("data-paused", "") : svg.removeAttribute("data-paused"));
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const r = rng(6001);
  const sparks = Array.from({ length: sparkCount }, (_, i) => ({
    dx: Math.round((r() - 0.5) * 90),
    x: Math.round((r() - 0.5) * 40),
    delay: -(i / sparkCount) * 3.2,
    dur: 2 + r() * 1.6,
    size: 1.6 + r() * 1.8,
  }));
  const noteCount = Math.min(funFacts.length, 8);

  return (
    <svg
      ref={svgRef}
      className="fun-set"
      data-lit={lit ? "" : undefined}
      aria-hidden="true"
      viewBox={`${X0} 0 ${VB_W} 900`}
      style={{
        position: "absolute",
        left: `calc(var(--s) * ${X0}px)`,
        bottom: 0,
        width: `calc(var(--s) * ${VB_W}px)`,
        height: "calc(var(--s) * 900px)",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <defs>
        <radialGradient id="fun-glow-grad">
          <stop offset="0" stopColor="var(--honey)" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="var(--coral)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--coral)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Pine x={TREE_A} s={1.55} />
      <Pine x={TREE_B} s={1.7} />

      {/* string of pinned notes between the pines */}
      <g data-ax={TREE_A} data-sink="0">
        <path d={`M0 -280 Q${(TREE_B - TREE_A) / 2} -240 ${TREE_B - TREE_A} -280`} fill="none" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" />
        {Array.from({ length: noteCount }, (_, i) => {
          const t = (i + 1) / (noteCount + 1);
          const x = t * (TREE_B - TREE_A);
          const y = -280 + 80 * t * (1 - t);
          const rot = (rng(6100 + i)() - 0.5) * 12;
          return (
            <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`}>
              <rect x="-15" y="2" width="30" height="38" rx="2" fill="var(--paper)" stroke="var(--forest)" strokeWidth="2" />
              <path d="M-9 14 H9 M-9 22 H5 M-9 30 H8" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
              <rect x="-3" y="-4" width="6" height="14" rx="2" fill="var(--honey)" stroke="var(--forest)" strokeWidth="1.5" />
            </g>
          );
        })}
      </g>

      {/* lantern hanging from a branch, swaying; moths orbit it */}
      <g data-ax={LANTERN_X} data-sink="0">
        <path d={`M${TREE_B - LANTERN_X + 4} -226 Q${(TREE_B - LANTERN_X) / 2} -250 0 -236`} fill="none" stroke="var(--plum)" strokeWidth="9" strokeLinecap="round" transform="translate(0 0)" />
        <g transform="translate(0 -236)">
          <g className="fun-sway">
            <path d="M0 0 V26" stroke="var(--forest)" strokeWidth="2.5" />
            <g transform="translate(0 26)">
              <circle className="fun-lantern-glow" cx="0" cy="22" r="64" fill="url(#fun-glow-grad)" />
              <path d="M-12 0 H12 L16 8 H-16Z" fill="var(--forest)" />
              <rect x="-13" y="8" width="26" height="30" rx="5" fill="var(--honey)" stroke="var(--forest)" strokeWidth="2.5" />
              <path d="M-13 38 H13 V44 H-13Z" fill="var(--forest)" />
              <g transform="translate(0 23) scale(1 0.5)" className="fun-moths">
                {MOTH_DELAYS.slice(0, countFor(MOTHS, perf)).map((d) => (
                  <Moth key={d} delay={d} />
                ))}
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* tent */}
      <g data-ax="600" data-sink="4">
        <ellipse className="shadow-ellipse" style={{ "--base": 0.18 } as CSSProperties} cx="0" cy="2" rx="130" ry="9" fill="var(--forest)" />
        <path d="M-112 0 L0 -158 L112 0Z" fill="var(--coral)" stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M0 -158 L112 0 H60 Z" fill="var(--plum)" opacity="0.28" />
        <path d="M-34 0 L0 -84 L34 0Z" fill="var(--plum)" stroke="var(--forest)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M-84 -30 L0 -140 L84 -30" fill="none" stroke="var(--honey)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M0 -158 V-176" stroke="var(--forest)" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* three logs round the fire */}
      <g data-ax={FIRE_X - 96} data-lean="-6" data-sink="8">
        <rect x="-46" y="-22" width="92" height="24" rx="11" fill="#9A6B3F" stroke="var(--forest)" strokeWidth="2.5" />
        <ellipse cx="46" cy="-10" rx="6" ry="11" fill="#C79A63" stroke="var(--forest)" strokeWidth="2" />
      </g>
      <g data-ax={FIRE_X + 100} data-lean="7" data-sink="8">
        <rect x="-46" y="-22" width="92" height="24" rx="11" fill="#9A6B3F" stroke="var(--forest)" strokeWidth="2.5" />
        <ellipse cx="-46" cy="-10" rx="6" ry="11" fill="#C79A63" stroke="var(--forest)" strokeWidth="2" />
      </g>
      <g data-ax={FIRE_X} data-lean="0" data-sink="22">
        <rect x="-50" y="-22" width="100" height="24" rx="11" fill="#8A5C34" stroke="var(--forest)" strokeWidth="2.5" />
        <ellipse cx="50" cy="-10" rx="6" ry="11" fill="#C79A63" stroke="var(--forest)" strokeWidth="2" />
      </g>

      {/* campfire */}
      <g data-ax={FIRE_X} data-sink="0">
        <g className="fun-glow">
          <circle className="fun-glow-pulse" cx="0" cy="-70" r="300" fill="url(#fun-glow-grad)" />
        </g>
        <path d="M-52 4 L52 -10 M-52 -10 L52 4" stroke="#6E4726" strokeWidth="13" strokeLinecap="round" />
        <g className="fun-fire">
          <g className="fun-flame" style={{ animationDuration: "0.9s" }}>
            <path d={FLAME_OUTER} fill="var(--coral)" stroke="var(--forest)" strokeWidth="2" strokeLinejoin="round" />
          </g>
          <g className="fun-flame" style={{ animationDuration: "0.7s", animationDelay: "-0.3s" }}>
            <path d={FLAME_MID} fill="var(--honey)" />
          </g>
          <g className="fun-flame" style={{ animationDuration: "0.55s", animationDelay: "-0.15s" }}>
            <path d={FLAME_CORE} fill="var(--paper)" opacity="0.9" />
          </g>
        </g>
        {sparks.map((s, i) => (
          <circle
            key={i}
            className="fun-spark"
            cx={s.x}
            cy="-90"
            r={s.size.toFixed(1)}
            fill={i % 3 === 0 ? "var(--paper)" : "var(--honey)"}
            style={{ animationDuration: `${s.dur.toFixed(2)}s`, animationDelay: `${s.delay.toFixed(2)}s`, ["--dx" as string]: `${s.dx}px` }}
          />
        ))}
      </g>
    </svg>
  );
}
