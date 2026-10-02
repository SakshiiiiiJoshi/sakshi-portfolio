# P05 — Path & Walk Engine (input, smoothing, snapping)

## Goal
Replace the dev slider with the real engine: wheel/touch/keyboard input → target → smoothed progress, snapping to stops, store updates, hash sync and the tortoise walking state.

## Prerequisites
P01–P04.

## Context to paste
- `04-interaction-and-motion-spec.md` §1–§4, §9 (focus/live region), §11 (mobile), §13 (deep links), §14 (cheat-sheet)
- `05-tech-architecture.md` §4 (engine contract)
- `README.md` stops table

## The Prompt
```text
Implement the walk engine exactly per 04-interaction-and-motion-spec.md.

1. `src/lib/walk/useWalk.ts` (client hook; call once in `Experience`/`Stage`):
   - Creates a GSAP `Observer` on the stage element (`type: "wheel,touch,pointer"`, `preventDefault: true`, `tolerance: 8`, `dragMinimum` sensible) that converts wheel `deltaY/deltaX` (normalize deltaMode) and touch drag deltas (dominant axis wins; either axis advances) to `target` changes using WHEEL_K / TOUCH_K, with resistance (×0.6) inside SNAP_WINDOW of a stop. Clamp 0..1. Touch momentum decays over ~600 ms.
   - Smooths `progress` toward `target` (critically damped feel, ≈ 0.9 s, power3.out, e.g. via `gsap.quickTo` on a proxy object) and derives a smoothed signed `velocity` (clamped to MAX_VELOCITY).
   - Snapping: after SNAP_DELAY ms without input, if within SNAP_WINDOW of a stop, glide to it (0.7 s, power2.out). No forced snapping between stops.
   - `activeStop` = nearest stop within SNAP_WINDOW else the last one passed; `settledStop` is set when velocity < 0.01 for 250 ms inside a window; clear it as soon as |progress − stop| > 0.012 after input resumes.
   - Keyboard: ArrowRight/Down/Space/PageDown = next stop; ArrowLeft/Up/PageUp = previous; Shift+Arrow = ±0.02; Home/End; keys 1–7; `S` toggles static mode; `Esc` dispatches a "close card" event. Ignore key handling when focus is in an input or when a modifier like Ctrl/Cmd is held.
   - Methods: `goTo(stopIdOrProgress, {duration?})` (duration ∝ distance: min 1.2 s, max 3.2 s, power3.inOut), `next()`, `prev()`, `nudge(delta)`.
   - Hash sync: on settle, `history.replaceState` to `#<stopId>` (hello = no hash); on load, read the hash and animate (or jump instantly if reduced-motion) to that stop.
   - A GSAP ticker callback writes `--p` on the stage and calls the world's `applyProgress(p)` (from P04), and updates the tortoise position (refs, not React state). Only discrete values (activeStop, settledStop, direction, mode) go into the zustand store and trigger React updates.
   - Cleanup everything on unmount (Observer.kill, listeners, ticker).
2. Tortoise wiring: map the store to tortoise state — `walk` while |velocity| > ε (speed multiplier from |velocity| mapped to 0.6–1.8), `idle` otherwise, `hide` on a very fast flick (|velocity| above a threshold) for 900 ms, flip `facing` by direction with the turn animation from P03. (`peek`/`wave`/`sleep` are wired in the stop prompts.)
3. `src/components/shell/Stage.tsx` + `Experience.tsx`: `Stage` is the fixed full-viewport event-capture element (`touch-action: none; overscroll-behavior: none`), mounts `<World />` and later the stops/HUD. `Experience` decides walk vs static from `prefers-reduced-motion` (static is a simple placeholder "Static view coming in P16" for now) and provides a `SkipLink` as the first focusable element which toggles the mode.
4. A temporary debug overlay (toggle with the backtick key) showing progress, target, velocity, activeStop, settledStop and fps.
5. Replace the world-lab slider with the real engine on `/` (home). Keep `/world-lab` for isolated testing.

CONSTRAINTS: no per-frame React state; single ticker; no extra deps. Prevent the page from ever scrolling or bouncing on iOS. Prevent double-handling (wheel + touch emulation). Cap input per frame so one huge wheel delta can't teleport (clamp the per-event Δtarget to ±0.05).

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build). Test on desktop wheel, trackpad, keyboard, and (via DevTools) touch emulation. Report the tuned constants.
```

## Acceptance criteria
- [ ] Wheel, trackpad, touch swipe (both axes) and keyboard all move the tortoise smoothly with inertia.
- [ ] Snapping works only near stops; between stops the visitor can stop anywhere.
- [ ] Keyboard next/prev, Home/End, 1–7 and `S` all work; `Esc` dispatches the close event.
- [ ] Hash updates on settle; opening `/#projects` animates there.
- [ ] Hello → Contact takes ~90–120 s with a casual wheel and ~25 s on keyboard "next".
- [ ] The debug overlay confirms: no React re-render per frame (check with React DevTools profiler).
- [ ] No page scroll or overscroll on desktop or iOS emulation.

## Common pitfalls
- Trackpad inertia producing huge deltas; clamp per event.
- Observer + native touch both firing; use `preventDefault` and `touch-action: none`.
- `settledStop` flicker at window edges → add hysteresis (enter 0.01, leave 0.012).
- Keyboard handler stealing keys from the focused buttons (Space/Enter). Only intercept Space when the focus is on `body` or the stage.

## Verification
Walk the full path with each input; leave it idle at a stop; hit `Home`, `End`, `3`; reload with a hash; watch the debug overlay.
