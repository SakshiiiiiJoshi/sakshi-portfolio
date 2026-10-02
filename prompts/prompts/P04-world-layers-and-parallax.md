# P04 — World Layers & Parallax

## Goal
Build the layered world (sky, far hills, mid hills, trees, path, foreground, fx, grain), a camera transform driven by a `progress` value, and the continuous day→night sky.

## Prerequisites
P01, P02, P03.

## Context to paste
- `03-world-and-path-spec.md` §1, §3, §5, §6
- `04-interaction-and-motion-spec.md` §12 (performance contract)
- `06-asset-brief.md` §2 (global rules), §4 (layers)
- `01-design-system.md` §2.3 (sky gradients), §5 (texture), §6 (illustration rules)

## The Prompt
```text
Build the world scene as stacked SVG layers that translate horizontally based on a numeric `progress` (0..1). For now, drive `progress` from a temporary range slider so we can test; the real input engine arrives in P05.

1. `src/components/world/World.tsx` (client): a fixed full-viewport container (100dvh, overflow hidden) holding the layers in z-order from 03 §3. It scales the scene by `vh/900` (clamped ≤ 1.25× on wide screens; extend sky/ground horizontally instead of upscaling more). It reads CSS variables `--p`, `--sky-top`, `--sky-bottom`, `--tint`, `--tint-opacity` from its own element.
2. Layers in `src/components/world/layers/` (inline SVG, CSS-variable fills, SVGO-friendly, ≤ 80 KB gz each; seamless horizontal tiles where specified):
   - `Sky.tsx`: gradient driven by `--sky-top/--sky-bottom`; a sun and a moon moving along arcs by progress (keyframes in 03 §6); 60 stars fading in 0.8→1.0; 6 cloud sprites drifting slowly (CSS animation, pausable).
   - `FarHills.tsx` (speed 0.15), `MidHills.tsx` (0.30, includes a small distant cottage near the About region and the "deploy tower" lighthouse silhouette near the end), `Trees.tsx` (0.55: 6 tree types, bushes, shrubs), `Foreground.tsx` (1.35: grass tufts, flowers, leaf silhouettes at 85% opacity edges, pointer-events none).
   - `PathLayer.tsx` (speed 1.0): draw the walkable ribbon as a single SVG `<path id="walk-path">` that undulates: flat start → rolling meadow → flat garden → a dip at the stream → a climb → a crest → a descent to a pond bank. The ribbon is cream with pebbles and a dashed center. Export a helper `getPathPoint(progress)` (in `src/lib/walk/path.ts`) using `MotionPathPlugin.getPositionOnPath` or manual sampling that returns {x, y, angle (clamped ±14°)}. Pre-sample 600 points for speed.
   - `Fx.tsx` (placeholder container for P13) and `Grain.tsx` (from P02).
3. Camera/parallax: a single function `applyProgress(p)` in `src/lib/walk/useWorldTransform.ts` (or similar) that sets each layer's `translateX = -p * WORLD_W * speed` via refs (no React state), writes the CSS variables for the sky by linearly interpolating the keyframe table in 03 §6, and moves the sun/moon. Registered on the GSAP ticker.
4. Tortoise placement: render `<Tortoise />` (state "walk" or "idle" based on whether the slider is moving) on the path layer at x = 35% (desktop) / 50% (mobile) of the viewport, y and rotation from `getPathPoint(p)`. Items=0 for now.
5. Paper-cut depth: add subtle drop-shadows to far/mid/tree layers (≤ 5 filtered layers in total). Add `will-change: transform` only while progress is changing.
6. A temporary dev page `src/app/world-lab/page.tsx` with a progress slider, a debug readout (p, x, y, angle, fps), and toggles for each layer.

CONSTRAINTS: per-frame values never go through React state; use refs + the ticker. Colors only via CSS variables. Layers must tile seamlessly with no visible seams at any progress. Don't build stop-specific set pieces yet (P06–P12), but leave `sets/` mount points in the World for them.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); report fps on the lab page when dragging the slider rapidly.
```

## Acceptance criteria
- [ ] Dragging the slider pans the layers at different speeds with convincing depth.
- [ ] The sky smoothly goes dawn → morning → noon → golden → dusk → night; stars/moon appear at the end.
- [ ] The tortoise follows the path's height and tilts gently (±14° max).
- [ ] No seams in the tiled layers; no horizontal page scroll.
- [ ] ≥ 55 fps average on a laptop while dragging the slider.
- [ ] The scene scales sensibly at 375×667, 768×1024, 1440×900 and 2560×1440.

## Common pitfalls
- Using React state for the slider value in the render loop (jank). Use refs.
- Gradients created per frame via string rebuilds → set two CSS vars and let the CSS gradient reference them.
- Too many filtered layers → dropped frames.
- Path tangent flipping near steep sections; clamp the angle and smooth it.

## Verification
`/world-lab`: scrub slowly and quickly; look for seams at every 10%; check the FPS readout; resize the window.
