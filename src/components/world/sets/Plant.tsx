import { seeded, type PlantKind } from "@/lib/skillsGarden";

/** Stem length per skill level (06-asset-brief §5). */
export const STEM_PER_LEVEL = 18;
const SPROUT_STEM = 16;

const STROKE = { stroke: "var(--forest)", strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const BROWN = "color-mix(in srgb, var(--coral) 40%, var(--ink))";

/** Total drawn height above the base, used for the hit area and tooltip anchor. */
export function plantHeight(kind: PlantKind, level: number, learning: boolean): number {
  if (learning) return SPROUT_STEM + 14;
  const stem = level * STEM_PER_LEVEL;
  return kind === "mushroom" ? stem + 22 : kind === "fern" ? stem + 26 : stem + 22;
}

function Leaves({ h, r }: { h: number; r: () => number }) {
  const y = -h * (0.4 + r() * 0.12);
  return (
    <g fill="var(--moss)" {...STROKE}>
      <path d={`M0 ${y} C10 ${y - 12} 20 ${y - 8} 22 ${y - 2} C14 ${y + 6} 6 ${y + 4} 0 ${y}Z`} />
      <path d={`M0 ${y + 10} C-10 ${y - 2} -19 ${y} -21 ${y + 6} C-13 ${y + 14} -5 ${y + 14} 0 ${y + 10}Z`} fill="var(--moss-dark)" />
    </g>
  );
}

function Head({ kind, r }: { kind: PlantKind; r: () => number }) {
  switch (kind) {
    case "sunflower":
      return (
        <g {...STROKE}>
          {Array.from({ length: 10 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-13" rx="5" ry={10.5 + r() * 2} fill={i % 2 ? "var(--honey-soft)" : "var(--honey)"} transform={`rotate(${i * 36})`} />
          ))}
          <circle r="8.5" fill={BROWN} />
        </g>
      );
    case "mushroom":
      return (
        <g {...STROKE}>
          <path d="M-22 4 C-22 -16 -10 -24 0 -24 C10 -24 22 -16 22 4 C10 8 -10 8 -22 4Z" fill="var(--coral)" />
          <path d="M-22 4 C-10 8 10 8 22 4 C22 7 14 11 0 11 C-14 11 -22 7 -22 4Z" fill="var(--honey-soft)" />
          <g fill="var(--paper)" strokeWidth="1.5">
            <circle cx="-9" cy="-10" r="3.6" />
            <circle cx="6" cy="-15" r="3" />
            <circle cx="11" cy="-4" r="2.6" />
          </g>
        </g>
      );
    case "tulip":
      return (
        <g {...STROKE}>
          <path d="M-12 -20 C-13 -4 -8 6 0 6 C8 6 13 -4 12 -20 L5 -11 L0 -22 L-5 -11Z" fill="var(--plum)" />
          <path d="M-5 -11 L0 -22 L5 -11 C3 -2 -3 -2 -5 -11Z" fill="var(--coral)" strokeWidth="1.5" />
        </g>
      );
    case "fern":
      return (
        <g {...STROKE} strokeWidth="1.6">
          {[-1, 0, 1].map((d) => {
            const lean = d * (22 + r() * 6);
            const len = d === 0 ? 30 : 24;
            return (
              <g key={d}>
                <path d={`M0 8 Q${lean * 0.3} ${-len * 0.5} ${lean} ${-len}`} fill="none" />
                {[0.35, 0.6, 0.85].map((t, i) => {
                  const x = lean * t;
                  const y = -len * t + 8 * (1 - t);
                  return <ellipse key={i} cx={x} cy={y} rx="9" ry="3.8" fill={i % 2 ? "var(--moss-dark)" : "var(--moss)"} transform={`rotate(${d * 28 - 20 + i * 24} ${x} ${y})`} />;
                })}
              </g>
            );
          })}
        </g>
      );
    case "daisy":
      return (
        <g {...STROKE} strokeWidth="1.8">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-11" rx="4.6" ry={9 + r() * 2} fill={i % 2 ? "var(--paper-dim)" : "var(--paper)"} transform={`rotate(${i * 45})`} />
          ))}
          <circle r="6" fill="var(--honey)" />
        </g>
      );
  }
}

/**
 * One skill, drawn with its base at (0,0) growing up. `data-plant-grow` is what StopSkills scales
 * from 0 on arrival; the outer `.plant-sway` is the transform-only idle sway (CSS), so the two
 * transforms never fight. Everything is seeded per plant: hand-made, but identical on every render.
 */
export function Plant({
  kind,
  level,
  learning,
  seed,
  index,
}: {
  kind: PlantKind;
  level: number;
  learning: boolean;
  seed: number;
  index: number;
}) {
  const r = seeded(seed);
  const bend = (r() - 0.5) * 8;
  const tilt = (r() - 0.5) * 10;
  const delay = `${-(index * 0.9).toFixed(2)}s`;
  const dur = `${(4 + (index % 3)).toFixed(0)}s`;

  if (learning) {
    const h = SPROUT_STEM;
    return (
      <g className="plant-sway" style={{ animationDelay: delay, animationDuration: dur }}>
        <g data-plant-grow>
          <path d={`M0 0 C${bend} ${-h * 0.4} ${bend} ${-h * 0.7} 0 ${-h}`} fill="none" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" />
          <g fill="var(--sage)" {...STROKE}>
            <path d={`M0 ${-h} C-4 ${-h - 12} -18 ${-h - 12} -20 ${-h - 4} C-14 ${-h + 2} -6 ${-h + 2} 0 ${-h}Z`} />
            <path d={`M0 ${-h} C4 ${-h - 14} 18 ${-h - 14} 20 ${-h - 6} C14 ${-h} 6 ${-h} 0 ${-h}Z`} fill="var(--moss)" />
          </g>
        </g>
      </g>
    );
  }

  const h = level * STEM_PER_LEVEL;
  const stemFill = kind === "mushroom";
  return (
    <g className="plant-sway" style={{ animationDelay: delay, animationDuration: dur }}>
      <g data-plant-grow>
        {stemFill ? (
          <path d={`M-6 0 C-6 ${-h * 0.5} ${-5 + bend * 0.3} ${-h * 0.8} -5 ${-h} L5 ${-h} C5 ${-h * 0.8} ${6 + bend * 0.3} ${-h * 0.5} 6 0Z`} fill="var(--paper-dim)" {...STROKE} />
        ) : (
          <>
            <path d={`M0 0 C${bend} ${-h * 0.35} ${-bend} ${-h * 0.7} 0 ${-h}`} fill="none" stroke="var(--moss-dark)" strokeWidth="4.5" strokeLinecap="round" />
            <path d={`M0 0 C${bend} ${-h * 0.35} ${-bend} ${-h * 0.7} 0 ${-h}`} fill="none" stroke="var(--forest)" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
            {kind !== "fern" && level > 1 && <Leaves h={h} r={r} />}
          </>
        )}
        <g transform={`translate(0 ${-h}) rotate(${tilt})`}>
          <Head kind={kind} r={r} />
        </g>
      </g>
    </g>
  );
}
