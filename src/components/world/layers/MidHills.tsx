import { LAYER_SPEED, TILE_W } from "@/lib/walk/constants";
import { OUTLINE, hills } from "@/lib/walk/art";
import { LayerBox } from "./LayerBox";

const H = 500;
const TOP = 300; // ridges land ~ y 440-540 design, with a darker band down to ~585
const ridge = hills(37, 190, 50, H);
const shade = hills(41, 250, 35, H);

// Unique set dressing, placed so it lands on screen at its stop for every anchor (desktop and
// mobile): at p = 0.14 the layer is offset 726; at p = 1.0 it is offset 5184 (see LAYER_SPEED.mid).
const COTTAGE_X = 1030;
const TOWER_X = 5560;

export function MidHills() {
  const cy = ridge.yAt(COTTAGE_X);
  const ty = ridge.yAt(TOWER_X);
  return (
    <LayerBox id="mid" w={TILE_W * 2} h={H} speed={LAYER_SPEED.mid} top={TOP} shadow>
      <defs>
        <g id="mid-tile">
          <path d={ridge.d} style={{ fill: "var(--sage)" }} />
          <path d={shade.d} style={{ fill: "var(--moss)", opacity: 0.75 }} />
        </g>
      </defs>
      <use href="#mid-tile" />
      <use href="#mid-tile" x={TILE_W} />

      {/* distant cottage with chimney (About) */}
      <g transform={`translate(${COTTAGE_X} ${cy.toFixed(1)})`} {...OUTLINE}>
        <rect x="-34" y="-34" width="68" height="36" rx="3" style={{ fill: "var(--paper)" }} />
        <path d="M-44 -32L0 -66L44 -32Z" style={{ fill: "var(--coral)" }} />
        <rect x="16" y="-62" width="9" height="20" style={{ fill: "var(--paper-dim)" }} />
        <rect x="-8" y="-20" width="16" height="22" rx="8" style={{ fill: "var(--honey)" }} />
        <rect x="-28" y="-26" width="11" height="11" rx="2" style={{ fill: "var(--mist)" }} />
        <path d="M20 -66Q10 -78 22 -88Q32 -98 20 -110" fill="none" style={{ stroke: "var(--paper)" }} strokeOpacity={0.8} strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* deploy tower: a lighthouse silhouette that glows once the stars are out */}
      <g transform={`translate(${TOWER_X} ${ty.toFixed(1)})`} {...OUTLINE}>
        <circle cx="0" cy="-118" r="46" fill="var(--honey-soft)" stroke="none" style={{ opacity: "calc(var(--stars) * 0.55)" }} />
        <path d="M-20 0L-12 -100H12L20 0Z" style={{ fill: "var(--paper-dim)" }} />
        <path d="M-17 -30H17L15 -46H-15ZM-14 -64H14L12 -80H-12Z" style={{ fill: "var(--coral)" }} stroke="none" />
        <rect x="-14" y="-124" width="28" height="24" rx="3" style={{ fill: "var(--honey)" }} />
        <path d="M-18 -124L0 -146L18 -124Z" style={{ fill: "var(--plum)" }} />
      </g>
    </LayerBox>
  );
}
