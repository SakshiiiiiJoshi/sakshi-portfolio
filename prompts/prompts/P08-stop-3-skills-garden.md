# P08 — Stop 3: Skills Garden (late morning)

## Goal
A garden where each plant is a skill. Plant height equals proficiency; sprouts are skills being learned. Interactive tooltips, accessible equivalents.

## Prerequisites
P01–P07.

## Context to paste
- `02-content-bible.md` §4 (Skills incl. data model)
- `03-world-and-path-spec.md` §4 "Stop 3"
- `06-asset-brief.md` §5 (Plant sprite spec)
- `04-interaction-and-motion-spec.md` §5 table row "skills"

## The Prompt
```text
Implement Stop 3 — Skills Garden (id `skills`, progress 0.30, late morning).

1. `src/components/world/sets/SkillsSet.tsx`: a low wicker fence with an open gate that the tortoise walks through; 5 plant beds (frontend, backend, data, tools, practices) each with a small wooden hand-lettered sign (HTML text overlay positioned via the scene, or SVG text using font-hand); a "Learning" bed of sprouts with a watering can that drips occasionally; a bee on a slow looping path.
2. `src/components/world/sets/Plant.tsx`: parametric `<Plant kind level learning />` per 06 §5 — kinds: sunflower (frontend), mushroom (backend), tulip (data), fern (tools), daisy (practices). Height = level × 18 px base stem; head size constant per kind; sprout variant when `learning`. Two tonal steps, 2px outline, slight irregularity (use a seeded offset per plant so each looks hand-made but deterministic). Gentle sway (±2°, 4–6 s, sine, staggered by index).
3. `src/components/stops/StopSkills.tsx`:
   - `Caption`, h2 "What grows well", the intro line explaining height = daily use and sprouts = learning,
   - on enter: plants grow from 0 to their level (stagger 70 ms, `back.out(1.4)`) as the tortoise passes through the gate and `peek`s,
   - hover/focus on a plant → tooltip card "{skill} — {note}" (Card, small, with a pointer), and the tortoise `peek`s toward it (turn the head only, don't move),
   - plants are real buttons (or `role="button"` + `tabIndex=0`) so they're keyboard reachable; arrow keys move between plants within the stop only when focus is inside the garden; `Esc` returns focus to the heading,
   - a visually hidden `<ul>` lists all skills grouped with level words (e.g. "TypeScript — advanced"); the visual plants are `aria-hidden` duplicates, or properly labeled controls; choose one approach and avoid double announcements,
   - optional polish: the tortoise's shell hex cells tint to the group color when its plants are hovered (via a store value `hoverGroup`).
4. Backpack: add the seed packet on first arrival.
5. Mobile: reduce plants per bed to fit; tap a plant to show its tooltip as a small bottom bubble; tap elsewhere to dismiss.
6. Data from `src/content/skills.ts` only; allow ≤ 25 skills total; log a dev warning if exceeded.

CONSTRAINTS: no per-frame React state; sway uses CSS animation or a single GSAP timeline with `timeScale`; reduced motion → static plants fully grown.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); describe how plants grow and how tooltips behave.
```

## Acceptance criteria
- [ ] Five beds + a learning bed with correct plant kinds and heights from the data.
- [ ] Grow-in plays on arrival, sway is subtle, no jank with ~25 plants.
- [ ] Keyboard and touch can reach tooltips; screen readers get one clean list.
- [ ] Seed packet appears on the satchel.
- [ ] Changing `skills.ts` changes the garden (no hardcoded plants).

## Common pitfalls
- 25 animated SVG groups with filters → jank; avoid filters, use transform-only sway.
- Double announcements (visual + hidden list).
- Tooltip clipping at the viewport edges. Flip its position when near the edges.

## Verification
Edit a skill level in the data → confirm the plant height changes; tab through plants; test on touch emulation; run the Performance panel for 5 s.
