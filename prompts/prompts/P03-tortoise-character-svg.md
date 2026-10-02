# P03 — The Tortoise Character (layered SVG + poses)

## Goal
Build the `Tortoise` component as a layered inline SVG with named groups and GSAP-driven poses: idle, walk, peek, hide, wave, sleep, hop, plus the backpack items.

## Prerequisites
P01, P02.

## Context to paste
- `00-vision-and-story.md` §6 (character bible)
- `03-world-and-path-spec.md` §7 (state machine), §8 (backpack)
- `06-asset-brief.md` §3 (structure, poses, concept prompt)
- `01-design-system.md` §6 (illustration rules)

## The Prompt
```text
Create the tortoise mascot per the attached docs. This is the star of the site: it must be charming, readable at small sizes, and match the paper-cut Storybook Meadow style.

1. `src/components/tortoise/TortoiseSvg.tsx`: an inline SVG, viewBox `0 0 400 300`, facing RIGHT, authored by hand (paths, no raster). Use CSS variables for fills (shell body `--shell`, hex cells `--honey` with a darker shade, skin `--sage`, belly `--paper`, outline `--forest` at 70% opacity, 2px, round caps/joins). Two tonal steps per object, no gradients inside objects. Slightly irregular, rounded shapes, so it looks hand-cut.
   Required group ids, in this z-order: `shadow`, `leg-br`, `leg-bl`, `tail`, `shell-base`, `shell-pattern` (with `hex-1`…`hex-9`), `backpack` (satchel, strap, and item groups `item-leaf`, `item-seeds`, `item-map`, `item-lantern`, `item-stick`, `item-letter`), `leg-fr`, `leg-fl`, `neck`, `head` (with `eye`, `eyelid`, `mouth`, `cheek`).
   Add a header comment documenting every group id and each pivot point (transform-origin in SVG units) for legs, neck, head and shell.
2. `src/components/tortoise/poses.ts`: pure functions that take a root `SVGSVGElement` ref (or an object of group refs) and return GSAP timelines or tweens for each pose: `idle` (shell scale 1→1.015 over 3.5 s yoyo + blink every ~4 s with randomness), `walk` (diagonal leg pairs rotating ±18° around hip pivots, cycle 0.9 s, shell bob ±2 px, head nod ±1°; expose `setSpeed(multiplier 0.6–1.8)` via `timeScale`), `peek` (neck scaleX 1→1.12 and a head tilt), `hide` (retract head/legs/tail into the shell, scale 0.2, eyelids closed, plus a shell wobble; and `unhide`), `wave` (leg-fr rotates −65° ↔ −40° looping), `sleep` (eyes closed, head lowered 8 px), `hop` (squash 0.92 → stretch 1.06 → land, 0.5 s).
3. `src/components/tortoise/Backpack.tsx` logic (or helpers in poses.ts): `setBackpackItems(count)` shows items 0..count with pop-in tweens (scale 0→1, `back.out(1.6)`), and hides the rest. Items in order: leaf, seeds, map, lantern, stick, letter.
4. `src/components/tortoise/Tortoise.tsx` (client component): props `state: 'idle'|'walk'|'peek'|'hide'|'wave'|'sleep'`, `speed?: number`, `facing: 1|-1`, `items: number`, `onClick?`. Uses `useGSAP` to switch states by killing/reverting the previous pose timeline cleanly (no leaked tweens), cross-fading between poses over ~200 ms, and flipping facing with a 250 ms turn (head swings first, then scaleX −1). `role="img"` with an `aria-label` reflecting the state ("{name} the tortoise walking"). Respect `prefers-reduced-motion`: render the static idle pose with no loops.
5. A dev-only route `src/app/tortoise-lab/page.tsx` with buttons to trigger each state, a speed slider, a facing toggle, a backpack-items stepper, and a "night" toggle that swaps surrounding background colors to check contrast. Allow scrolling there.

CONSTRAINTS: no libraries beyond GSAP. Don't animate with React state per frame. Keep the SVG under 40 KB. The tortoise must look good at 120 px wide and 400 px wide.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build), then describe the look and list any pivot values you had to tune.
```

## Acceptance criteria
- [ ] The tortoise is recognizable, cute and on-palette at 120 px and 400 px.
- [ ] All 6 states + hop work in `/tortoise-lab` and switch without visual glitches or leaks.
- [ ] Legs rotate around hips (no detached limbs); the head retracts convincingly in `hide`.
- [ ] Backpack items pop in order and persist.
- [ ] `prefers-reduced-motion` shows a static pose.
- [ ] Every group id from the asset brief exists.

## Common pitfalls
- Wrong `transform-origin` units (use `transform-box: fill-box` or explicit px in the viewBox space).
- Overlapping timelines left running after a state change; always kill and clear props.
- Over-detailing → looks busy; simplify shapes.
- Flip via `scaleX(-1)` shifts the pivot; use the center `transform-origin`.

## Verification
Open `/tortoise-lab`; cycle all states; throttle the CPU 4× in DevTools and ensure it still looks fine.
