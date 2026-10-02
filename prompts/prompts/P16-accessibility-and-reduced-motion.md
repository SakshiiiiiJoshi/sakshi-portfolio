# P16 — Accessibility, Reduced Motion & the Static View

## Goal
Guarantee that everyone can use the site: a complete `StaticView` ("Skip the walk"), reduced-motion behavior, keyboard and screen-reader support, and an accessibility audit.

## Prerequisites
P01–P15.

## Context to paste
- `04-interaction-and-motion-spec.md` §9, §10
- `05-tech-architecture.md` §3 (rendering), §6 (a11y)
- `02-content-bible.md` §12–§13 (static mapping, alt text)
- `01-design-system.md` §10

## The Prompt
```text
Complete the accessibility layer and the static fallback.

1. `src/components/static/StaticView.tsx` plus section components: a normal scrolling page (`overflow: auto`) rendering the same data (`src/content/*`) as: header (small tortoise + name + role + availability + links, with a "Take the walk" button), About, Skills (grouped lists with level words), Projects (cards with Problem/What I did/Result, tags, links, optional screenshots), Experience (timeline list, newest first), Fun facts, Contact (CTAs identical to P12). Styled with the same design tokens (paper background, Fraunces headings), calm and well-spaced, with a small decorative path line in the margin. Uses the proper heading hierarchy (one h1).
2. Rendering strategy per 05 §3: `page.tsx` server-renders the semantic content ONCE (so crawlers and no-JS users see it); in walk mode it is visually hidden but remains in the DOM order (`.sr-only`-style clip, not `display:none`); in static mode it's the visible page. Make sure that the stop overlays don't duplicate announcements (the overlays are `aria-hidden` when the semantic copy is present, or vice versa; pick one and document it in `docs/a11y-strategy.md`).
3. Mode switching: the `S` key and the Skip/Back buttons toggle with a 400 ms crossfade (instant under reduced motion). Persist the choice in sessionStorage (try/catch). Honor the URL hash when switching (`#projects` scrolls to the Projects section in static mode). `prefers-reduced-motion: reduce` → start in the static mode with a visible "Take the walk anyway" button; if the user opts in, use discrete crossfades between stops (no parallax scrub, no leg animation, no hops, no ambient loops).
4. No-JS: a `<noscript>` fallback ensures the static content is visible (the semantic content must not be hidden when JS is off: scope the visually-hidden class to `html.js`).
5. Audit and fix: review against axe rules by reading the code (do not run automated axe/Playwright unless I ask), plus manual checks:
   - keyboard: full journey with Tab/arrows only; no traps; visible focus everywhere,
   - screen reader: VoiceOver or NVDA pass on both modes, the announcements per stop, the names and roles of all controls,
   - color contrast at all time-of-day extremes for every text surface,
   - zoom to 200% and 400% reflow (the walk mode should still be operable, and the static view must reflow without horizontal scroll),
   - `prefers-contrast: more` and forced-colors: ensure the focus rings and borders remain visible,
   - `lang` attribute, page title, landmark regions, link purposes, button names, and image alts per 02 §13.
6. Write `docs/a11y-strategy.md` (decisions, known limitations, test log with dates and tools) and fix everything that's High/Medium severity.

CONSTRAINTS: don't remove animations for everyone, only respect the preference; no content may be available only through hover/animation; don't use `role="application"`.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build) and report the audit results with before/after counts.
```

## Acceptance criteria
- [ ] The static view contains every piece of content from the walk, using the same data.
- [ ] No-JS shows the full static content.
- [ ] Reduced motion starts static; the opt-in walk uses crossfades only.
- [ ] axe reports 0 serious/critical issues in both modes.
- [ ] A full keyboard-only and screen-reader pass succeeds.
- [ ] 200% and 400% zoom are usable.

## Common pitfalls
- `display:none` on the semantic content (hides it from everyone).
- Double announcing the same content (overlay + semantic copy).
- Focus lost after toggling the mode (move focus to the main heading of the new mode).

## Verification
Toggle OS "reduce motion"; disable JS; unplug the mouse; run VoiceOver/NVDA; run axe in both modes.
