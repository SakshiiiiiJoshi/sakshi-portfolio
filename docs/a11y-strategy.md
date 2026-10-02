# Accessibility strategy (P16)

## Decision: one announced copy at a time
`page.tsx` server-renders the semantic page once (`StaticView`, from `src/content/*`) inside `<main>`.

| State | StaticView | Walk overlays |
|---|---|---|
| No JS | visible, announced | not mounted |
| Walk mode | clipped (`html.js[data-mode="walk"] .static-root`, **not** `display:none`), `aria-hidden` + `inert` | announced (own headings, live region, focus handling) |
| Static mode | visible, announced | unmounted |

- The clip is scoped to `html.js` (class added by the inline script in `layout.tsx`), so no-JS users see everything.
- StaticView heading ids are prefixed `s-` (`s-skills-title`) so they never collide with the walk's `skills-title`.
- The walk keeps its per-stop `.sr-only` lists; they were the reason to prefer the walk overlays as the announced copy in walk mode.

## Mode switching
- Start: `sessionStorage["walk-mode"]` → else `prefers-reduced-motion` ? static : walk. The inline head script and `resolveInitialMode()` (`lib/a11y/modeStorage.ts`) implement the same rule, so there is no flash.
- `toggleMode()` (`lib/walk/mode.ts`) is the single entry for the `S` key, Skip/Back button and in-page CTAs. It persists the choice (try/catch), fades the new view in over 400 ms (instant under reduced motion via the global clamp) and moves focus to the new mode's main heading (`#hello-title` / `#s-hello-title`, or the section heading named by the URL hash).
- Static mode honours the hash (`#projects` → `#s-projects`), on entry and `hashchange`.
- Reduced motion: starts static with a visible "Take the walk anyway" button. Opting in persists for the tab; the walk then runs with `reducedMotion` (no travel/parallax, legs, hops or ambient loops) and a 300 ms paper-veil crossfade on each stop change.

## Changes made
- Contrast: primary button `paper on moss` was 3.97:1 → now `paper on moss-dark` (5.64:1).
- Projects case-study tabs: added `aria-controls`/`aria-labelledby`, roving `tabindex`, Arrow/Home/End keys.
- Stage is a labelled region; skip control is the first focusable element (rendered before `<main>`).
- `prefers-contrast: more` and `forced-colors` rules for focus rings and borders.
- Static view reflows in a single column (`overflow-wrap:anywhere`), 44 px targets.

## Known limitations
- Walk mode at 400% zoom remains a fixed-viewport scene; cards may need internal scroll. Static view is the intended fallback there.
- Contrast was computed from tokens only; per-time-of-day tinted surfaces (dusk/night overlays) were not measured on rendered pixels.
- The tortoise SVG is not duplicated in StaticView (a header shell mark is used) to avoid duplicate ids.

## Test log
| Date | Tool | Scope | Result |
|---|---|---|---|
| 2026-10-02 | Code reading + token contrast script | both modes | findings above fixed |
| 2026-10-02 | `tsc --noEmit`, `eslint` | whole repo | clean |
| — | VoiceOver / NVDA, keyboard-only, axe, 200/400% zoom, OS reduce-motion, JS off | both modes | **not run — to do by owner** |

Audit counts (by reading): High 0 → 0, Medium 3 → 0 (contrast, tab semantics, missing semantic/no-JS content), Low: 2 open (zoom, tinted-surface contrast).
