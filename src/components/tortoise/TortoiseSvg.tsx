import { forwardRef, type CSSProperties, type SVGProps } from "react";

/*
 * TortoiseSvg — the mascot, hand-authored. viewBox 0 0 400 300, facing RIGHT.
 *
 * Every group is a direct child of #body (except #shadow) so poses can tween
 * them independently. Pivots are absolute viewBox coordinates; poses apply
 * them via GSAP `svgOrigin` (see PIVOTS in poses.ts — keep both in sync).
 *
 *  id             pivot (x y)   notes
 *  ─────────────  ────────────  ─────────────────────────────────────────
 *  shadow         —             ground ellipse, never animated except hop
 *  body           190 255       wrapper (everything but shadow); hop squash
 *  leg-br         108 214       far back leg (hip)
 *  leg-bl         142 214       far-mid back leg (hip)
 *  tail           80 212        root of the tail at the shell rim
 *  shell-base     192 220       plastron + dome + rim shade; breathes/wobbles
 *  shell-pattern  192 220       hex-1…hex-9, each a two-tone cell
 *  backpack       192 220       satchel, strap; moves with the shell
 *    item-leaf    104 128       item pivots sit on the satchel mouth
 *    item-seeds   115 126
 *    item-map     126 126
 *    item-lantern 137 128
 *    item-stick   146 128
 *    item-letter  152 140
 *  leg-fr         272 214       near front leg (hip) — the waving leg
 *  leg-fl         232 214       near mid leg (hip)
 *  neck           290 190       joins the shell; scaleX for peek
 *  head           335 180       nape; tilt/nod/lower
 *    eye          372 170
 *    eyelid       372 164       top edge, scaleY 0 (open) → 1 (closed)
 *    mouth        —
 *    cheek        —
 *
 * Colours come only from palette tokens; the two "derived" shades are
 * color-mix()es of tokens so day→night tinting still flows through them.
 */

const SKIN = "var(--sage)";
const SKIN_SHADE = "color-mix(in srgb, var(--sage) 70%, var(--forest))";
const HEX_SHADE = "color-mix(in srgb, var(--honey) 72%, var(--coral))";
const BROWN = "color-mix(in srgb, var(--coral) 40%, var(--ink))";
const BROWN_SHADE = "color-mix(in srgb, var(--coral) 22%, var(--ink))";

/** Slightly irregular flat-top hexagon, deterministic per seed. */
function hexPath(cx: number, cy: number, r: number, seed: number) {
  const pts: string[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k * 60 * Math.PI) / 180;
    const rr = r * (1 + 0.07 * Math.sin(k * 2.3 + seed * 1.7));
    const dx = 0.8 * Math.sin(k * 1.3 + seed);
    pts.push(`${(cx + rr * Math.cos(a) + dx).toFixed(1)} ${(cy + rr * Math.sin(a) * 0.9).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

const HEXES: [number, number, number][] = [
  [205, 88, 16],
  [170, 98, 15],
  [242, 100, 15],
  [160, 128, 15],
  [200, 128, 16],
  [242, 136, 16],
  [280, 156, 13],
  [205, 170, 15],
  [250, 182, 14],
];

const leg = (cx: number) =>
  `M${cx - 16} 208C${cx - 18} 234 ${cx - 20} 250 ${cx - 14} 258C${cx - 4} 264 ${cx + 14} 264 ${cx + 19} 256C${cx + 20} 240 ${cx + 17} 224 ${cx + 16} 208Z`;

export const TortoiseSvg = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  function TortoiseSvg(props, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 400 300"
        fill="none"
        stroke="var(--forest)"
        strokeOpacity={0.7}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <ellipse id="shadow" className="shadow-ellipse" style={{ "--base": 0.12 } as CSSProperties} cx="195" cy="262" rx="150" ry="13" fill="var(--forest)" stroke="none" />

        <g id="body">
          {/* far legs + tail sit behind the shell */}
          <path id="leg-br" d={leg(108)} fill={SKIN_SHADE} />
          <path id="leg-bl" d={leg(142)} fill={SKIN_SHADE} />
          <path id="tail" d="M82 204C64 204 54 216 49 226C62 227 76 224 84 217Z" fill={SKIN} />

          <g id="shell-base">
            {/* plastron (belly) */}
            <path d="M92 212C150 232 250 232 296 210L292 224C240 240 150 240 100 226Z" fill="var(--paper)" />
            {/* dome */}
            <path d="M78 216C74 150 112 66 192 62C272 60 312 140 306 216C250 223 140 224 78 216Z" fill="var(--shell)" />
            {/* rim shade */}
            <path d="M80 200C150 213 240 213 304 198L306 216C250 223 140 224 78 216Z" fill="var(--moss-dark)" stroke="none" />
          </g>

          <g id="shell-pattern" strokeWidth={1.5}>
            {HEXES.map(([cx, cy, r], i) => (
              <g id={`hex-${i + 1}`} key={i}>
                <path d={hexPath(cx, cy, r, i + 1)} fill={HEX_SHADE} />
                <path d={hexPath(cx - 1, cy - 2, r * 0.76, i + 1)} fill="var(--honey)" stroke="none" />
              </g>
            ))}
          </g>

          <g id="backpack">
            <path id="strap" d="M148 160C170 180 190 205 196 218" stroke={BROWN_SHADE} strokeOpacity={1} strokeWidth={5} />
            {/* items peek out of the satchel mouth; each starts at scale 0 */}
            <g id="item-leaf">
              <g transform="translate(104 128) rotate(-32)">
                <path d="M0 0C-9 -8 -8 -24 2 -32C12 -24 11 -8 0 0Z" fill="var(--moss)" />
                <path d="M0 0L1 -24" strokeWidth={1.2} />
              </g>
            </g>
            <g id="item-seeds">
              <g transform="translate(115 126) rotate(-14)">
                <rect x="-8" y="-22" width="16" height="22" rx="2.5" fill="var(--coral)" />
                <rect x="-8" y="-22" width="16" height="6" rx="2" fill="var(--paper)" strokeWidth={1.2} />
                <circle cx="-2" cy="-8" r="1.3" fill="var(--forest)" stroke="none" />
                <circle cx="3" cy="-5" r="1.3" fill="var(--forest)" stroke="none" />
              </g>
            </g>
            <g id="item-map">
              <g transform="translate(126 126) rotate(4)">
                <rect x="-7" y="-26" width="14" height="26" rx="3" fill="var(--paper-dim)" />
                <path d="M-7 -21H7M-7 -5H7" strokeWidth={1.2} />
                <path d="M-3 -14l3 -3l3 4" stroke="var(--coral)" strokeOpacity={1} strokeWidth={1.2} />
              </g>
            </g>
            <g id="item-lantern">
              <g transform="translate(137 128) rotate(12)">
                <path d="M-5 -26C-5 -34 5 -34 5 -26" strokeWidth={1.5} />
                <rect x="-7" y="-26" width="14" height="20" rx="3" fill="var(--honey-soft)" />
                <rect x="-7" y="-8" width="14" height="6" rx="2" fill={BROWN_SHADE} />
                <circle cx="0" cy="-17" r="3" fill="var(--honey)" stroke="none" />
              </g>
            </g>
            <g id="item-stick">
              <g transform="translate(146 128) rotate(28)">
                <path d="M0 0L0 -34" stroke={BROWN} strokeOpacity={1} strokeWidth={2.5} />
                <rect x="-5" y="-42" width="10" height="11" rx="4.5" fill="var(--paper)" />
              </g>
            </g>
            <g id="item-letter">
              <g transform="translate(152 140) rotate(58)">
                <rect x="-11" y="-16" width="22" height="16" rx="2" fill="var(--paper)" />
                <path d="M-11 -16L0 -7L11 -16" strokeWidth={1.2} />
                <circle cx="0" cy="-7" r="2.6" fill="var(--coral)" stroke="none" />
              </g>
            </g>
            {/* satchel body, flap, buckle, stitches */}
            <path d="M98 134C98 128 104 126 110 126H140C146 126 150 130 150 136L152 176C152 182 148 184 142 184H106C100 184 96 182 96 176Z" fill={BROWN} />
            <path d="M97 134C97 128 104 126 110 126H140C146 126 151 130 151 136V150C130 158 118 158 97 150Z" fill={BROWN_SHADE} />
            <circle cx="124" cy="156" r="3" fill="var(--honey)" strokeWidth={1.2} />
            <path d="M102 144C118 151 130 151 146 144" stroke="var(--paper)" strokeOpacity={0.8} strokeWidth={1.2} strokeDasharray="3 3" />
            {/* satchel label — handwritten note on the flap */}
            <text
              x="124"
              y="172"
              textAnchor="middle"
              fontSize="7.5"
              fontFamily="var(--nf-hand, cursive)"
              fontWeight="500"
              fill="var(--paper)"
              fillOpacity={0.82}
              stroke="none"
              transform="rotate(-2, 124, 172)"
            >
              distractingly
            </text>
            <text
              x="124"
              y="181"
              textAnchor="middle"
              fontSize="7.5"
              fontFamily="var(--nf-hand, cursive)"
              fontWeight="500"
              fill="var(--paper)"
              fillOpacity={0.82}
              stroke="none"
              transform="rotate(-2, 124, 181)"
            >
              focused...
            </text>
          </g>

          <path id="leg-fr" d={leg(272)} fill={SKIN} />
          <path id="leg-fl" d={leg(232)} fill={SKIN} />

          <path id="neck" d="M286 160C310 150 335 148 346 160L350 200C330 218 305 220 288 214Z" fill={SKIN} />

          <g id="head">
            <path d="M326 168C330 148 360 140 378 152C394 162 396 182 386 194C374 206 345 208 332 196C324 188 324 178 326 168Z" fill={SKIN} />
            <path d="M334 162C350 149 372 149 384 158C368 156 348 159 334 170Z" fill={SKIN_SHADE} stroke="none" />
            <ellipse id="cheek" cx="366" cy="187" rx="6" ry="4" fill="var(--coral)" fillOpacity={0.55} stroke="none" />
            <g id="eye">
              <circle cx="372" cy="170" r="4.4" fill="var(--ink)" stroke="none" />
              <circle cx="373.6" cy="168.4" r="1.4" fill="var(--paper)" stroke="none" />
            </g>
            <path id="eyelid" d="M365.5 170a6.5 6.5 0 0 1 13 0a6.5 6.5 0 0 1 -13 0Z" fill={SKIN} stroke="none" />
            <path id="mouth" d="M380 190C385 192 390 190 392 186" strokeWidth={1.8} />
            <circle cx="390" cy="171" r="1" fill="var(--forest)" stroke="none" />
          </g>
        </g>
      </svg>
    );
  },
);
