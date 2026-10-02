# P10 — Stop 5: Experience Trail (golden hour)

## Goal
A climbing path with wooden signposts, one per role, telling the career story from the oldest at the bottom to the newest at the top.

## Prerequisites
P01–P09.

## Context to paste
- `02-content-bible.md` §6 (Experience, data model)
- `03-world-and-path-spec.md` §4 "Stop 5"
- `04-interaction-and-motion-spec.md` §7 (mapping)
- `01-design-system.md` §2.3 (golden hour sky)

## The Prompt
```text
Implement Stop 5 — Experience Trail (id `experience`, progress 0.66, golden hour).

1. `src/components/world/sets/ExperienceSet.tsx`: the path climbs a hill (coordinate with PathLayer's geometry from P04: make sure the climb is between progress 0.58 and 0.74). M wooden signposts (M from `experience.ts`, plus an optional education sign) planted along the climb, evenly spaced, oldest at the bottom, newest at the top. Each signpost: a plank with company + dates in mono (HTML overlay or SVG text with font-mono), a post, a small grass patch, and a slightly different angle/lean so it feels hand-set. Add warm light rays (soft, low-opacity, slow shimmer via opacity/transform), long soft shadows, honey-highlighted pines, and a bird flock gliding across the sun every ~20 s (pause under reduced motion).
2. Engine: map progress 0.58–0.74 to the active role: the active signpost is the one nearest the tortoise within ±1/(2·M) of the span. Signposts rise from the ground in sequence as the tortoise approaches (translateY 30 → 0 + opacity, `power2.out`, 0.5 s).
3. `src/components/stops/StopExperience.tsx`:
   - `Caption`, h2 "The road so far",
   - the active role's `Card` hanging from the active signpost (a little rope/hook illustration): company (h3), role, dates + duration (mono, computed: "2 yrs 4 mos"), summary, 2–3 `wins` bullets, stack tags, with a 200 ms crossfade when the active role changes,
   - a compact vertical "mini-timeline" on the side showing all roles as dots (click to jump to that signpost),
   - the final (top) sign for "Now" has a subtle honey glow.
4. Tortoise: walks uphill with a slightly leaning posture (rotation from the path tangent, clamped), gets a slightly slower walk-cycle on steep sections (speed × 0.85), and obtains the lantern on first arrival.
5. Accessibility: a visually hidden ordered list of all roles (newest first, as a résumé would read), signposts focusable with labels ("Role 2 of 3: {role} at {company}"), and the live-region announcement on active-role change (throttled to settle events).
6. Mobile: the card becomes the bottom sheet; the mini-timeline moves into the sheet header as horizontal dots.
7. Data: only from `src/content/experience.ts`. Handle M = 1…6. Durations computed from the start/end dates (end "Present" → today).

CONSTRAINTS: transform/opacity only; no layout shift; dates parse safely; respect reduced motion.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); describe the active-role logic.
```

## Acceptance criteria
- [ ] The climb looks natural; the tortoise leans and slows slightly.
- [ ] Signposts rise in order; the active role's card follows without flicker.
- [ ] Mini-timeline click jumps to the correct signpost.
- [ ] The durations are right (verify with 2 sample roles).
- [ ] M = 1 and M = 6 both lay out cleanly.

## Common pitfalls
- Path geometry mismatch with signpost positions. Compute the signpost anchor points from `getPathPoint()` instead of hand-placing.
- "Present" end date breaking the duration math.
- Cards covering the tortoise on short viewports; clamp the placement.

## Verification
Walk the climb slowly in both directions; edit the data to 1 and 6 roles; check mobile sheet header dots.
