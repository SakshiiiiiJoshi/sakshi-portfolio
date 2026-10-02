import { LAYER_SPEED, TILE_W } from "@/lib/walk/constants";
import { OUTLINE, rng, scatter, tuftPath } from "@/lib/walk/art";
import { LayerBox } from "./LayerBox";

const H = 300;
const BASE = 292; // blades root just inside the layer bottom (design y 892)

const tufts = scatter(71, 140, 330).map((x, i) => ({ x, d: tuftPath(5 + (i % 3), 60 + (i % 4) * 22, 700 + i), tone: i % 2 }));
const rf = rng(72);
const flowers = scatter(73, 260, 560).map((x) => ({ x, h: 40 + rf() * 50, c: rf() < 0.5 ? "var(--coral)" : rf() < 0.5 ? "var(--honey)" : "var(--mist)" }));
const leaves = scatter(74, 700, 1300).map((x, i) => ({ x, rot: -24 + (i % 3) * 22, s: 0.8 + rf() * 0.6 }));

export function Foreground() {
  // Tile edges: every item sits strictly inside [0, TILE_W) with 60+ units of clearance, and the
  // layer wraps modulo TILE_W, so the second copy continues the first without a seam.
  return (
    <LayerBox id="foreground" w={TILE_W * 2} h={H} speed={LAYER_SPEED.foreground} wrap={TILE_W}>
      <defs>
        <g id="fg-tile">
          {tufts.filter((t) => t.x > 60 && t.x < TILE_W - 60).map((t, i) => (
            <path key={`g${i}`} className={i % 2 ? "fg-alt" : undefined} d={t.d} transform={`translate(${t.x} ${BASE})`} {...OUTLINE} strokeWidth={1.5} style={{ fill: t.tone ? "var(--moss)" : "var(--shell)" }} />
          ))}
          {flowers.filter((f) => f.x > 60 && f.x < TILE_W - 60).map((f, i) => (
            <g key={`f${i}`} className={i % 2 ? "fg-alt" : "fg-alt-narrow"} transform={`translate(${f.x} ${BASE})`} {...OUTLINE} strokeWidth={1.5}>
              <path d={`M0 0Q4 ${-f.h / 2} 8 ${-f.h}`} fill="none" style={{ stroke: "var(--moss-dark)" }} strokeOpacity={1} strokeWidth="3" />
              <g transform={`translate(8 ${-f.h})`}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx="0" cy="-8" rx="5.5" ry="8" transform={`rotate(${a})`} style={{ fill: f.c }} />
                ))}
                <circle r="4" style={{ fill: "var(--honey-soft)" }} />
              </g>
            </g>
          ))}
          {/* leaf silhouettes along the bottom edge at 85% opacity so they never block content */}
          {leaves.filter((l) => l.x > 80 && l.x < TILE_W - 80).map((l, i) => (
            <path key={`l${i}`} className={i % 2 ? "fg-alt" : "fg-alt-narrow"} d="M0 0Q-26 -46 4 -96Q40 -50 0 0Z" transform={`translate(${l.x} ${H + 6}) rotate(${l.rot}) scale(${l.s})`} style={{ fill: "var(--forest)", opacity: 0.85 }} />
          ))}
        </g>
      </defs>
      <use href="#fg-tile" />
      <use href="#fg-tile" x={TILE_W} />
    </LayerBox>
  );
}
