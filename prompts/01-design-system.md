# 01 — Design System ("Storybook Meadow")

## 1. Visual language in one paragraph
Hand-drawn **paper-cut illustration** on warm cream paper. Shapes are soft, slightly imperfect and layered, as if cut from colored paper with tiny drop shadows between layers. Light is warm and low-contrast. Texture is subtle grain. Nothing is glossy, neon or sharp-cornered. Typography is a friendly serif with handwritten accents.

## 2. Color palette

### 2.1 Core tokens
| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F6EEDC` | Page/card background, UI surfaces |
| `--moss` | `#5B7F4A` | Primary green: hills, buttons, links |
| `--sage` | `#A8BF8A` | Secondary green: far hills, tags, soft fills |
| `--forest` | `#2F4A3A` | Deep green: headings on paper, trees, outlines |
| `--shell` | `#7A8F3C` | Tortoise shell, olive accents |
| `--honey` | `#F2B84B` | Highlights, sun, hex pattern, CTA hover |
| `--coral` | `#E8875B` | Warm accent: flowers, fire, active dot |
| `--mist` | `#CFE5E0` | Morning sky, water, cool surfaces |
| `--plum` | `#5B4B6B` | Dusk sky, shadows in the evening |
| `--night` | `#1F2A44` | Night sky, contact stop background |
| `--ink` | `#2B2A26` | Body text on paper |

### 2.2 Supporting tints (derived, define as tokens)
`--paper-dim #EADFC6` (card edge/shadow tint), `--moss-dark #46663A` (hover), `--honey-soft #F8D98E` (glow), `--coral-soft #F2B297`, `--mist-deep #A9CFC8`, `--night-soft #2E3B5F`, `--ink-soft #5A574D` (secondary text).

### 2.3 Sky gradients by time of day (top → bottom)
| Stop | Time | Gradient |
|---|---|---|
| hello | dawn | `#F3D9C4` → `#F8E7C8` → `#CFE5E0` |
| about | morning | `#DCEBE4` → `#F6EEDC` |
| skills | late morning | `#CFE5E0` → `#F6EEDC` |
| projects | noon | `#BFDDE0` → `#E4F0E8` |
| experience | golden hour | `#F2B84B` → `#F6D9A8` → `#E8875B` (soft) |
| fun | dusk | `#E8875B` → `#B8657A` → `#5B4B6B` |
| contact | night | `#2E3B5F` → `#1F2A44` |
Gradients interpolate continuously with `progress`; see `03` and P13.

### 2.4 Contrast rules
- Body text `--ink` on `--paper`: ≥ 12:1. OK.
- Text on dusk/night backgrounds uses `--paper`; ensure ≥ 7:1.
- Never put text directly on illustration. Use a **paper card** (opacity 0.94 and a faint border) or a speech bubble.
- Interactive elements need a 3:1 outline contrast (`--forest` on paper, `--paper` on night).

## 3. Typography

| Role | Font | Weights | Use |
|---|---|---|---|
| Display | **Fraunces** (variable; opsz, SOFT axis ≈ 100) | 600, 700 | Stop titles, big headlines, project names |
| Body | **Nunito** | 400, 600, 700 | Paragraphs, UI labels, bubbles |
| Handwritten | **Caveat** | 500, 700 | Narrator captions, notes, "scribbles", signature |
| Mono | **JetBrains Mono** | 400, 500 | Tech tags, code snippets, dates, stats |

Load via `next/font/google` with `display: swap` and only the used weights and subsets (latin). Expose as CSS variables `--font-display`, `--font-body`, `--font-hand`, `--font-mono`.

### 3.1 Type scale (fluid, `clamp()`)
| Token | Size | Line height | Notes |
|---|---|---|---|
| `--text-hero` | clamp(2.75rem, 7vw, 5.5rem) | 1.02 | Fraunces 700, tight tracking −0.02em |
| `--text-h1` | clamp(2rem, 4.5vw, 3.5rem) | 1.1 | Fraunces 700 |
| `--text-h2` | clamp(1.5rem, 3vw, 2.25rem) | 1.15 | Fraunces 600 |
| `--text-h3` | clamp(1.15rem, 2vw, 1.5rem) | 1.25 | Fraunces 600 |
| `--text-body` | clamp(1rem, 1.2vw, 1.125rem) | 1.6 | Nunito 400 |
| `--text-small` | 0.875rem | 1.5 | Nunito 600 |
| `--text-hand` | clamp(1.25rem, 2vw, 1.75rem) | 1.2 | Caveat 500 |
| `--text-mono` | 0.8125rem | 1.5 | JetBrains Mono 500 |

Rules: max line length ~60 characters inside cards; paragraphs inside bubbles ≤ 3 lines on mobile; no more than 2 type families in a single card.

## 4. Spacing, radius, shadow
- **Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 72, 112 (Tailwind spacing extended to match).
- **Radius:** `--r-sm 10px`, `--r-md 18px`, `--r-lg 28px`, `--r-blob` irregular border-radius (e.g. `62% 38% 55% 45% / 48% 58% 42% 52%`) for speech bubbles and stones.
- **Paper shadows (layered, soft):**
  - `--shadow-1: 0 1px 0 rgba(47,74,58,.10), 0 3px 8px rgba(47,74,58,.10)`
  - `--shadow-2: 0 2px 0 rgba(47,74,58,.12), 0 10px 24px rgba(47,74,58,.16)`
  - Night variant uses `rgba(0,0,0,.35)`.
- **Outline:** illustrated shapes get a 2px `--forest` hand-drawn stroke at 70% opacity, with `stroke-linecap: round` and `stroke-linejoin: round`. Far layers have no outline (atmospheric).

## 5. Texture and finish
- **Paper grain:** a full-viewport SVG `feTurbulence` noise overlay (baseFrequency ≈ 0.8, 2 octaves), `mix-blend-mode: multiply`, opacity 0.06–0.10. It must be pointer-events none and cheap (a pre-rendered tiled PNG/SVG if `feTurbulence` hurts performance, see P17).
- **Paper-cut depth:** each parallax layer gets a subtle drop-shadow (`filter: drop-shadow(0 4px 6px rgba(47,74,58,.15))`) to look cut from separate sheets. Use sparingly on layers (≤ 5) for performance.
- **Wobble:** hand-drawn feel via slightly irregular paths in the SVG art itself, not via runtime filters.

## 6. Illustration style rules
1. Flat fills with at most 2 tonal steps (base + shade). No gradients inside objects (gradients only in the sky).
2. Slightly irregular, rounded geometry; avoid perfect circles and straight lines.
3. Consistent outline weight (2px at 1440×900 design size) for foreground and mid objects.
4. Small "hand-made" details: tiny dots on mushrooms, stitches on the backpack, specks of grain on stones.
5. Silhouette first: every object reads clearly in one color.
6. Plants lean subtly in the same wind direction (right).
7. Ground-contact shadows are soft ellipses at 12% forest opacity.

## 7. UI components (visual spec)

### 7.1 Speech bubble
Paper fill, 2px forest stroke at 70%, blob radius, a small tail pointing at the tortoise, Caveat or Nunito text, `--shadow-1`. Appears with a "pop" (scale 0.9 → 1, 300 ms, `back.out(1.6)`).

### 7.2 Content card (case study, role)
Paper fill (0.94), `--r-lg`, `--shadow-2`, 2px dashed `--sage` inner border (like a stitched label), a tag row in mono, and a title in Fraunces h2. Max width 560px desktop, and the full width minus 32px on mobile.

### 7.3 Tag / chip
Mono 12–13px, `--sage` 35% fill, `--forest` text, `--r-sm`, and 6×10 padding. Hover raises it 1px.

### 7.4 Buttons
- **Primary:** `--moss` fill, `--paper` text, `--r-md`, 12×22 padding, hover `--moss-dark` and a 1px lift; focus ring 3px `--honey` with a 2px `--forest` offset.
- **Secondary:** transparent, 2px `--forest` outline, hover `--sage` 30% fill.
- **On night:** primary is `--honey` with `--night` text.

### 7.5 HUD
- Top-left: a tiny tortoise-shell logo and the name (links to the Hello stop).
- Top-right: "Skip the walk" text button and a sound toggle (off by default).
- Bottom-center: **dot trail** of 7 dots connected by a dashed line; the active dot is `--coral`, visited dots are `--moss`, and upcoming dots are outlined. Hover shows the stop label.
- Bottom-left (desktop): a hint "Scroll, swipe or use ← →" that fades after first interaction.

## 8. Motion principles
1. **Slow is smooth.** Default duration 0.6–1.2 s; the walk itself is inertial (see `04`).
2. **Ease:** `power2.out` for reveals, `power3.inOut` for camera moves, `back.out(1.6)` for pops, `sine.inOut` for ambient loops.
3. **Stagger** items 60–90 ms; never reveal more than 6 things at once.
4. **One star per moment.** While the tortoise walks, ambient motion is quiet; on arrival, the content takes the stage.
5. **Parallax depth ratios** (fraction of foreground speed): sky 0.05 · far hills 0.15 · mid hills 0.3 · trees 0.55 · path/tortoise 1.0 · foreground grass 1.35.
6. **Reduced motion:** disable the walk animation and ambient loops, and switch to the `StaticView` or a simple crossfade between stops (see P16).
7. Animate only `transform` and `opacity` where possible; avoid layout-triggering properties.

## 9. Iconography
Hand-drawn style line icons (2px, round caps) for GitHub, LinkedIn, Email, Resume (document), Location pin, External link, Sound on/off, Arrow left/right. Provide as inline SVG components, `currentColor`.

## 10. Accessibility in design
- Minimum tap target 44×44px.
- Focus states always visible (honey ring).
- Don't rely on color alone: the active dot also gets a ring, and visited dots get a check tick on hover/focus.
- Text sizes never below 14px on mobile (mono tags 12px minimum, only for non-critical info).

## 11. Design tokens file shape (for P02)
CSS variables on `:root` for colors/fonts/radius/shadows; Tailwind theme extended to reference them (`bg-paper`, `text-forest`, `font-display`, etc.). Sky gradient colors are driven by a `--sky-top` / `--sky-bottom` pair updated per frame from `progress`.
