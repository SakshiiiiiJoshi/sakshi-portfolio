/**
 * Stop 2 set piece: wildflowers along the path, a distant cottage with curling smoke, a fence with a
 * head-bobbing bird, a bench with an open book, and one butterfly that crosses every ~12 s. Same
 * framing as HelloSet: viewBox x=700 ↔ the tortoise. Animation is CSS transform/opacity only (see
 * `.about-*` in globals.css), paused by `.world[data-paused]` and frozen under reduced motion.
 */
const FLOWERS: ReadonlyArray<readonly [number, number, string, number]> = [
  [90, 742, "var(--coral)", 1],
  [150, 758, "var(--honey)", 0.8],
  [230, 748, "var(--mist-deep)", 0.9],
  [330, 764, "var(--coral)", 0.75],
  [412, 744, "var(--honey)", 1.05],
  [520, 760, "var(--mist-deep)", 0.85],
  [600, 746, "var(--coral)", 0.9],
  [770, 752, "var(--honey)", 0.8],
  [860, 766, "var(--coral)", 0.7],
  [940, 748, "var(--mist-deep)", 0.9],
];

function Flower({ x, y, color, s }: { x: number; y: number; color: string; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C-2 -16 3 -30 1 -44" fill="none" stroke="var(--moss-dark)" strokeWidth="3" strokeLinecap="round" />
      <path d="M1 -18 C12 -26 18 -22 20 -18 C12 -12 6 -12 1 -18Z" fill="var(--moss)" stroke="var(--forest)" strokeWidth="2" strokeLinejoin="round" />
      <g transform="translate(1 -48)" fill={color} stroke="var(--forest)" strokeWidth="2" strokeLinejoin="round">
        <circle cx="0" cy="-9" r="7" />
        <circle cx="9" cy="-2" r="7" />
        <circle cx="5" cy="9" r="7" />
        <circle cx="-5" cy="9" r="7" />
        <circle cx="-9" cy="-2" r="7" />
        <circle r="5" fill="var(--paper)" />
      </g>
    </g>
  );
}

export function AboutSet() {
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
      {/* distant cottage + chimney smoke */}
      <g transform="translate(120 520)">
        <rect x="0" y="40" width="130" height="86" rx="4" fill="var(--paper-dim)" stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M-14 46 L65 -16 L144 46Z" fill="var(--coral)" stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" />
        <rect x="100" y="-10" width="16" height="34" fill="var(--paper-dim)" stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" />
        <rect x="52" y="76" width="30" height="50" rx="14" fill="var(--forest)" />
        <rect x="14" y="62" width="22" height="22" rx="3" fill="var(--honey)" stroke="var(--forest)" strokeWidth="2.5" />
        <rect x="94" y="62" width="22" height="22" rx="3" fill="var(--honey)" stroke="var(--forest)" strokeWidth="2.5" />
        {[0, 1, 2].map((i) => (
          <circle key={i} className="about-smoke" cx="108" cy="-14" r={7 + i * 2} fill="var(--paper)" style={{ animationDelay: `${i * 1.6}s` }} />
        ))}
      </g>

      {/* fence with a bird */}
      <g stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" fill="var(--paper-dim)">
        {[300, 360, 420, 480, 540].map((x) => (
          <path key={x} d={`M${x} 736 V672 L${x + 8} 662 L${x + 16} 672 V736Z`} />
        ))}
        <rect x="296" y="686" width="268" height="9" rx="3" />
        <rect x="296" y="714" width="268" height="9" rx="3" />
      </g>
      <g transform="translate(420 660)">
        <ellipse cx="0" cy="-10" rx="15" ry="11" fill="var(--coral)" stroke="var(--forest)" strokeWidth="2.5" />
        <path d="M-14 -8 L-27 -2 L-13 -2Z" fill="var(--plum)" stroke="var(--forest)" strokeWidth="2" strokeLinejoin="round" />
        <g className="about-bird-head">
          <circle cx="11" cy="-22" r="8" fill="var(--coral)" stroke="var(--forest)" strokeWidth="2.5" />
          <path d="M18 -23 L26 -20 L18 -18Z" fill="var(--honey)" stroke="var(--forest)" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="13" cy="-24" r="1.8" fill="var(--ink)" />
        </g>
        <path d="M-2 0 V8 M6 0 V8" stroke="var(--forest)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* bench with an open book */}
      <g stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <path d="M640 736 V700 M740 736 V700" fill="none" />
        <rect x="626" y="684" width="128" height="16" rx="5" fill="var(--honey-soft)" />
        <rect x="630" y="650" width="120" height="12" rx="5" fill="var(--honey-soft)" />
        <path d="M638 662 V684 M742 662 V684" fill="none" />
        <g transform="translate(670 676)">
          <path d="M0 0 Q14 -10 28 0 V-12 Q14 -22 0 -12Z" fill="var(--paper)" />
          <path d="M28 0 Q42 -10 56 0 V-12 Q42 -22 28 -12Z" fill="var(--paper)" />
          <path d="M8 -9 H20 M36 -9 H48" fill="none" strokeWidth="1.8" />
        </g>
      </g>

      {FLOWERS.map(([x, y, color, s]) => (
        <Flower key={x} x={x} y={y} color={color} s={s} />
      ))}

      {/* butterfly: crosses the scene once per cycle */}
      <g className="about-butterfly">
        <g className="about-butterfly-wings">
          <ellipse cx="-6" cy="-3" rx="7" ry="9" fill="var(--honey)" stroke="var(--forest)" strokeWidth="1.8" />
          <ellipse cx="6" cy="-3" rx="7" ry="9" fill="var(--coral)" stroke="var(--forest)" strokeWidth="1.8" />
        </g>
        <path d="M0 -8 V8" stroke="var(--forest)" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
