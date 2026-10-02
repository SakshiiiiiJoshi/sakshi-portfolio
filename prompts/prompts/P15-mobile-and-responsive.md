# P15 — Mobile & Responsive

## Goal
Make the walk feel native on phones and tablets: gestures, bottom sheets, safe areas, orientation changes and the scaled scene.

## Prerequisites
P01–P14.

## Context to paste
- `03-world-and-path-spec.md` §5 (responsive scene rules)
- `04-interaction-and-motion-spec.md` §11 (mobile specifics)
- `01-design-system.md` §3, §10

## The Prompt
```text
Make the experience excellent on touch devices and all viewport sizes.

1. Breakpoints and scene scaling per 03 §5: ≥1024, 640–1023, <640. Tortoise x = 35% / 40% / 50%. Cards: right panel / right overlay (50% width) / bottom sheet. Reduce foreground density and particle counts per breakpoint in addition to the performance tiers.
2. `src/components/stops/shared/Sheet.tsx`: the bottom sheet used by all stop cards on mobile: max 55dvh, rounded top corners, a drag handle (visual only, optional collapse/expand toggle button rather than drag-to-resize to avoid gesture conflicts), internal scroll with `overscroll-behavior: contain`, `touch-action: pan-y` only on its scrollable body, and the sheet area never changes `progress`. Safe-area insets (`env(safe-area-inset-*)`) respected. A collapse button lets the user shrink it to a one-line peek (title only) to see the scene.
3. Gestures: confirm the dominant-axis rule; swipe up/left advances; swipe down/right goes back; swipe velocity → momentum; make sure the iOS Safari URL bar collapse doesn't resize the stage jumpily (use `100dvh` + `visualViewport` listeners, debounced, and avoid layout thrash). Prevent pull-to-refresh and overscroll glow on Android Chrome.
4. Orientation: handle landscape phones (short height ≤ 450px): scale the scene by height, use a compact card (side panel at 50% width), shrink HUD elements, and hide non-essential decor.
5. Tablet: ensure that the right card doesn't cover the tortoise; at 768×1024 portrait use the bottom sheet if the card would overlap the tortoise.
6. Typography and targets: min 16px body on mobile, 44×44 targets, no hover-only interactions (all tooltips have tap equivalents).
7. Test matrix: iPhone SE (375×667), iPhone 14 (390×844), Pixel 7 (412×915), iPad (768×1024 and 1024×768), landscape phone (844×390), desktop 1440×900 and 2560×1440. Produce `docs/responsive-qa.md` with a checklist of what was verified for each (use DevTools emulation if no devices).

CONSTRAINTS: no horizontal overflow at any width ≥ 320px; no content cut off by notches; never rely on the hover; no new dependencies.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); report issues found and fixed per device profile.
```

## Acceptance criteria
- [ ] No horizontal/vertical page scroll or elastic bounce on iOS/Android emulation.
- [ ] Sheets are usable, scroll internally, collapse and never move the walk.
- [ ] The landscape phone layout is usable.
- [ ] The URL-bar collapse doesn't jolt the scene.
- [ ] The checklist file lists results for all profiles.

## Common pitfalls
- `100vh` instead of `100dvh`.
- A sheet's inertia scroll bubbling into the world swipe.
- Hover tooltips with no tap alternative.

## Verification
DevTools device toolbar through the matrix; a real phone if available; rotate during a stop and during a hop.
