# 06 — Asset Brief (illustrations & SVGs)

All art is **inline SVG React components** (or SVG files imported via SVGR) authored in the Storybook Meadow style (`01` §6). No stock photos, no raster scenery. Optional raster: project screenshots and the OG image only.

## 1. Production approach (pick per asset)
1. **Hand-built SVG by the AI (recommended for v1):** the build prompts ask Claude Code to author SVG paths directly. Good for geometric/organic shapes (hills, trees, stones, fire). Expect a "simple but charming" result; iterate with feedback.
2. **Draw in Figma/Illustrator/Inkscape yourself**, export optimized SVG (SVGO), and drop into `src/components/world/layers/`. Best for the tortoise.
3. **AI image tool → vectorize:** generate concept art with an image model using the prompts below, then trace (Illustrator Image Trace / vectorizer) and clean. Use only for reference or hero pieces; keep it flat-color.

## 2. Global rules for every asset
- ViewBox is defined explicitly; fills use CSS variables (`fill="var(--moss)"`) so day→night tinting works.
- Group ids are kebab-case and meaningful (`#shell`, `#leg-fl`, `#head`).
- No embedded raster, no `<filter>` except the optional grain; no text in SVG (use HTML text).
- ≤ 80 KB gz per layer; SVGO with `removeViewBox: false`, `cleanupIds: false` for animated groups.
- Two tonal steps per object (base + shade); outline 2px `--forest` at 70% (foreground/mid only).

## 3. The tortoise (most important asset)
**File:** `components/tortoise/TortoiseSvg.tsx` · viewBox `0 0 400 300`, facing **right**.

**Layer/group structure (z-order back → front):**
`shadow` · `leg-br` (back-right) · `leg-bl` · `tail` · `shell-base` · `shell-pattern` (hex cells, ids `hex-1…hex-9`) · `backpack` (satchel + straps, plus item groups `item-leaf`, `item-seeds`, `item-map`, `item-lantern`, `item-stick`, `item-letter`) · `leg-fr` · `leg-fl` · `neck` · `head` (with `eye`, `eyelid`, `mouth`, `cheek`).

**Poses to support (via GSAP on groups, or swapped path data):**
| Pose | Notes |
|---|---|
| idle | slight shell scale pulse (1 → 1.015, 3.5 s), blink every ~4 s |
| walk | legs rotate ±18° around the hip pivots in diagonal pairs, cycle 0.9 s at base speed; shell bob ±2 px; head nods ±1° |
| peek | `neck` scaleX 1 → 1.12, the head tilts toward the content |
| hide | head, legs and tail translate into the shell, scale to 0.2, eyelids closed; the shell wobbles |
| wave | `leg-fr` rotates −65° ↔ −40° repeating |
| sleep | eyes closed, head lowered 8 px, "z" bubbles (HTML overlay) |
| hop | squash (scaleY 0.92) → stretch (1.06) → land |
Pivot points are set with `transform-origin` in SVG user units; document them in a comment in the component.

**AI concept prompt (for reference art):**
> "A friendly cartoon Hermann's tortoise, side view facing right, flat vector paper-cut style, matte olive-green domed shell with a honey-yellow hexagon pattern, cream belly, sage-green skin, small round dark eyes with a tiny highlight, wearing a tiny brown canvas satchel on its shell, soft rounded shapes, 2px dark-green outline, warm cream background, no gradients, no text, children's picture-book illustration, consistent line weight."

## 4. World layers (`components/world/layers/`)
| Component | ViewBox / size | Contents | Notes |
|---|---|---|---|
| `Sky.tsx` | gradient via CSS vars | sun, moon, stars (60), cloud sprites ×6 | stars fade by progress; sun/moon move along an arc |
| `FarHills.tsx` | `0 0 6000 400` tile ×2 | two silhouettes, sage/mist | no outline; seamless horizontal repeat |
| `MidHills.tsx` | `0 0 6000 500` ×2 | rounded hills in moss tints, cottage, deploy tower | tower silhouette near the end |
| `Trees.tsx` | `0 0 6000 600` ×2 | 6 tree types, bushes, flowering shrubs | foliage colors shift by section via tint |
| `PathLayer.tsx` | the whole world width | the `#walk-path` ribbon (cream, pebble texture, dashed center) + invisible motion path | single source of truth for path geometry |
| `Foreground.tsx` | `0 0 6000 300` ×2 | grass tufts, flowers, leaf silhouettes | 85% opacity at the edges, `pointer-events: none` |
| `Fx.tsx` | canvas-less | CSS/SVG particles: dew twinkles, dust motes, sparks, fireflies | counts tiered by performance |
| `Grain.tsx` | full viewport | noise overlay | multiply blend |

## 5. Set pieces (`components/world/sets/`)
| Set | Elements | Animated parts |
|---|---|---|
| `HelloSet` | mossy mound home with a round door, wooden name signpost, dew sparkles, a rising sun | sparkle twinkle, cloud drift |
| `AboutSet` | cottage + chimney smoke, fence with a bird, bench with a book, wildflowers, a butterfly | smoke curl, butterfly path, bird head bob |
| `SkillsSet` | wicker fence + gate, 5 plant beds, 5 plant types ×5 heights, signs, a watering can, sprouts | plant sway, a water drip, a bee |
| `ProjectsSet` | stream (layered ripples), 3–5 stones + "More" stone, lily pads, reeds, a jumping fish | ripples, fish jump, stone drop-in |
| `ExperienceSet` | hill slope, M wooden signposts with hanging cards, pine trees, a bird flock, light rays | ray shimmer, flock glide |
| `FunSet` | campfire + logs, tent, lantern, string with pinned paper notes, moths | flame flicker, sparks, lantern sway |
| `ContactSet` | pond with reflection, dock + mailbox, deploy tower glow, many fireflies, moon | water ripple, firefly drift, mailbox flag wobble |

### Plant sprite spec (Skills)
5 plant families × 5 heights = shared parametric components: `<Plant kind="sunflower|mushroom|tulip|fern|daisy" level={1..5} />`. Height scales stem length (level × 18 px base); head size is constant per kind. Sprout variant for `learning`.

## 6. UI illustrations & icons
- Speech-bubble blob shapes (3 variants + tails: left/right/down).
- Narrator caption underline squiggle.
- Dot-trail marker: tiny tortoise head.
- Icons: github, linkedin, mail, document, pin, external-link, volume-on/off, arrow-left/right, chevron-down, close, check.
- Favicon: a tortoise shell (round hex pattern), SVG, with a dark-mode-safe palette.
- Fire-ember particle, firefly glow (radial gradient exception allowed inside `Fx`).

## 7. Raster assets (the only ones)
| Asset | Spec |
|---|---|
| Project screenshots | 1280×800 → export WebP ≤ 120 KB; shown in a polaroid frame with alt text |
| OG image | 1200×630, generated by `opengraph-image.tsx`; a static fallback PNG ≤ 200 KB |
| Resume | `public/resume.pdf` (≤ 300 KB) |
| Apple touch icon | 180×180 PNG |

## 8. Audio (optional)
`wind-meadow.mp3`, `stream.mp3`, `crickets-dusk.mp3`, `night-pond.mp3`, `step.mp3` (≤ 150 KB each, 64 kbps mono, loopable, licensed CC0 or self-made). Credit in the footer if the license requires.

## 9. Naming & export checklist
- [ ] kebab-case file names, PascalCase components
- [ ] every group id documented in the component header comment
- [ ] SVGO pass done; sizes recorded in `ASSETS.md`
- [ ] colors reference tokens only
- [ ] verified at 320 px, 1440 px and 2560 px widths
- [ ] tested with the day/night tint overlay at progress 0, 0.5 and 1
