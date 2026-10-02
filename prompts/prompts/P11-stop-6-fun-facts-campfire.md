# P11 — Stop 6: Fun Facts Campfire (dusk)

## Goal
A cozy hilltop campfire where personal facts appear one at a time, plus the easter eggs. The tone gets personal here.

## Prerequisites
P01–P10.

## Context to paste
- `02-content-bible.md` §7 (Fun facts), §11 (Easter eggs)
- `03-world-and-path-spec.md` §4 "Stop 6"
- `04-interaction-and-motion-spec.md` §5 table row "fun", §8
- `00-vision-and-story.md` §5 (tone)

## The Prompt
```text
Implement Stop 6 — Fun Facts Campfire (id `fun`, progress 0.83, dusk).

1. `src/components/world/sets/FunSet.tsx`: a hilltop clearing with a campfire (layered coral/honey flame shapes with an independent flicker per layer via scale/skew/opacity, sparks rising and fading, a warm radial glow behind it — one allowed radial-gradient exception, low cost), 3 logs, a small tent, a lantern hanging from a branch (gentle sway; moths orbiting it), and a string between two trees where paper notes are pinned. The tortoise sits beside the fire (the `idle` pose, but a slightly different resting position/offset at this stop).
2. `src/components/stops/StopFun.tsx`:
   - `Caption`, h2 "Off the clock", the intro line "Pull up a log…",
   - facts (4–6) appear as pinned paper notes (Caveat, slight random rotation ±3° seeded, a clothespin graphic) one at a time every 700 ms on enter, with the latest note brought to the front; clicking a note brings it forward; `ArrowLeft/ArrowRight` cycle notes while the stop is settled, and scrolling forward past the last note exits the stop (per 04 §8),
   - the optional marshmallow joke as a small Caveat line that appears last,
   - the tortoise gets the marshmallow stick on first arrival,
   - the fire "ignites" on enter (scale/opacity 0.6 s) and dims as you leave; the sky glow tints the card edges slightly (use `--tint`).
3. Easter eggs (per 02 §11), implemented in a single `src/lib/easter.ts` + hooks: click/tap the tortoise → `hide` then `peek`; key `T` → happy spin (rotate 360° over 0.8 s with a hop); Konami code → fireflies swarm (use the Fx particle system hook if present, else a simple SVG set) and briefly form the first letter of the name; a console message at load: "Hi, curious dev. Want to talk? {email}". Easter eggs never block content and never trigger while typing in an input.
4. Accessibility: facts exist as a visually hidden `<ul>`; the notes are focusable buttons only if interactive; fire/sparks are `aria-hidden`; reduced motion → a static fire (no flicker/sparks), all notes visible at once in a tidy row.
5. Mobile: the notes stack as a swipeable carousel in the bottom sheet (swipe inside the sheet horizontally changes the note, and does not move the walk), with dots for position.
6. Data only from `src/content/fun.ts`; handle 1–8 facts.

CONSTRAINTS: flame and sparks via transform/opacity; ≤ 20 spark elements (tiered down on weaker devices); the pause when hidden; no audio unless the sound toggle is on (and then only after P13).

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); list the easter eggs and how to trigger them.
```

## Acceptance criteria
- [ ] The fire looks alive without hurting performance (steady 55+ fps).
- [ ] Notes appear sequentially; keyboard and click cycling work; exiting is natural.
- [ ] All easter eggs work and are discoverable only by hint (the 6th fact).
- [ ] Reduced-motion version is complete and tidy.
- [ ] The mobile carousel doesn't conflict with the walk gestures.

## Common pitfalls
- Gesture conflict between the carousel and the walk (stop propagation only inside the sheet).
- Konami detection firing while typing.
- Overly bright glow reducing contrast of note text.

## Verification
Idle at the fire for 10 s; cycle notes with arrows; type the Konami code; try the T key and tortoise click; test reduced motion.
