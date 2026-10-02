import { LAYER_SPEED, TILE_W } from "@/lib/walk/constants";
import { hills } from "@/lib/walk/art";
import { LayerBox } from "./LayerBox";

const H = 400;
const TOP = 360; // design y of the layer top; ridges land ~ y 430-555, above the path (584-722)
const back = hills(11, 110, 40, H);
const front = hills(23, 160, 35, H);

export function FarHills() {
  // Max travel 0.15 * 17280 = 2592 + the widest viewport (~2048) < 6000: a single tile suffices.
  return (
    <LayerBox id="far" w={TILE_W} h={H} speed={LAYER_SPEED.far} top={TOP} shadow>
      <path d={back.d} style={{ fill: "var(--mist-deep)" }} />
      <path d={front.d} style={{ fill: "var(--sage)" }} />
      {/* tiny distant windmill on the near ridge */}
      <g transform={`translate(2400 ${front.yAt(2400).toFixed(1)})`} style={{ fill: "var(--forest)", opacity: 0.45 }}>
        <path d="M-7 0L-4 -34H4L7 0Z" />
        <g transform="translate(0 -34)">
          <path d="M-2 0L-26 -8L-24 -12ZM2 0L26 8L24 12ZM0 -2L8 -26L12 -24ZM0 2L-8 26L-12 24Z" />
        </g>
      </g>
    </LayerBox>
  );
}
