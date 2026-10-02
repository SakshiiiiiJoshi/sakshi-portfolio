# 03 — World & Path Spec

The "world" is one wide illustrated scene that pans horizontally past a mostly stationary tortoise. The path is a single continuous curve; stops sit at fixed progress values.

## 1. Coordinate system
- **Design canvas:** 1440 × 900 viewport (16:10). All art is authored to this and scaled with `preserveAspectRatio="xMidYMid slice"` for the sky and `"xMinYMax meet"`-like logic for ground layers (see 5).
- **World width:** `WORLD_W = 12 × viewport width` (≈ 17,280 units at design size). Each stop occupies about 1.5 viewport widths, with ~1 viewport of travel between stops.
- **Camera:** a virtual window of 1 viewport width. The tortoise sits at **x = 35% of the viewport (desktop) / 50% (mobile)** and the camera follows it. Content cards appear in the remaining right-hand space (desktop) or in a bottom sheet (mobile).
- **Path:** an SVG `<path id="walk-path">` that gently undulates (hills, a stream dip, a climb). The tortoise rides along it: its position comes from `MotionPathPlugin` at `progress`, and its rotation follows the tangent (clamped to ±14° so it doesn't tilt like a rollercoaster).

## 2. The seven stops: placement and staging

| # | id | progress | World X (≈) | Path shape here | Dominant colors |
|---|---|---|---|---|---|
| 1 | `hello` | 0.00 | 0 | flat, a soft hill start | peach dawn, sage, honey sun rising |
| 2 | `about` | 0.14 | 2,400 | gentle rolling meadow | mist, moss, wildflowers |
| 3 | `skills` | 0.30 | 5,200 | flat garden clearing | moss, coral, honey flowers |
| 4 | `projects` | 0.48 | 8,300 | slight dip, then stones across a stream | mist-deep water, grey-sage stones |
| 5 | `experience` | 0.66 | 11,300 | climbing slope | golden honey, coral, wooden browns |
| 6 | `fun` | 0.83 | 14,200 | crest of the hill, flat | plum, coral fire, warm orange |
| 7 | `contact` | 1.00 | 17,000 | down to a pond bank | night navy, moon cream, firefly honey |

World X values are indicative. The build derives positions from path length at each stop's progress.

## 3. Parallax layers (back → front)

| z | Layer id | Speed | Contents |
|---|---|---|---|
| 0 | `sky` | 0.05 | Gradient (CSS vars), sun/moon, stars (night), clouds layer A |
| 1 | `far-hills` | 0.15 | 2 overlapping silhouettes in sage/mist, no outline, tiny distant windmill or tree line |
| 2 | `mid-hills` | 0.30 | Rounded hills in moss tints, a distant cottage at About, a lighthouse-shaped "deploy tower" silhouette near Contact (a dev nod) |
| 3 | `trees` | 0.55 | Round-canopy trees, bushes, flowering shrubs, seasonal color shift by stop |
| 4 | `path` | 1.00 | The walkable path (a cream ribbon with pebbles) + stop-specific set pieces |
| 4 | `tortoise` | fixed x | The `Tortoise` component (above path, below foreground) |
| 5 | `foreground` | 1.35 | Tall grass tufts, flowers, leaf silhouettes, occasional frame-crossing butterfly. Blurred or 85% opacity edges so it never blocks content |
| 6 | `fx` | n/a | Fireflies, dust motes, light rays, paper grain overlay |
| 7 | `ui` | fixed | HUD, cards, bubbles |

Layers 0–3 and 5 are **tiled/long SVGs translated on X** (`x = -progress × WORLD_W × speed`). Layer 4 translates at 1.0 so the path stays aligned with the tortoise.

## 4. Set pieces per stop (what's physically in the scene)

### Stop 1 — Hello (dawn)
- Sun half-risen behind far hills (honey), pale peach sky, soft clouds drifting.
- The tortoise's **burrow/home** is a mossy mound with a round door at the left edge. A small wooden signpost reads the name.
- Dew sparkles on grass (tiny twinkles).
- Speech bubble above the tortoise with the intro; hero text card to the right.

### Stop 2 — About (morning)
- Wildflowers (coral, honey, mist). A distant cottage with a chimney (smoke curl).
- A friendly bird on a fence post. A butterfly crosses once.
- A **bench with a book** near the path, a hint at "story". Bio card sits on the right.

### Stop 3 — Skills Garden (late morning)
- A low wicker fence with an open gate (the tortoise walks through).
- Plant beds in 5 patches (see 02 for types). Each patch has a small hand-lettered wooden sign.
- Plant height = skill level. Plants **sway** gently (±2°, 4–6 s loops, staggered).
- A **watering can** by the "Learning" sprouts.
- Hover/focus on a plant shows a tooltip card. Tortoise `peek`s toward the hovered plant.

### Stop 4 — Stepping Stones (noon)
- The path ends at the bank of a shallow stream (mist-deep water with animated, slow ripple lines).
- 3–5 flat **stones** arranged along a gentle arc across the water, then a small "More" stone leading to the far bank.
- Each stone has a soft tint (`stoneColor`) and a small engraved glyph (a number).
- The tortoise **hops** stone to stone (small arc jump, 0.5 s, squash/stretch of ±6%). Progress between 0.42 and 0.56 maps to the hop sequence (see `04`).
- A small fish jumps once. Lily pads and reeds in the foreground.
- A case-study card opens above/right of the active stone.

### Stop 5 — Experience Trail (golden hour)
- The path climbs a hill. **Wooden signposts** are planted along the climb, one per role (the oldest at the bottom).
- Warm light rays from the low sun, long soft shadows (ellipses stretched to the left).
- Pine/round trees with honey highlights. A bird flock crossing the sun.
- A hanging **card** attaches to the active signpost showing the role.

### Stop 6 — Fun Facts Campfire (dusk)
- Hilltop clearing. A **campfire** (coral/honey flames, animated flicker, rising sparks) with 3 logs around it.
- A little tent and a lantern hung from a branch. The sky is plum with the first stars.
- Fun facts appear as **floating paper notes** pinned to a string between two trees, or as speech from the fire's glow, one at a time (see P11).
- Moths flutter near the lantern.

### Stop 7 — Contact Pond (night)
- A calm pond reflecting the moon (mirrored, desaturated, slightly rippled copy of the moon and the nearest tree).
- Fireflies (20–30) drift; a few pulse brighter near the tortoise.
- The "deploy tower" (lighthouse silhouette) glows far on the hill, a subtle dev wink.
- A wooden dock with a mailbox. The tortoise sits at the pond's edge and waves.
- CTA card appears with a gentle glow. Honey button.

## 5. Responsive scene rules
| Breakpoint | Tortoise x | Card placement | Layers |
|---|---|---|---|
| ≥ 1024 px | 35% | right 55% of viewport | all layers |
| 640–1023 px | 40% | right/overlay card, 50% width | drop foreground layer density by 50% |
| < 640 px | 50% | **bottom sheet** (max 55% viewport height), scene shifts up | reduce fx particles, simplify foreground, a single cloud layer |
Scale rule: the scene scales to the viewport height (`scale = vh / 900`), world width follows. On very wide screens (> 1920), extend the sky/ground horizontally rather than scaling up beyond 1.25×.

## 6. Day → night keyframes (continuous interpolation)
Values interpolate linearly between the nearest two stop keyframes, using `progress`.

| progress | sky-top | sky-bottom | sun/moon | light tint overlay | star opacity | grain opacity |
|---|---|---|---|---|---|---|
| 0.00 | #F3D9C4 | #F8E7C8 | sun at horizon, y 78% | warm peach 6% | 0 | 0.08 |
| 0.14 | #DCEBE4 | #F6EEDC | sun y 62% | none | 0 | 0.07 |
| 0.30 | #CFE5E0 | #F6EEDC | sun y 48% | none | 0 | 0.06 |
| 0.48 | #BFDDE0 | #E4F0E8 | sun y 34% (zenith) | none | 0 | 0.06 |
| 0.66 | #F2B84B | #E8875B-soft | sun y 58%, large and warm | honey 10% | 0 | 0.08 |
| 0.83 | #E8875B | #5B4B6B | sun gone, glow at horizon | plum 12% | 0.4 | 0.09 |
| 1.00 | #2E3B5F | #1F2A44 | moon at y 30% | navy 14% | 1 | 0.10 |
Foliage, ground and hills also tint: apply a multiplicative overlay (`--tint`) rather than recoloring each shape.

## 7. Tortoise state machine (world-facing)
| State | Enter when | Exit when | Visual |
|---|---|---|---|
| `idle` | |Δprogress| < ε for 600 ms | input resumes | breathing + blink |
| `walk` | |Δprogress| ≥ ε | input stops | leg cycle speed ∝ velocity (0.6–1.8× base) |
| `peek` | settled within 0.01 of a stop | input resumes | head extends 12%, looks at the card |
| `hide` | velocity > threshold (fast flick) or click | 900 ms after | retract head and legs; shell wobble |
| `wave` | at `contact` & settled | input resumes | front leg waves, 1.2 s loop |
| `sleep` | at `contact` idle > 20 s | any input | eyes closed, "z z z" |
| `hop` (sub-state of walk) | during the projects stones segment | segment ends | arc jump between stones |

Walking direction: **right** when progress increases, and the tortoise **flips** (scaleX −1) when walking back, with a 250 ms turn (head swings first).

## 8. Backpack accumulation
Each stop adds an item on the tortoise's satchel, shown as a small icon sticking out (leaf, seed packet, folded map, lantern, marshmallow stick, letter). Items persist when walking back. The satchel is part of the tortoise SVG (a separate group per item with `opacity` and `scale` tweens).

## 9. Sound design (optional, off by default)
Opt-in only. Short loops ≤ 60 s, ≤ 150 KB each, lazy-loaded after the first user gesture:
- soft wind/meadow bed (stops 1–3), stream (stop 4), crickets (5–6), night crickets + pond (7), a gentle footstep tick while walking (quiet). Crossfade by progress. Mute on tab blur.

## 10. Scenery asset list
See `06-asset-brief.md` for the exact component/file list and naming.
