import { DESIGN_H, LAYER_SPEED, PATH_W, WORLD_W } from "@/lib/walk/constants";
import { PATH_D, PATH_MIN_Y, getPathPoint } from "@/lib/walk/path";
import { rng } from "@/lib/walk/art";
import { LayerBox } from "./LayerBox";

const TOP = Math.floor(PATH_MIN_Y - 60);
const H = DESIGN_H - TOP;

// Seeded pebbles scattered on the ribbon (path x is world x; getPathPoint with anchor 0 gives y(x)).
const r = rng(9);
const pebbles = Array.from({ length: 260 }, () => {
  const x = r() * PATH_W;
  const p = Math.min(x / WORLD_W, 1);
  const y = getPathPoint(p, x - p * WORLD_W).y;
  return { x: Math.round(x), y: y + (r() - 0.5) * 36, rx: 2 + r() * 3.5 };
});

const GROUND = `${PATH_D}L${PATH_W} ${DESIGN_H}L0 ${DESIGN_H}Z`;

export function PathLayer() {
  return (
    <LayerBox id="path" w={PATH_W} h={H} speed={LAYER_SPEED.path} top={TOP}>
      <g transform={`translate(0 ${-TOP})`}>
        <path d={GROUND} style={{ fill: "var(--moss)" }} />
        <path d={PATH_D} fill="none" style={{ stroke: "var(--moss-dark)" }} strokeOpacity={0.35} strokeWidth="86" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 6)" />
        {/* the walkable ribbon: cream, with the single source-of-truth centreline */}
        <path d={PATH_D} fill="none" style={{ stroke: "var(--paper)" }} strokeWidth="72" strokeLinecap="round" strokeLinejoin="round" />
        <path id="walk-path" d={PATH_D} fill="none" style={{ stroke: "var(--paper-dim)" }} strokeWidth="3" strokeDasharray="22 18" strokeLinecap="round" />
        {pebbles.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.rx * 0.6} style={{ fill: "var(--paper-dim)" }} />
        ))}
      </g>
    </LayerBox>
  );
}
