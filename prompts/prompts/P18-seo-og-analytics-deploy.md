# P18 — SEO, OG Image, Analytics & Deploy

## Goal
Make the site discoverable and shareable, add privacy-friendly analytics, and deploy to Vercel with a clean production setup.

## Prerequisites
P01–P17.

## Context to paste
- `05-tech-architecture.md` §8 (SEO), §9 (security), §11 (deployment)
- `02-content-bible.md` §0, §1 (site data and strings)
- `01-design-system.md` (OG visual style)

## The Prompt
```text
Finish the production readiness.

1. Metadata (App Router Metadata API in `layout.tsx`/`page.tsx`): title template, description (from 02 §1), canonical URL (from `site.ts` `site_url`), `metadataBase`, Open Graph (type website, title, description, url, image), Twitter card (summary_large_image), `robots`, `theme-color`, `icons` (SVG favicon, apple-touch-icon), `manifest` (name, short_name, theme/background colors from the tokens, icons).
2. `src/app/opengraph-image.tsx` (and `twitter-image` re-export): a 1200×630 image generated with `next/og`: the paper background with grain, the hand-drawn path swooping across, the tortoise (simplified SVG), the name in Fraunces (load the font file for the OG renderer), the role in Nunito, and the tagline in Caveat. Provide a static PNG fallback in `public/og-fallback.png` (≤ 200 KB) if generation is impractical. Verify that fonts render in the image.
3. Structured data: JSON-LD `Person` (name, jobTitle, url, image, sameAs: github/linkedin/x, knowsAbout: skills list, address locality if provided). Validate with the Rich Results/Schema validator.
4. `src/app/sitemap.ts` and `src/app/robots.ts`. Sitemap = just the home page (hash links aren't separate pages).
5. Security headers in `next.config` (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera/mic/geolocation, a conservative `X-Frame-Options`/frame-ancestors). Consider a CSP only if it doesn't break Next's inline scripts (use nonces if you add one; document it).
6. Analytics: add Vercel Web Analytics (`@vercel/analytics`) — ask before installing — mounted client-side only, cookie-less. Wire the DOM events from P12 (`portfolio:cta`) and a `stop_reached` event (once per stop per session) via `track()` with minimal properties (no personal data). Make analytics a no-op in development and when the visitor has Do Not Track enabled.
6b. Optional: Speed Insights.
7. Deployment: initialize the Vercel project (link via the CLI: `vercel link`), set the production domain if available, enable preview deployments for branches, verify the build in the Vercel dashboard. Use default Next.js detection (no `vercel.json` needed). Add the `README` deploy section. Do NOT deploy or push without my confirmation; prepare everything and show me the exact commands and expected results.
8. Post-deploy checklist file `docs/launch-checklist.md`: OG preview (opengraph.xyz or the Slack/LinkedIn debuggers), Lighthouse on the live URL, robots/sitemap reachable, the favicon, 404, the résumé download, mailto, all external links, analytics events arriving, HTTPS and the www redirect.

CONSTRAINTS: no tracking cookies; no third-party scripts besides the analytics; keep the OG generation fast (edge-safe fonts, small).

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); show the generated OG image and the JSON-LD output.
```

## Acceptance criteria
- [ ] Sharing the URL in Slack/LinkedIn/X shows the correct OG image, title and description.
- [ ] JSON-LD validates; the sitemap and robots are served.
- [ ] Analytics events appear (CTA clicks, stop reached) and respect DNT.
- [ ] Security headers present (check with securityheaders.com or curl).
- [ ] The production build deploys cleanly on Vercel (after your confirmation).

## Common pitfalls
- The OG image font not loading → a fallback serif renders instead.
- `metadataBase` missing → relative OG URLs.
- Analytics firing in development and polluting the data.

## Verification
`curl -I` the production URL for the headers; the OG debuggers; Lighthouse SEO ≥ 95 on the live site.
