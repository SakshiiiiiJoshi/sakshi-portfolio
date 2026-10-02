import { LAYER_SPEED, TILE_W } from "@/lib/walk/constants";
import { OUTLINE, rng, scatter } from "@/lib/walk/art";
import { LayerBox } from "./LayerBox";

const H = 600;
const TOP = 250; // layer bottom at design y 850
const BASE = 390; // tree baseline in layer coords => design y 640, just above the path ribbon

// Six tree types, each drawn with its trunk base at (0,0). Two tonal steps, outline per 01 §6.
function Defs() {
  return (
    <defs>
      <g id="tree-1" {...OUTLINE}>
        <rect x="-7" y="-60" width="14" height="60" rx="5" style={{ fill: "var(--paper-dim)" }} />
        <ellipse cx="0" cy="-110" rx="62" ry="58" style={{ fill: "var(--moss)" }} />
        <path d="M-40 -90Q0 -62 44 -96Q40 -62 0 -52Q-36 -56 -40 -90Z" style={{ fill: "var(--moss-dark)" }} stroke="none" />
      </g>
      <g id="tree-2" {...OUTLINE}>
        <rect x="-6" y="-50" width="12" height="50" rx="4" style={{ fill: "var(--paper-dim)" }} />
        <ellipse cx="0" cy="-118" rx="40" ry="76" style={{ fill: "var(--shell)" }} />
        <path d="M6 -180Q42 -120 24 -62Q38 -120 6 -180Z" style={{ fill: "var(--moss-dark)" }} stroke="none" />
      </g>
      <g id="tree-3" {...OUTLINE}>
        <rect x="-6" y="-30" width="12" height="30" rx="3" style={{ fill: "var(--paper-dim)" }} />
        <path d="M-56 -26L0 -100L56 -26Z" style={{ fill: "var(--forest)" }} />
        <path d="M-46 -76L0 -144L46 -76Z" style={{ fill: "var(--moss-dark)" }} />
        <path d="M-34 -122L0 -184L34 -122Z" style={{ fill: "var(--moss)" }} />
      </g>
      <g id="tree-4" {...OUTLINE}>
        <path d="M-5 0L-8 -50L-30 -84M5 0L7 -56L34 -96" fill="none" style={{ stroke: "var(--paper-dim)" }} strokeWidth="9" strokeOpacity={1} />
        <circle cx="-34" cy="-98" r="38" style={{ fill: "var(--sage)" }} />
        <circle cx="36" cy="-110" r="44" style={{ fill: "var(--moss)" }} />
        <circle cx="0" cy="-86" r="30" style={{ fill: "var(--shell)" }} stroke="none" />
      </g>
      <g id="tree-5" {...OUTLINE}>
        <rect x="-7" y="-56" width="14" height="56" rx="5" style={{ fill: "var(--paper-dim)" }} />
        <ellipse cx="0" cy="-104" rx="58" ry="52" style={{ fill: "var(--sage)" }} />
        {[[-30, -112], [-6, -138], [22, -118], [38, -92], [-22, -82], [10, -96]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="6" stroke="none" style={{ fill: i % 2 ? "var(--honey)" : "var(--coral)" }} />
        ))}
      </g>
      <g id="tree-6" {...OUTLINE}>
        <rect x="-5" y="-26" width="10" height="26" rx="3" style={{ fill: "var(--paper-dim)" }} />
        <path d="M0 -190Q34 -120 22 -26H-22Q-34 -120 0 -190Z" style={{ fill: "var(--moss-dark)" }} />
        <path d="M2 -176Q26 -118 18 -30Q22 -118 2 -176Z" style={{ fill: "var(--moss)" }} stroke="none" />
      </g>
      <g id="bush-1" {...OUTLINE}>
        <path d="M-44 0Q-48 -34 -18 -40Q-6 -62 22 -44Q50 -40 44 0Z" style={{ fill: "var(--moss)" }} />
      </g>
      <g id="bush-2" {...OUTLINE}>
        <path d="M-34 0Q-40 -26 -12 -30Q4 -46 26 -28Q42 -22 34 0Z" style={{ fill: "var(--shell)" }} />
      </g>
      <g id="shrub" {...OUTLINE}>
        <path d="M-38 0Q-42 -30 -14 -34Q2 -52 24 -32Q44 -26 38 0Z" style={{ fill: "var(--sage)" }} />
        {[[-18, -22], [4, -34], [20, -18], [-2, -14]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4.5" stroke="none" style={{ fill: i % 2 ? "var(--coral)" : "var(--honey)" }} />
        ))}
      </g>
    </defs>
  );
}

interface Item { id: string; x: number; s: number }
const r = rng(5);
const trees: Item[] = scatter(51, 150, 290).map((x) => ({ id: `tree-${1 + Math.floor(r() * 6)}`, x, s: 0.75 + r() * 0.55 }));
const small: Item[] = scatter(52, 120, 260).map((x) => ({
  id: r() < 0.25 ? "shrub" : r() < 0.6 ? "bush-1" : "bush-2",
  x,
  s: 0.8 + r() * 0.5,
}));

export function Trees() {
  return (
    <LayerBox id="trees" w={TILE_W * 2} h={H} speed={LAYER_SPEED.trees} top={TOP} shadow>
      <Defs />
      <defs>
        <g id="trees-tile">
          {/* soft meadow band so there is never a gap above the path ribbon */}
          <rect x="0" y={BASE} width={TILE_W} height={H - BASE} style={{ fill: "var(--sage)" }} />
          {trees.map((t, i) => (
            <use key={`t${i}`} href={`#${t.id}`} transform={`translate(${t.x} ${BASE}) scale(${t.s})`} />
          ))}
          {small.map((t, i) => (
            <use key={`b${i}`} href={`#${t.id}`} transform={`translate(${t.x} ${BASE + 14}) scale(${t.s})`} />
          ))}
        </g>
      </defs>
      <use href="#trees-tile" />
      <use href="#trees-tile" x={TILE_W} />
    </LayerBox>
  );
}
