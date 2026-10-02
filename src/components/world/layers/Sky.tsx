import { LAYER_SPEED, PATH_W } from "@/lib/walk/constants";
import { rng } from "@/lib/walk/art";

const r = rng(3);
const STARS = Array.from({ length: 60 }, () => ({
  x: Math.round(r() * 1000),
  y: Math.round(r() * 520),
  r: 1 + r() * 1.4,
}));

// Six cloud sprites. x is in design units across the (slow, 0.05) cloud layer; d = drift seconds.
const CLOUDS = [
  { x: 120, y: 9, w: 240, d: 95, delay: 0 },
  { x: 640, y: 20, w: 180, d: 120, delay: -40 },
  { x: 1180, y: 8, w: 280, d: 110, delay: -70 },
  { x: 1700, y: 24, w: 200, d: 130, delay: -20 },
  { x: 2250, y: 12, w: 250, d: 100, delay: -55 },
  { x: 2750, y: 22, w: 190, d: 115, delay: -85 },
];

export function Sky() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(to bottom, var(--sky-top), var(--sky-bottom))" }}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMin slice" style={{ opacity: "var(--stars)" }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} style={{ fill: "var(--paper)" }} />
        ))}
      </svg>

      <div data-sun className="world-orb" style={{ background: "var(--honey)", boxShadow: "0 0 90px 30px var(--honey-soft)" }} />
      <div data-moon className="world-orb" style={{ background: "var(--paper)", boxShadow: "0 0 70px 18px color-mix(in srgb, var(--paper) 45%, transparent)" }}>
        <span className="moon-halo" />
        <i style={{ left: "26%", top: "30%", width: "18%", height: "18%" }} />
        <i style={{ left: "56%", top: "52%", width: "26%", height: "26%" }} />
        <i style={{ left: "34%", top: "66%", width: "12%", height: "12%" }} />
      </div>

      {/* clouds layer A: pans at 0.05, each sprite also drifts on its own CSS loop */}
      <div className="world-layer" data-layer="sky" data-speed={LAYER_SPEED.sky} style={{ top: 0, left: 0, width: `calc(var(--s) * ${PATH_W}px)`, height: "100%" }}>
        {CLOUDS.map((c, i) => (
          <svg
            key={i}
            className={i % 2 ? "world-cloud cloud-alt" : "world-cloud"}
            viewBox="0 0 200 80"
            style={{
              left: `calc(var(--s) * ${c.x}px)`,
              top: `${c.y}%`,
              width: `calc(var(--s) * ${c.w}px)`,
              animationDuration: `${c.d}s`,
              animationDelay: `${c.delay}s`,
            }}
          >
            <path d="M18 66Q2 66 4 52Q6 40 26 40Q30 20 56 22Q70 4 100 12Q124 4 140 24Q172 20 178 44Q198 46 194 60Q192 68 176 66Z" style={{ fill: "var(--paper)" }} />
          </svg>
        ))}
      </div>
    </div>
  );
}
