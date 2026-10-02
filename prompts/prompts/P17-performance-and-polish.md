# P17 — Performance & Polish

## Goal
Hit the performance budgets (LCP, JS size, fps, CLS), add the instant poster, cull offscreen work, optimize SVGs, and add the final layers of delight.

## Prerequisites
P01–P16.

## Context to paste
- `05-tech-architecture.md` §3, §7 (budgets)
- `04-interaction-and-motion-spec.md` §12
- `06-asset-brief.md` §2, §9
- `00-vision-and-story.md` §8 (success criteria)

## The Prompt
```text
Optimize and polish. Measure first, then change, then re-measure; keep a log in `docs/perf-log.md` with before/after numbers.

1. Baseline: only if I explicitly ask for measurements, run a production build and Lighthouse; otherwise estimate and record LCP, CLS, INP, TBT, JS transferred, and the fps during a 20 s scripted walk (use the Performance panel or a small dev script).
2. Instant poster: `src/components/shell/Poster.tsx` — a minimal inline SVG of the Hello scene (sky gradient, 2 hills, the path, the tortoise idle, the hero headline as real HTML text) rendered by the server so LCP is the headline text. The heavy world loads via `next/dynamic` (`ssr: false`) after hydration/idle (`requestIdleCallback` with a fallback), and cross-fades from the poster with no layout shift.
3. Code splitting: the world, the stops and GSAP load in separate chunks; the initial JS < 150 KB gz. Verify with the bundle analyzer output (use Next's built-in analysis or `@next/bundle-analyzer` as a dev-only dependency; ask first if adding).
4. Culling: render the set pieces only when within ±1.5 viewports of the camera (mount/unmount by progress ranges; keep their DOM alive but `content-visibility: auto` / `visibility: hidden` for the near ones to avoid re-creation hitches); pause animations of culled sets.
5. SVG optimization: run SVGO on every standalone SVG (or integrate via SVGR config) preserving ids needed by animation; target ≤ 80 KB gz per layer and ≤ 600 KB gz for all art; remove unused defs; reduce the path precision to 2 decimals; flatten needless groups; verify there are no visual regressions at 3 sizes.
6. Rendering costs: audit the paint/composite layers (DevTools Layers/Rendering → paint flashing); keep ≤ ~12 composited layers; make sure `will-change` is toggled only during motion; avoid `filter` and `backdrop-filter` on large moving areas; pre-rasterize the grain tile.
7. Fonts: preload display + body only; limit the weights; confirm no FOIT/CLS (`size-adjust` fallbacks via next/font).
8. Images: screenshots in WebP/AVIF through next/image with sizes, lazy, blur placeholders.
9. Polish list (do all that fit the budget): subtle page-load fade of the paper background; cursor changes on interactive objects (the tortoise = a pointer); micro-interactions on buttons (1px lift, 120 ms); smooth focus ring transitions; the favicon and the apple-touch icon; theme-color meta that updates with the time of day (throttled, only on settle); the `404` page per 02 §1.
10. Re-measure and update `docs/perf-log.md`; list remaining issues.

TARGETS: Lighthouse mobile Performance ≥ 90, LCP < 2.5 s, CLS < 0.05, INP < 200 ms, initial JS < 150 KB gz, ≥ 55 fps average on a laptop during the walk.

CONSTRAINTS: don't sacrifice accessibility or the reduced-motion behavior for speed; no new runtime dependencies.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: report the before/after table.
```

## Acceptance criteria
- [ ] All Lighthouse and budget targets met (or each miss is documented with a reason and a plan).
- [ ] The poster renders instantly and the swap to the live world is seamless.
- [ ] The perf log has real before/after numbers.
- [ ] No visual regressions in the SVG optimization.
- [ ] fps is steady in the 20 s scripted walk.

## Common pitfalls
- SVGO stripping ids needed by GSAP.
- The poster and world misaligned, causing a visible jump.
- Culling that mounts sets late and causes a visible pop-in; use a generous window.

## Verification
Lighthouse (mobile throttled), WebPageTest if available, a real mid-range phone, the 4× CPU throttle test.
