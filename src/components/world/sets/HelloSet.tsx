import type { CSSProperties } from "react";
import { site } from "@/content/site";

/**
 * Stop 1 set piece: mossy mound "home" with a round door, a name signpost, dew sparkles, a warm
 * glow and two drifting clouds. The wrapper origin is the tortoise's x, so the 1000x900 viewBox is
 * shifted left by 700 units (viewBox x=700 ↔ tortoise). The tortoise walks out of the door at
 * viewBox x≈340 (see StopHello's intro; DOOR_OFFSET there must match 700 − 340 = 360).
 */
const SPARKLES: ReadonlyArray<readonly [number, number, number]> = [
  [585, 735, 0],
  [640, 770, 0.9],
  [440, 745, 1.7],
  [215, 760, 0.4],
  [540, 790, 2.2],
  [120, 735, 1.3],
  [700, 800, 0.6],
  [380, 790, 1.9],
];

const CLOUDS = [
  { x: 120, y: 190, d: "42s", delay: "-6s" },
  { x: 420, y: 280, d: "56s", delay: "-30s" },
] as const;

export function HelloSet() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 900"
      style={{
        position: "absolute",
        left: "calc(var(--s) * -700px)",
        bottom: 0,
        width: "calc(var(--s) * 1000px)",
        height: "calc(var(--s) * 900px)",
        overflow: "visible",
      }}
    >
      <defs>
        <radialGradient id="hello-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--honey)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--honey)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="340" cy="560" rx="300" ry="230" fill="url(#hello-glow)" />

      {CLOUDS.map((c) => (
        <g
          key={c.x}
          className="world-cloud"
          style={{ animationDuration: c.d, animationDelay: c.delay }}
        >
          <g fill="var(--paper)" opacity="0.9">
            <ellipse cx={c.x} cy={c.y} rx="62" ry="22" />
            <ellipse cx={c.x - 28} cy={c.y - 14} rx="34" ry="22" />
            <ellipse cx={c.x + 22} cy={c.y - 20} rx="40" ry="26" />
          </g>
        </g>
      ))}

      {/* signpost */}
      <g>
        <rect x="104" y="618" width="12" height="104" rx="4" fill="var(--moss-dark)" />
        <rect x="46" y="592" width="128" height="46" rx="8" fill="var(--paper)" stroke="var(--forest)" strokeWidth="3" />
        <text
          x="110"
          y="623"
          textAnchor="middle"
          fill="var(--forest)"
          fontSize="24"
          fontWeight="600"
          style={{ fontFamily: "var(--nf-display), serif" }}
        >
          {site.displayName}
        </text>
      </g>

      {/* mound */}
      <ellipse className="shadow-ellipse" style={{ "--base": 0.18 } as CSSProperties} cx="340" cy="724" rx="214" ry="16" fill="var(--forest)" />
      <path
        d="M140 722 C158 596 246 512 340 512 C434 512 522 596 540 722 Z"
        fill="var(--moss)"
        stroke="var(--forest)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M196 610 C222 560 270 534 318 530"
        fill="none"
        stroke="var(--sage)"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* tufts */}
      <g stroke="var(--forest)" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M402 548 l4 -16 M410 550 l12 -12" />
        <path d="M262 530 l-4 -14 M254 534 l-12 -10" />
      </g>

      {/* round door */}
      <ellipse cx="340" cy="660" rx="52" ry="62" fill="var(--honey)" stroke="var(--forest)" strokeWidth="3" />
      <ellipse cx="340" cy="664" rx="40" ry="50" fill="var(--forest)" />
      <circle cx="368" cy="668" r="5" fill="var(--honey)" />

      {/* dew sparkles */}
      {SPARKLES.map(([x, y, delay]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path
            className="hello-sparkle"
            d="M0 -8 L2.4 -2.4 L8 0 L2.4 2.4 L0 8 L-2.4 2.4 L-8 0 L-2.4 -2.4 Z"
            fill="var(--paper)"
            style={{ animationDelay: `${delay}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
