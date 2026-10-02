# P19 — QA, Cleanup & Launch

## Goal
Final end-to-end verification, cleanup of dev-only routes and placeholder content, cross-browser/device testing, and the launch.

## Prerequisites
P01–P18, and the real content filled in `02-content-bible.md` → `src/content/*`.

## Context to paste
- `README.md` (canonical facts, non-negotiables)
- `00-vision-and-story.md` §8 (success criteria)
- `05-tech-architecture.md` §12 (definition of done)
- All `docs/*.md` produced by earlier prompts

## The Prompt
```text
Run the final QA pass and prepare for launch. Be skeptical: try to break it.

1. Content audit: grep the codebase for `{{`, "Lorem", "TODO", "sample", "example.com", "FIXME"; confirm all copy is real and typo-free; check every link (live, repo, write-up, LinkedIn, GitHub, résumé) returns 200 and opens in a new tab with `rel="noopener noreferrer"`; check the résumé PDF is current; verify that dates and durations are correct; verify the tortoise name is consistent everywhere.
2. Remove dev-only artifacts: delete `/styleguide`, `/tortoise-lab`, `/world-lab`, the debug overlay (or gate it behind `NODE_ENV !== 'production'`), console logs (keep the intentional easter-egg message), unused components/assets/deps (`depcheck` or manual), and unused CSS.
3. Functional test checklist (no Playwright or automated E2E unless I ask; write a manual checklist in `docs/qa-report.md`): 
   - load `/` → the poster appears → the world loads → the intro plays once,
   - wheel from Hello to Contact visits all 7 stops in order; each shows the correct content,
   - keyboard: Right ×6, Left ×6, Home/End, 1–7, S, Esc, Shift+Arrows,
   - dot nav jumps; the hash deep links `/#about … /#contact` and `/#projects` stones,
   - Projects: each stone's card matches; links work; N edge cases,
   - Skip the walk → the static view has all content; back to the walk restores the position,
   - CTA buttons: mailto, copy confirmation, résumé download, external links,
   - easter eggs: shell click, T, Konami, the 20 s sleep.
4. Cross-browser/device: Chrome, Firefox, Safari macOS, Safari iOS, Chrome Android, Edge; an older/slower device if available. Record the fps feel, any visual glitches (SVG rendering differences in Safari: transform-origin, filters, blend modes), the gesture behavior, the font loading.
5. Resilience: slow 3G throttling (poster first, then the world), offline reload after the first visit (nice-to-have), JS disabled (static content), cookies/storage blocked (no crashes), window resize mid-walk, the tab hidden/shown mid-hop, rapid mashing of keys/wheel/clicks, 10-minute idle soak (no memory growth — check the Performance Monitor).
6. Final metrics: Lighthouse (mobile + desktop) on the production URL: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95; axe clean; the bundle sizes within budget. Record in `docs/qa-report.md`.
7. Fix every High and Medium finding; list the Low ones as a backlog in `docs/backlog.md` (ideas: blog trail extension, guestbook, tortoise skins, more easter eggs, localization).
8. Launch: after I confirm, merge to main, let Vercel deploy to production, run `docs/launch-checklist.md`, and give me the final URL plus a short "how to update content" note (edit `src/content/*`, commit, push).

CONSTRAINTS: don't skip a failing test by weakening it; report faithfully. Don't push or deploy without my explicit go-ahead.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: summarize the pass/fail results, what was fixed, what remains, and the launch status.
```

## Acceptance criteria
- [ ] Zero placeholders or dev routes in production.
- [ ] All functional checks pass in the three major engines + mobile.
- [ ] The success criteria from `00` §8 are met or the gaps are documented.
- [ ] `docs/qa-report.md` and `docs/backlog.md` exist and are honest.
- [ ] The live site matches the vision: a non-scrolling storybook walk with a tortoise.

## Common pitfalls
- Safari SVG quirks (transform-origin, blend modes). Test early, not at the end.
- Forgetting to update the résumé PDF and the OG image after real content changes.
- Leaving the debug overlay reachable in production.

## Verification
Ask 3 people unfamiliar with the project to open the link on their own devices without instructions; watch where they hesitate; fix that.
