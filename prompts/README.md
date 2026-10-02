# Tortoise Storybook Portfolio — Prompts Folder

A single-page, **non-scrollable** portfolio for a software developer. A hand-drawn tortoise walks a winding path through a storybook meadow as the visitor scrolls, swipes or presses arrow keys. Every stop along the path reveals a chapter of the developer's story: who they are, what they know, what they've built, where they've worked, what they're like, and how to hire them.

This folder contains **no code**. It holds the specs and copy-paste prompts you run, in order, to build the site.

---

## How to use this folder

1. Read docs `00` → `06` once, top to bottom. They are the source of truth (the "bible").
2. Fill in your real facts in `02-content-bible.md` (everything marked `{{LIKE_THIS}}`).
3. Run the prompts in `prompts/` in numeric order (`P01` → `P19`), one per session or one per commit.
4. For every prompt: paste the **Context to paste** blocks, then the **Prompt** block, then check the **Acceptance criteria** before moving on.
5. If a prompt's output drifts from the bible, the bible wins. Fix the output, not the bible (unless you consciously change a decision, in which case update the bible first).

## Folder map

| File | Purpose |
|---|---|
| `00-vision-and-story.md` | Concept, narrative arc, tone, tortoise character bible, audience, success criteria |
| `01-design-system.md` | Palette, fonts, type scale, spacing, texture, illustration rules, motion principles |
| `02-content-bible.md` | All copy per stop + placeholders for your real info + templates |
| `03-world-and-path-spec.md` | The 7 stops, the path, parallax layers, scenery, day→night, tortoise poses |
| `04-interaction-and-motion-spec.md` | Progress model, input handling, snapping, timelines, reduced motion, mobile |
| `05-tech-architecture.md` | Next.js structure, components, state, perf/a11y/SEO budgets, deploy |
| `06-asset-brief.md` | Every illustration/SVG needed, naming, sizes, how to produce them |
| `prompts/P01…P19` | The executable build prompts |

## Canonical facts (every doc and prompt must agree with these)

**Concept:** "Slow is smooth, smooth is fast." A tortoise walks; you follow.

**Theme:** Storybook Meadow — hand-drawn, paper-cut, warm, cozy, with a continuous **dawn → night** progression along the walk.

**Stack:** Next.js (App Router, TypeScript) · Tailwind CSS · GSAP (core + MotionPathPlugin + Observer) · hand-built inline SVG · zustand (tiny store) · deployed on Vercel.

**Fonts:** Fraunces (display) · Nunito (body) · Caveat (handwritten accents) · JetBrains Mono (code/tags).

**Palette tokens:** `paper #F6EEDC` · `moss #5B7F4A` · `sage #A8BF8A` · `forest #2F4A3A` · `shell #7A8F3C` · `honey #F2B84B` · `coral #E8875B` · `mist #CFE5E0` · `plum #5B4B6B` · `night #1F2A44` · `ink #2B2A26`.

**Progress model:** one number `progress` from `0` to `1` along the path.

**The 7 stops** (id · progress · time of day):

| # | id | Title | progress | Time of day |
|---|---|---|---|---|
| 1 | `hello` | Hello | 0.00 | dawn |
| 2 | `about` | About | 0.14 | morning |
| 3 | `skills` | Skills Garden | 0.30 | late morning |
| 4 | `projects` | Stepping Stones | 0.48 | noon |
| 5 | `experience` | Experience Trail | 0.66 | golden hour |
| 6 | `fun` | Fun Facts Campfire | 0.83 | dusk |
| 7 | `contact` | Contact Pond | 1.00 | night |

**Tortoise states:** `idle`, `walk`, `peek`, `hide`, `wave`, `sleep`.

**Component names:** `World`, `Tortoise`, `useWalk` (engine hook), `Hud`, `DotNav`, `SkipLink`, `StaticView`, and one `Stop*` component per stop (`StopHello`, `StopAbout`, `StopSkills`, `StopProjects`, `StopExperience`, `StopFun`, `StopContact`).

**Non-negotiables:** reduced-motion fallback · full keyboard navigation · mobile swipe · a "Skip the walk" static view for recruiters · LCP < 2.5 s · no horizontal/vertical page scroll in the walk view · every stop's content readable by screen readers.

## Run order

| Prompt | What it builds |
|---|---|
| P01 | Project scaffold |
| P02 | Design tokens + global styles |
| P03 | Tortoise character (layered SVG + poses) |
| P04 | World layers + parallax |
| P05 | Path + walk engine (input, snapping) |
| P06 | Stop 1 — Hello |
| P07 | Stop 2 — About |
| P08 | Stop 3 — Skills Garden |
| P09 | Stop 4 — Stepping Stones (Projects) |
| P10 | Stop 5 — Experience Trail |
| P11 | Stop 6 — Fun Facts Campfire |
| P12 | Stop 7 — Contact Pond |
| P13 | Day→night + ambient effects |
| P14 | HUD + dot navigation |
| P15 | Mobile + responsive |
| P16 | Accessibility + reduced motion + static view |
| P17 | Performance + polish |
| P18 | SEO, OG, analytics, deploy |
| P19 | QA + launch |

## Prompt template (every file in `prompts/` follows this)

1. **Goal** — one sentence.
2. **Prerequisites** — which prompts must be done.
3. **Context to paste** — the doc excerpts the AI needs.
4. **The Prompt** — copy-paste ready.
5. **Acceptance criteria** — checkboxes.
6. **Common pitfalls** — what usually goes wrong.
7. **Verification** — how to see it working.

## Working agreements for the AI that executes these prompts

- Follow the bible. Don't invent new colors, fonts, stops or component names.
- Small, reviewable commits: one prompt = one commit (or a few).
- Prefer inline SVG and CSS variables over images and hardcoded values.
- Never add a dependency not listed in `05-tech-architecture.md` without asking.
- **Skip heavy verification.** Do not run production builds, screenshots, Playwright/E2E, Lighthouse or other long checks unless the user explicitly asks. At most run a quick typecheck/lint. This overrides any "verify" or "when done" step in the docs; those become "describe what you expect to see".
- Respect `prefers-reduced-motion` from the very first animation, not as an afterthought.
