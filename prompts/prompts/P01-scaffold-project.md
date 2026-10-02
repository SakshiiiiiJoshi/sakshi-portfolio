# P01 — Scaffold the Project

## Goal
Create the Next.js + Tailwind + GSAP project skeleton with fonts, folder structure, content data stubs and a working "hello world" stage.

## Prerequisites
None (first prompt). Read `README.md`, `05-tech-architecture.md`.

## Context to paste
- `05-tech-architecture.md` §1 (stack), §2 (folder layout), §10 (scripts)
- `02-content-bible.md` §0 (your facts YAML, filled in) and §1 (global strings)
- `README.md` "Canonical facts"

## The Prompt
```text
You are building a single-page, non-scrollable portfolio website with a tortoise mascot that walks along a path. Follow the attached docs strictly; do not invent new colors, fonts, stops or component names.

TASK: scaffold the project in the current directory (it is empty except for the `prompts/` folder — keep that folder untouched).

1. Initialize Next.js (latest stable, App Router, TypeScript strict, Tailwind CSS, ESLint, `src/` directory, import alias `@/*`) non-interactively. Use pnpm if available, otherwise npm.
2. Install ONLY these runtime deps: gsap, @gsap/react, zustand. Dev deps: prettier, prettier-plugin-tailwindcss.
3. Create the exact folder layout from 05-tech-architecture.md §2 with placeholder files (each exporting a minimal typed stub component or function and a one-line comment saying what it will do and which prompt fills it in, e.g. "// filled in by P05"). Don't implement logic yet.
4. Configure fonts in `src/app/layout.tsx` with `next/font/google`: Fraunces (variable, weights 600/700, include the SOFT and opsz axes if the loader supports them), Nunito (400/600/700), Caveat (500/700), JetBrains Mono (400/500). Subsets: latin. `display: 'swap'`. Expose CSS variables `--font-display`, `--font-body`, `--font-hand`, `--font-mono` and apply them on <body>.
5. Create `src/lib/gsap.ts` that registers MotionPathPlugin and Observer and the useGSAP hook once, guarded for client-only usage, and exports `gsap`.
6. Create typed content stubs in `src/content/`: `site.ts` (the YAML from 02 §0 as a typed object with the placeholders as sample strings), `skills.ts`, `projects.ts` (3 sample projects following the data model in 02 §5.1), `experience.ts` (3 sample roles following 02 §6.1), `fun.ts` (6 sample facts), `captions.ts` (the table in 02 §9). Export TypeScript types for each model.
7. Create `src/lib/walk/constants.ts` with the STOPS table from README (id, title, progress, time-of-day) as a typed `as const` array plus the tunable constants from 04 §3 (WHEEL_K, TOUCH_K, SNAP_WINDOW, SNAP_DELAY, MAX_VELOCITY).
8. Create `src/lib/walk/store.ts`: a zustand store with the state shape from 04 §2 (initial values only plus simple setters).
9. `src/app/page.tsx`: render a full-viewport div (100dvh) with the Hello headline from 02 §2 using the site data, so we can see fonts and data flowing. Set `html, body { height: 100dvh; overflow: hidden }` in globals.css for now.
10. Add scripts: dev, build, start, lint, typecheck (tsc --noEmit), format. Add a `.prettierrc` using the tailwind plugin. Add `.gitignore` entries as needed. Initialize git and make the first commit "chore: scaffold project" if a repo doesn't exist.
11. Write a short `SETUP.md` (how to run, folder map, link to the prompts folder).

CONSTRAINTS: TypeScript strict with no `any`. No UI libraries. No images. Keep every stub tiny.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: run a quick `typecheck` and fix errors (no build). Report the folder tree and the commands you ran.
```

## Acceptance criteria
- [ ] `dev` runs; the page shows "Hi, I'm {name}." in Fraunces on a cream background.
- [ ] `typecheck`, `lint`, `build` all pass.
- [ ] The folder tree matches `05` §2 (stubs exist for every listed file).
- [ ] Only gsap, @gsap/react and zustand were added as runtime deps.
- [ ] `STOPS` table matches the README exactly (ids, progress values).
- [ ] Fonts expose the four CSS variables.

## Common pitfalls
- GSAP plugin registration during SSR → "window is not defined". Keep it in `lib/gsap.ts` guarded by `typeof window !== 'undefined'` and only import it in client components.
- Fraunces axes failing in `next/font` → fall back to the standard weights, and note it.
- Accidentally enabling `output: 'export'`; don't, unless you decide to self-host statically.

## Verification
`pnpm dev` → open the page → inspect <body> classes for the 4 font variables → `pnpm build` succeeds.
