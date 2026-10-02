# P14 — HUD & Dot Navigation

## Goal
Build the always-on interface: logo/name, skip button, sound toggle, the dot trail with the sliding tortoise-head marker, the hint, the keyboard help popover and the live region.

## Prerequisites
P01–P13.

## Context to paste
- `01-design-system.md` §7.5 (HUD), §10 (a11y)
- `04-interaction-and-motion-spec.md` §3 (keyboard map), §9 (HUD behavior)
- `05-tech-architecture.md` §6 (accessibility architecture)
- `02-content-bible.md` §1 (global strings)

## The Prompt
```text
Build the HUD.

1. `src/components/shell/Hud.tsx` (client) overlaying the stage (z above stops, pointer-events only on controls):
   - Top-left: a tiny tortoise-shell logo + the display name; clicking calls `goTo('hello')`.
   - Top-right: "Skip the walk" text button (toggles static mode, label flips to "Back to the walk"), the `SoundToggle` (icon button, aria-pressed, off by default, label "Sound on/off"), and a "?" help button opening a small popover listing the keyboard map from 04 §3 (focus trapped inside while open, `Esc` closes, returns focus to the trigger).
   - Bottom-center: `DotNav`.
   - Bottom-left (desktop only): the `Hint` ("Scroll, swipe, or use ← → to walk") which fades after the first interaction and returns after 8 s idle at Hello only.
2. `src/components/shell/DotNav.tsx`: `<nav aria-label="Story stops">` with an ordered list of 7 buttons connected by a dashed line (SVG). Active dot = coral with a ring; visited = moss; upcoming = outlined; `aria-current="step"` on the active; a hover/focus tooltip with the stop title; tap targets ≥ 44 px (use padding around small dots); a mini tortoise-head marker slides along the line proportional to `progress` (transform only; updated on the ticker via a ref, not state). Click/Enter/Space → `goTo(stop)`. The visited state includes a check tick on hover/focus (not color alone).
   - On mobile (< 640 px): a more compact variant (smaller gaps, labels hidden, current stop title shown above the dots).
3. `src/components/shell/LiveRegion.tsx`: a polite `aria-live` region announcing "Stop {n} of 7: {title}" when `settledStop` changes (throttled; no announcements while walking). When a stop is reached via keyboard or DotNav, move focus to that stop's heading (`tabIndex={-1}` target).
4. `SkipLink`: ensure that it's the first tabbable element on the page, visible on focus, and that it toggles the static mode. In static mode, the HUD shows only the logo + "Back to the walk".
5. Night variant: the HUD recolors with progress (paper text on dark after ~0.8) using CSS variables, with sufficient contrast at every progress (verify at 0, 0.5, 0.8, 1.0).
6. A shared `useHudVisibility` so cards in the bottom sheet (mobile) don't overlap the DotNav (the sheet sits above it; the dots remain visible).

CONSTRAINTS: honor reduced motion (marker jumps instead of sliding); the HUD never intercepts wheel/touch intended for the walk except on its controls; no new dependencies.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); describe the tab order from page load.
```

## Acceptance criteria
- [ ] The tab order: Skip → logo → sound → help → dots → page content, all with visible focus.
- [ ] The marker follows progress smoothly; dots reflect visited/active states accessibly.
- [ ] The live region announces stop changes once per settle; focus moves to the heading on keyboard navigation.
- [ ] The help popover traps focus and restores it on close.
- [ ] HUD contrast is OK across the whole day→night range.
- [ ] The mobile compact variant fits at 320 px.

## Common pitfalls
- Re-rendering the dots 60×/s (the marker must be ref-driven).
- Announcing on every stop pass (only on settle).
- Tooltips unreachable by keyboard.

## Verification
Tab through from a fresh load; use a screen reader to confirm the announcements; resize to 320 px; check contrast at four progress values.
