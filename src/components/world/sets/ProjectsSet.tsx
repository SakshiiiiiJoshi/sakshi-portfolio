"use client";

import { projects, type StoneColor } from "@/content/projects";
import { useWalkStore } from "@/lib/walk/store";
import { BANK_Y, WATER_FROM, farBank, stoneLayout, waterEnd } from "@/lib/walk/stones";

/**
 * Stop 4 set piece: a shallow stream across the path (3 ripple bands), one flat stone per project
 * plus a mossy "More on GitHub" stone, lily pads, reeds and a fish that jumps every ~15 s. Stones are
 * placed by `stoneLayout`, the same table the tortoise hops along, so N = 1…5 always line up.
 * The art is aria-hidden: StopProjects renders the accessible list (and the focusable stone buttons);
 * mouse/touch clicks here just ask the engine to glide to that stone. Motion is CSS (`.stream-*`,
 * `.stone-*` in globals.css); `[data-in]` on the set drops the stones in.
 */
const TINT: Record<StoneColor, string> = {
  moss: "var(--moss)",
  sage: "var(--sage)",
  honey: "var(--honey)",
  coral: "var(--coral)",
};

const TOP = 664;
const BOTTOM = 794;

const goToStone = (i: number) => window.dispatchEvent(new CustomEvent("walk:goto-stone", { detail: i }));

function Reeds({ x, y, flip = 1 }: { x: number; y: number; flip?: 1 | -1 }) {
  const blades = [
    { dx: 0, h: 74, lean: 4 },
    { dx: 9, h: 58, lean: -3 },
    { dx: -10, h: 50, lean: 6 },
    { dx: 18, h: 42, lean: -6 },
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`} stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" fill="none">
      {blades.map((b, i) => (
        <g key={i} className="stream-reed" style={{ animationDelay: `${-i * 0.7}s` }}>
          <path d={`M${b.dx} 0 Q${b.dx + b.lean} ${-b.h / 2} ${b.dx + b.lean * 1.6} ${-b.h}`} />
          <ellipse cx={b.dx + b.lean * 1.6} cy={-b.h - 6} rx="3.4" ry="8" fill="var(--honey-soft)" />
        </g>
      ))}
    </g>
  );
}

function LilyPad({ x, y, r = 16 }: { x: number; y: number; r?: number }) {
  return (
    <g className="stream-lily" transform={`translate(${x} ${y})`}>
      <ellipse rx={r} ry={r * 0.4} fill="var(--moss)" stroke="var(--forest)" strokeWidth="2" />
      <path d={`M0 0 L${r * 0.9} ${-r * 0.1}`} stroke="var(--forest)" strokeWidth="1.5" />
    </g>
  );
}

export function ProjectsSet() {
  const index = useWalkStore((s) => s.stoneIndex);
  const n = projects.length;
  const spots = stoneLayout(n);
  const far = farBank(n);
  const end = waterEnd(n);
  const mid = (TOP + BOTTOM) / 2;
  const width = end - WATER_FROM;

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
        pointerEvents: "none",
      }}
    >
      {/* banks: soft grass lips either side of the water */}
      <ellipse cx={WATER_FROM - 6} cy={mid + 4} rx="34" ry={(BOTTOM - TOP) / 2 + 6} fill="var(--moss)" stroke="var(--forest)" strokeWidth="2.5" />
      <ellipse cx={end + 6} cy={mid + 4} rx="34" ry={(BOTTOM - TOP) / 2 + 6} fill="var(--moss)" stroke="var(--forest)" strokeWidth="2.5" />

      {/* the stream: three layered bands, each with slow ripple lines */}
      <g>
        <rect x={WATER_FROM} y={TOP} width={width} height={BOTTOM - TOP} rx="18" fill="var(--mist-deep)" stroke="var(--forest)" strokeWidth="2.5" />
        <clipPath id="stream-clip">
          <rect x={WATER_FROM} y={TOP} width={width} height={BOTTOM - TOP} rx="18" />
        </clipPath>
        <g clipPath="url(#stream-clip)">
          {[
            { y: TOP + 26, fill: "var(--mist)", dur: 11, op: 0.55 },
            { y: TOP + 62, fill: "var(--mist)", dur: 15, op: 0.4 },
            { y: TOP + 98, fill: "var(--paper)", dur: 19, op: 0.35 },
          ].map((band, bi) => (
            <g key={bi} className="stream-band" style={{ animationDuration: `${band.dur}s`, animationDirection: bi % 2 ? "reverse" : "normal" }} opacity={band.op}>
              {Array.from({ length: Math.ceil(width / 120) + 2 }, (_, k) => (
                <path
                  key={k}
                  d={`M${WATER_FROM - 120 + k * 120} ${band.y} q30 -9 60 0 t60 0`}
                  fill="none"
                  stroke={band.fill === "var(--paper)" ? "var(--paper)" : "var(--forest)"}
                  strokeOpacity={band.fill === "var(--paper)" ? 1 : 0.35}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
            </g>
          ))}
        </g>
      </g>

      <LilyPad x={WATER_FROM + 62} y={TOP + 100} r={18} />
      <LilyPad x={WATER_FROM + 92} y={TOP + 112} r={11} />
      <LilyPad x={end - 90} y={TOP + 28} r={15} />
      <LilyPad x={(WATER_FROM + end) / 2 + 40} y={BOTTOM - 14} r={13} />

      {/* the fish: one hop over the water every ~15 s */}
      <g className="stream-fish" transform={`translate(${(WATER_FROM + end) / 2 - 60} ${mid + 18})`}>
        <g className="stream-fish-body">
          <path d="M-16 0 Q-4 -12 14 -2 L24 -9 L22 6 L14 3 Q-4 12 -16 0Z" fill="var(--coral)" stroke="var(--forest)" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="-8" cy="-2" r="1.8" fill="var(--forest)" />
        </g>
      </g>

      {/* stones */}
      {spots.map((s, i) => {
        const more = i === n;
        const active = index === i;
        const fill = more ? "var(--moss)" : TINT[projects[i].stoneColor];
        return (
          <g key={i} data-stone={i} data-active={active ? "" : undefined} transform={`translate(${s.x} ${s.y})`}>
            <g className="stone-drop" style={{ transitionDelay: `${i * 120}ms` }}>
              <ellipse className="stone-ripple" cx="0" cy={s.ry * 0.7} rx={s.rx + 6} ry={s.ry * 0.7} fill="none" stroke="var(--paper)" strokeWidth="3" style={{ animationDelay: `${i * 120 + 380}ms` }} />
              <ellipse cx="0" cy={s.ry * 0.9 + 5} rx={s.rx} ry={s.ry} fill="var(--forest)" opacity="0.28" />
              <ellipse className="stone-body" cx="0" cy={s.ry * 0.6} rx={s.rx} ry={s.ry} fill={fill} stroke="var(--forest)" strokeWidth="2.5" />
              <ellipse cx="0" cy={s.ry * 0.6 - 4} rx={s.rx * 0.72} ry={s.ry * 0.5} fill="var(--paper)" opacity="0.28" />
              <text
                x="0"
                y={s.ry * 0.6 + 6}
                textAnchor="middle"
                fontSize={more ? 14 : 20}
                fill="var(--forest)"
                fillOpacity="0.7"
                style={{ fontFamily: "var(--font-hand)" }}
              >
                {more ? "GitHub" : i + 1}
              </text>
            </g>
            <ellipse
              cx="0"
              cy={s.ry * 0.4}
              rx={s.rx + 12}
              ry={s.ry + 26}
              fill="transparent"
              style={{ pointerEvents: "all", cursor: "pointer" }}
              onClick={() => goToStone(i)}
            />
          </g>
        );
      })}

      {/* foreground reeds on both banks */}
      <Reeds x={WATER_FROM + 10} y={BOTTOM + 14} />
      <Reeds x={WATER_FROM + 40} y={BOTTOM + 20} />
      <Reeds x={end - 6} y={BOTTOM + 16} flip={-1} />
      <Reeds x={far.x + 4} y={BANK_Y + 62} flip={-1} />
    </svg>
  );
}
