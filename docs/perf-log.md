# Performance log (P17)

**Nothing here was measured.** Per the README working agreement, no production build, Lighthouse or
fps run was done. "Before" and "after" are reasoned estimates from the code, to be replaced with real
numbers (Lighthouse mobile, 4x CPU throttle, a 20 s scripted walk) before launch.

## Before / after (estimates)

| Metric | Before | After | Why |
|---|---|---|---|
| First paint in walk mode | blank paper until the Stage mounted | poster (sky, hills, path, tortoise, headline) in the first HTML | `Poster.tsx` is server-rendered |
| LCP element | the world/overlay, after hydration + GSAP | the poster headline (HTML text) | text in the first HTML |
| Initial JS | world + all stops + GSAP in the page chunk | shell only; `Stage` is a `next/dynamic` (`ssr: false`) chunk loaded on idle | `Experience.tsx` |
| CLS | n/a | ~0 expected | poster and stage are both `position: fixed; inset: 0`; the swap is an opacity cross-fade |
| Offscreen set work | 7 sets always painted, all loops running | sets beyond 2 viewports are `visibility/content-visibility: hidden`, loops paused | `SetsLayer.tsx` culling |
| Font preload | 4 families preloaded | Fraunces + Nunito preloaded; Caveat + JetBrains Mono load on first use | `layout.tsx` |
| LCP / INP / TBT / fps | unknown | unknown | measure |

## What changed
- `src/components/shell/Poster.tsx` + `.poster*` CSS: aria-hidden (the real `<h1>` is in StaticView), hidden in static mode and with JS off, removed once `html[data-world="ready"]`.
- `Experience.tsx`: dynamic `Stage` gated by `requestIdleCallback` (1.2 s timeout, `setTimeout` fallback). `Stage` calls `onReady` after two animation frames, which sets `data-world="ready"`. The stage fades in over the poster (`.stage` animation).
- `SetsLayer.tsx`: culling at 1.5 viewports in / 2 out (hysteresis), checked at ~8 Hz on the GSAP ticker, attribute-only (no React state). **Deviation from the prompt:** sets are hidden, not unmounted. The stops query set DOM (`[data-set="skills"] [data-plant-grow]`, the projects stones), so unmounting would break them and re-creating nodes would hitch.
- Polish: paper fade-in on load, 120 ms button lift, focus-ring transition, `theme-color` updated when the walk settles (`lib/walk/themeColor.ts`), 404 page (`not-found.tsx`). The tortoise already shows a pointer cursor.

## Not done / remaining
- **SVGO (item 5):** there are no standalone SVG files (`public/art` is empty); all art is inline JSX, so SVGO does not apply. Hand-trimming path precision is a separate pass once sizes are measured.
- **Bundle analysis (item 3):** needs a production build; run `next build` and check the chunk sizes against 150 KB gz initial. `@next/bundle-analyzer` was not added (needs your OK).
- **Compositing audit (item 6):** `will-change` is already toggled only during motion (`useWorldTransform`). The ≤ 12 layers check and the filter/backdrop-filter audit need DevTools. The grain tile is already a module-level data-URI tile.
- **Images (item 8):** `StaticView` already uses `next/image`; AVIF/WebP, sizes and blur placeholders were not checked.
- **Favicon / apple-touch icon:** `icon.svg` is still the placeholder; no apple-touch icon yet.
- The poster tortoise and headline are approximations of the live Hello scene; check alignment at 320, 1440 and 2560 px.
