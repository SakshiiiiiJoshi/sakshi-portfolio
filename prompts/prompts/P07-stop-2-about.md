# P07 — Stop 2: About (morning)

## Goal
The meadow chapter: the bio, quick facts and three values, with a quiet, warm tone.

## Prerequisites
P01–P06.

## Context to paste
- `02-content-bible.md` §3 (About), §9, §10
- `03-world-and-path-spec.md` §4 "Stop 2"
- `04-interaction-and-motion-spec.md` §5
- `00-vision-and-story.md` §5 (tone)

## The Prompt
```text
Implement Stop 2 — About (id `about`, progress 0.14, morning).

1. `src/components/world/sets/AboutSet.tsx`: wildflowers (coral, honey, mist) along the path, a distant cottage with a chimney whose smoke curls (CSS/GSAP loop), a fence segment with a small bird that bobs its head occasionally, a bench with an open book beside the path, and one butterfly that crosses the screen along a looping bezier once every ~12 s (pause when hidden or under reduced motion). Hand-cut style, tokens only.
2. `src/components/stops/StopAbout.tsx` (HTML overlay):
   - `Caption` narrator line,
   - Title "A little about me" (h2, font-display),
   - the bio in a `Bubble` (variant paper, tail toward the tortoise), revealed word-by-word in Caveat or Nunito per the design spec (≈25 ms per word; on re-entry show instantly) while keeping the complete text in the DOM for accessibility,
   - quick-facts chips (mono): years of experience, location, languages, timezone,
   - the three "I care about" items, each with a small hand-drawn icon (inline SVG, 2px strokes) + a 1-line caption, staggered 80 ms.
3. Tortoise: `peek` toward the card on settle; add the first backpack item (leaf) with a tiny "+ curiosity" toast near the satchel (aria-hidden, decorative) when About is reached for the first time; the item persists afterward.
4. Layout: desktop card in the right 55%; mobile as a bottom sheet (max 55dvh, internal scroll allowed with `touch-action: pan-y` only inside the sheet; dragging the sheet must not change progress).
5. Enter/exit timelines are registered in the shared timeline registry (`src/lib/walk/timeline.ts`) so the engine can call `enter(stopId)` / `exit(stopId)`. If the registry doesn't exist yet from P05, create it now, with a minimal, typed API: `register(stopId, {enter, exit})`.
6. Content only from `src/content/site.ts` (bio/values/facts); add any missing fields to the type.

CONSTRAINTS: bio ≤ 90 words; headings in order (h2); focus moves to the h2 when arriving by keyboard; reduced motion shows everything immediately.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); describe the reveal order.
```

## Acceptance criteria
- [ ] Arriving at About shows caption → peek → bubble words → chips → values in order.
- [ ] Leaving and returning replays quickly; the leaf stays on the satchel.
- [ ] Mobile bottom sheet scrolls internally without moving the world.
- [ ] Butterfly/bird loops pause on tab hide and under reduced motion.
- [ ] Screen reader reads the full bio once, without the word-by-word duplication.

## Common pitfalls
- Word-by-word effect hiding text from assistive tech.
- The bottom sheet capturing the swipe that should advance the walk. Only capture inside the sheet's scrollable area when it overflows.
- Butterfly path causing layout/jank. Animate only transforms.

## Verification
Walk to About by wheel and by keyboard `2`; test on a 375 px viewport; run VoiceOver/NVDA quickly.
