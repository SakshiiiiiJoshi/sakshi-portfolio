# P06 — Stop 1: Hello (dawn)

## Goal
Build the first impression: the dawn scene, the tortoise's burrow, the hero text, the intro bubble and the "scroll to begin" hint. It must be fully readable before any interaction.

## Prerequisites
P01–P05.

## Context to paste
- `02-content-bible.md` §2 (Hello copy), §9 (captions)
- `03-world-and-path-spec.md` §4 "Stop 1"
- `04-interaction-and-motion-spec.md` §5 (reveal timeline), §9 (hint)
- `01-design-system.md` §7 (Bubble, Card, Button)

## The Prompt
```text
Implement Stop 1 — Hello (id `hello`, progress 0.00, dawn).

1. `src/components/world/sets/HelloSet.tsx`: SVG set piece positioned at the start of the path: a mossy mound "home" with a round door and a tiny wooden name signpost (name text rendered as HTML overlay or SVG <text> using font-display, not baked in), a half-risen honey sun glow behind the far hills (coordinate with Sky), dew sparkle twinkles (6–10 tiny stars, CSS keyframes, staggered, paused when the tab is hidden), and 2 drifting clouds. Fills use tokens.
2. `src/components/stops/StopHello.tsx`: HTML overlay (not inside the SVG) positioned on the right on desktop and as a top-weighted block on mobile:
   - the narrator `Caption` ("Dawn. {tortoise} wakes and sees you."),
   - `<h1>` "Hi, I'm {firstName}." (Fraunces, text-hero) with the letters rising in (stagger 30 ms, `power2.out`),
   - sub-headline (role + what you build), the Caveat tagline "Slow is smooth, smooth is fast.",
   - the availability chip with a pulsing honey dot (CSS, stops under reduced-motion),
   - a `Bubble` (tail toward the tortoise) saying "Walk with me? I'll show you around.",
   - a hint ("Scroll, swipe, or use ← → to begin") with an animated chevron, shown after 4 s of no interaction and hidden after the first real input (`hasInteracted` in the store); on mobile use the swipe wording.
3. Content must come from `src/content/site.ts` and `captions.ts` only.
4. Intro choreography on first load (once): tortoise starts hidden in the door → emerges walking out (1.4 s) → stops → `peek` → bubble pops → headline letters rise → hint timer starts. If the visitor provides input mid-intro, skip ahead gracefully (finish the timeline instantly, no stuck states). Under `prefers-reduced-motion` skip the choreography entirely.
5. Tortoise states: `idle` on settle, `peek` while the hero is visible, and backpack items = 0.
6. Wire into the Stage via the store's `settledStop`/`activeStop`: the Hello overlay is visible when progress < 0.07 (fade out 0.35 s as the tortoise leaves; fade in as it returns) and exposes a focus target on the `<h1>` (`tabIndex={-1}`).
7. Make sure the `<h1>` and all text have sufficient contrast over the dawn sky (put the text on a paper `Card` or use the dark `forest` text with a soft paper backing; no text directly on illustration).

CONSTRAINTS: use shared components from P02; animations through GSAP timelines created in `useGSAP`; reduced-motion respected; no layout shift when fonts load (reserve space).

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build) and describe how the first 6 seconds play out.
```

## Acceptance criteria
- [ ] First paint shows the dawn scene and readable headline; the intro plays once and is skippable.
- [ ] The `<h1>` is the only h1 on the page; focus target works.
- [ ] The hint appears after 4 s idle and disappears on interaction; the mobile wording differs.
- [ ] Walking away fades the content; returning replays a faster enter.
- [ ] Reduced-motion: no choreography, content visible immediately.
- [ ] CLS ≈ 0.

## Common pitfalls
- Letters splitting that breaks screen-reader reading → keep the full text in an `aria-label` and the split spans `aria-hidden`.
- Intro timeline fighting with the walk engine on early input.
- Hero text unreadable on bright dawn colors.

## Verification
Hard-reload; do nothing for 6 s; reload and scroll instantly during the intro; test with reduced motion and with a screen reader.
