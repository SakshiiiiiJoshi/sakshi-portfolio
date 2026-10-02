# P02 — Design Tokens & Global Styles

## Goal
Encode the Storybook Meadow design system as CSS variables, Tailwind theme extensions and shared UI primitives (Bubble, Card, Tag, Button, Caption).

## Prerequisites
P01.

## Context to paste
- `01-design-system.md` (all of it)
- `02-content-bible.md` §1 (global strings)

## The Prompt
```text
Implement the design system from the attached 01-design-system.md. Do not invent values; use the tokens exactly.

1. `src/app/globals.css`:
   - `:root` variables: all core color tokens (paper, moss, sage, forest, shell, honey, coral, mist, plum, night, ink) and the supporting tints (paper-dim, moss-dark, honey-soft, coral-soft, mist-deep, night-soft, ink-soft); radii (--r-sm/md/lg, --r-blob); shadows (--shadow-1, --shadow-2, night variants); the fluid type scale tokens; and the sky variables `--sky-top`, `--sky-bottom`, `--tint`, `--tint-opacity`, `--grain-opacity` with dawn defaults.
   - Base styles: body background `var(--paper)`, color `var(--ink)`, font-body; headings use font-display with the sizes from the type scale; `::selection` honey-soft; a visible focus ring (3px honey with a 2px forest offset) for `:focus-visible`.
   - `@media (prefers-reduced-motion: reduce)` baseline that removes transitions/animations by default (we opt in per component).
   - Utility classes: `.paper-card`, `.bubble`, `.chip`, `.hand` (Caveat), `.mono` (JetBrains Mono), `.sr-only`.
2. `tailwind` theme extension (v4 `@theme` or v3 config, whichever the project uses) mapping colors to `bg-paper`, `text-forest`, `border-sage`, etc., fonts to `font-display|body|hand|mono`, radii, shadows, and spacing scale from 01 §4.
3. Shared components in `src/components/stops/shared/`:
   - `Bubble.tsx` — props: `tail: 'left'|'right'|'down'`, `variant: 'paper'|'night'`, children. Blob radius, 2px forest stroke at 70% (use an inline SVG outline or CSS border + radius), tail, shadow-1. No animation yet except a CSS-only `data-visible` attribute hook for later GSAP use.
   - `Card.tsx` — the content card spec (01 §7.2): paper 0.94, r-lg, shadow-2, dashed sage inner border, `as` prop for the heading level, `variant: 'paper'|'night'`.
   - `Tag.tsx` — the chip spec.
   - `Button.tsx` — primary/secondary/night-primary variants, `href` or `onClick`, external link handling (`rel="noopener noreferrer"`), min 44×44 hit area.
   - `Caption.tsx` — narrator caption in Caveat with a squiggle underline SVG.
4. `src/components/world/layers/Grain.tsx`: a full-viewport, pointer-events-none paper grain overlay using an inline SVG `feTurbulence` filter rendered ONCE to a data-URI background tile (so it isn't re-filtered every frame). Opacity from `--grain-opacity`, mix-blend-mode multiply.
5. A temporary route `src/app/styleguide/page.tsx` (we will delete it in P19) showing: the color swatches with token names + hex, the type scale samples, all components in paper and night variants, and the sky gradient samples for all 7 times of day. Allow scrolling on this route only (override overflow).

CONSTRAINTS: Components must be accessible (semantic elements, focus visible, contrast). Colors only via tokens. No external UI libs.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: describe the styleguide page.
```

## Acceptance criteria
- [ ] `/styleguide` shows every token with the right hex.
- [ ] Headings, body, hand and mono fonts render correctly.
- [ ] Bubble, Card, Tag, Button and Caption look like the spec in both paper and night variants.
- [ ] Focus ring visible on all interactive elements via Tab.
- [ ] Grain is subtle (no banding, no performance hit).
- [ ] Tailwind classes like `bg-paper text-forest font-display` work.

## Common pitfalls
- Text contrast on night backgrounds. Use `--paper` text and check the ratio.
- Re-running `feTurbulence` on resize → build the tile once.
- Over-styling: keep the primitives minimal; stops will compose them.

## Verification
Open `/styleguide` at 375 px and 1440 px; tab through the buttons; toggle DevTools "prefers-reduced-motion".
