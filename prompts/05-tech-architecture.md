# 05 — Tech Architecture

## 1. Stack (approved dependencies only)
| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js (latest stable, App Router) + TypeScript (strict) | Static export-friendly; deploy to Vercel |
| Styling | Tailwind CSS + CSS variables | Tokens in `globals.css` |
| Animation | GSAP core + `MotionPathPlugin` + `Observer` (+ `useGSAP` from `@gsap/react`) | All GSAP plugins are free now; register once on the client |
| State | `zustand` | Tiny global store for progress/mode |
| Fonts | `next/font/google` (Fraunces, Nunito, Caveat, JetBrains Mono) | Subset latin, `display: swap` |
| Icons | Inline SVG components | No icon library |
| Analytics | Vercel Web Analytics (cookie-less) | Optional, P18 |
| Lint/format | ESLint (next config) + Prettier | |
| Tests (light) | Playwright smoke tests (optional, P19) | |
No other runtime dependencies without asking.

## 2. Folder layout
```
src/
  app/
    layout.tsx            # fonts, metadata, <body> classes
    page.tsx              # renders <Experience/> client shell
    globals.css           # tokens, base, grain, utility classes
    opengraph-image.tsx   # dynamic OG (P18)
    not-found.tsx
    icon.svg              # tortoise favicon
  components/
    shell/
      Experience.tsx      # decides walk vs static, mounts everything
      Stage.tsx           # fixed full-viewport stage, event capture
      Hud.tsx  DotNav.tsx  SkipLink.tsx  SoundToggle.tsx  Hint.tsx  LiveRegion.tsx
    world/
      World.tsx           # layer stack + camera transform
      layers/ Sky.tsx FarHills.tsx MidHills.tsx Trees.tsx PathLayer.tsx Foreground.tsx Fx.tsx Grain.tsx
      sets/   HelloSet.tsx AboutSet.tsx SkillsSet.tsx ProjectsSet.tsx ExperienceSet.tsx FunSet.tsx ContactSet.tsx
    tortoise/
      Tortoise.tsx  TortoiseSvg.tsx  poses.ts  Backpack.tsx
    stops/
      StopHello.tsx StopAbout.tsx StopSkills.tsx StopProjects.tsx
      StopExperience.tsx StopFun.tsx StopContact.tsx
      shared/ Bubble.tsx Card.tsx Tag.tsx Caption.tsx Button.tsx
    static/
      StaticView.tsx  (plus section components)
  lib/
    walk/
      constants.ts   # WHEEL_K, TOUCH_K, SNAP_*, STOPS table
      useWalk.ts     # engine hook: Observer, smoothing, snapping, keyboard
      store.ts       # zustand store
      path.ts        # path sampling helpers (progress → x,y,angle)
      timeline.ts    # per-stop enter/exit registry
    a11y/ focus.ts  reducedMotion.ts
    perf/ tier.ts    # FPS monitor + quality tiers
    gsap.ts          # single place to register plugins
  content/
    site.ts  skills.ts  projects.ts  experience.ts  fun.ts  captions.ts
public/
  resume.pdf   art/ (only raster assets if any)   audio/ (optional)
```

## 3. Rendering strategy
- `page.tsx` is a server component that renders the **static semantic content** (all sections, visually hidden in walk mode, visible in static mode). This gives crawlers and screen readers full content and makes `StaticView` free.
- The walk `Stage` is a client component mounted after hydration. It uses `dynamic()` with `ssr: false` for the heavy world/GSAP code, so the first paint is the Hello stop's lightweight poster.
- **Poster:** an inline, minimal SVG of the Hello scene (sky + hills + tortoise idle) renders instantly and is swapped for the live world.

## 4. The engine contract (`useWalk`)
Inputs: DOM element (stage), STOPS table, reduced-motion flag.
Outputs (via store): `progress`, `target`, `velocity`, `activeStop`, `settledStop`, `direction`.
Methods: `goTo(stopId | progress, opts)`, `next()`, `prev()`, `nudge(delta)`.
Side effects: registers `Observer`, keydown listeners, hash sync, and a GSAP ticker callback `onTick` that writes CSS variables (`--p`, `--sky-top`, `--sky-bottom`, `--tint`) on the stage element and sets transforms on layers via refs (not React state, so no re-render per frame).
**Rule:** per-frame values never go through React state. Only discrete changes (`activeStop`, `settledStop`, `mode`) trigger React updates.

## 5. Data flow
`content/*.ts` (typed data) → server-rendered semantic markup AND `Stop*` components → both views stay in sync because they read the same data.

## 6. Accessibility architecture
- Landmarks: `<header>`, `<main>`, one `<h1>` (in Hello), `<h2>` per stop, `<nav aria-label="Story stops">` for DotNav.
- Walk mode: stage `role="application"`? **No.** Avoid it. Use normal semantics: the dot nav is a list of buttons, `aria-current="step"` on the active stop; live region announces the stop changes; the visually hidden full-content sections remain in DOM order.
- All illustrations `aria-hidden` unless meaningful. The tortoise has an `aria-label` updated at stop changes only (not per frame).
- Focus: visible honey ring; skip link ("Skip the walk") is the **first** focusable element.
- Reduced motion → StaticView by default.
- Keyboard map documented in a "?" help popover (optional).

## 7. Performance budgets
| Metric | Budget |
|---|---|
| LCP | < 2.5 s (4G mid-phone), poster paints < 1 s |
| JS (initial, gz) | < 150 KB before the world loads; < 300 KB total |
| CLS | < 0.05 |
| INP | < 200 ms |
| Frame rate | ≥ 55 fps average on a 2020 mid-range laptop; ≥ 45 fps on a mid-range phone |
| SVG weight | each layer ≤ 80 KB gz; total art ≤ 600 KB gz |
| Fonts | ≤ 4 families, ≤ 8 files total, preloaded display + body |
Techniques: SVGO the art, split layers into lazily-rendered chunks, `content-visibility` on offscreen sets, cull sets outside the camera window (render only sets within ±1.5 viewport), transform-only animation, quality tiers (see `04` §12).

## 8. SEO & sharing
- Metadata API: title, description, canonical, OG, Twitter card.
- JSON-LD `Person` (name, jobTitle, url, sameAs: github/linkedin).
- `sitemap.xml`, `robots.txt`.
- OG image: a stylized tortoise on the path with name and role (dynamic via `opengraph-image.tsx`).
- Hash deep links don't affect SEO. The static semantic content is the indexable text.

## 9. Security & privacy
- No third-party scripts except optional Vercel Analytics.
- `mailto:` link obfuscation is not necessary; optionally build the address at runtime from parts to deter basic scrapers.
- Security headers via `next.config` (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- External links: `rel="noopener noreferrer"`.

## 10. Environment & scripts
- Node LTS, package manager: `pnpm` (or `npm`; pick one and stay consistent).
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`.
- `.env.example` only if analytics keys are needed (likely none).
- Git: conventional commits, one prompt per commit.

## 11. Deployment
Vercel, auto-deploy from the main branch, preview deploys for PRs. Custom domain optional. `vercel.ts`/`vercel.json` not required for a default Next.js project.

## 12. Definition of done (technical)
`pnpm build` passes with zero type or lint errors; Lighthouse targets in `00` met; keyboard-only walkthrough possible; reduced-motion verified; tested on Chrome, Safari (macOS/iOS), Firefox, and an Android Chrome device.
