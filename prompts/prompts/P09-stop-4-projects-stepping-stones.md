# P09 — Stop 4: Stepping Stones (Projects, noon)

## Goal
The centerpiece. A stream crosses the path; each stone is a project; the tortoise hops from stone to stone while a case-study card follows.

## Prerequisites
P01–P08.

## Context to paste
- `02-content-bible.md` §5 (Projects, data model, card layout, writing tips)
- `03-world-and-path-spec.md` §4 "Stop 4"
- `04-interaction-and-motion-spec.md` §6 (stones mapping), §5 table row "projects"
- `01-design-system.md` §7.2 (Card)

## The Prompt
```text
Implement Stop 4 — Stepping Stones (id `projects`, progress 0.48, noon). This is the most important section; make it feel special.

1. `src/components/world/sets/ProjectsSet.tsx`: a shallow stream (3 layered ripple bands, mist-deep, slow ripple lines via transform animation), N flat stones (N from `projects.ts`, 3–5) arranged along a gentle arc across the water, each tinted by `stoneColor` with a small engraved number, plus a final small mossy "More on GitHub" stone leading to the far bank, lily pads, foreground reeds, and a fish that jumps once every ~15 s (pause under reduced motion/hidden). Stones "drop in" with a ripple ring when the stop is entered (0.5 s, stagger 120 ms).
2. Progress mapping in the engine (extend `useWalk`/a new `useStones` hook): between progress 0.43 and 0.55 the world pan is locked at the stream and `stoneIndex = floor(remap(progress, 0.43, 0.55, 0, N+1))` where the last index is the "More" stone. When `stoneIndex` changes, the tortoise performs a `hop` (0.5 s arc: y by sine, x linear, squash 0.92 → stretch 1.06 → land) to that stone and the card crossfades (200 ms). Leaving forward continues across the far bank toward Experience; leaving backward returns to the near bank. Provide a `goToStone(i)` method for clicks and keyboard (`ArrowRight/Left` inside the stop steps stones before leaving the stop: the engine must treat the segment as N+1 sub-stops).
3. `src/components/stops/StopProjects.tsx`:
   - `Caption`, h2 "Things I've built", the intro line,
   - the active project's case-study `Card`: title (h3) → role · year (mono) → one-liner → three labeled blocks (Problem / What I did / Result, ≤ 35 words each as written in the data) → stack `Tag`s → links (Live, Code, Write-up) as buttons that open in a new tab → optional screenshot in a polaroid frame (next/image, explicit width/height, alt text from the data),
   - a small stone-progress indicator ("2 / 4"),
   - clicking a stone (or its HTML hit-target) jumps to it; `Esc` closes the card and returns to the walk (target moves just past the segment end only if the user presses forward again; closing just hides the card and keeps the tortoise on the stone).
   - for the "More" stone: a card with the GitHub profile CTA.
4. Accessibility: a visually hidden ordered list of all projects with their full text (so screen readers/crawlers get everything without needing to hop); stones are focusable buttons labeled "Project 2 of 4: {title}"; announce the active project in the live region.
5. Mobile: the card is the bottom sheet (max 55dvh, internal scroll), a compact version (title, one-liner, Problem/Did/Result collapsed into accordions or tabs) with Live/Code buttons pinned at the bottom.
6. Backpack: add the folded map on first arrival at the stream.
7. Data: only from `src/content/projects.ts`. Handle N=1…5 gracefully (spacing recalculates). Handle missing optional fields (no image, no write-up link).

CONSTRAINTS: no layout shift when cards swap (fixed card height or animate height); screenshots lazy-loaded; link targets `rel="noopener noreferrer"`; no heavy libs.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); describe the hop feel and how the segment maps to progress. Include a short note on how to add a 6th project.
```

## Acceptance criteria
- [ ] Hopping feels satisfying (squash/stretch, no teleporting) in both directions.
- [ ] The card matches the active stone at all times; no flicker at the boundaries.
- [ ] Clicking stones, keyboard arrows, and wheel all work and stay in sync.
- [ ] N = 1, 3, 5 all look right; missing fields don't break the card.
- [ ] Mobile bottom sheet is usable and doesn't hijack the walk.
- [ ] Screen reader/crawler can read all project content.

## Common pitfalls
- Index jitter near a boundary (add hysteresis).
- The card height jumping when swapping projects with different text lengths.
- Hop animation fighting the continuous path-following. Pause path-follow during a hop and resume after.
- Large screenshots hurting LCP; keep them lazy and sized.

## Verification
Scroll slowly through the segment; flick fast; click stone 3 then scroll back; test keyboard only; try `projects.ts` with 1 and 5 entries.
