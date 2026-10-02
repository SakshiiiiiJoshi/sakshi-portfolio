# P12 — Stop 7: Contact Pond (night)

## Goal
The emotional close and the conversion point: a moonlit pond, fireflies, the tortoise waving, and a clear call to action to contact, download the résumé, or visit GitHub/LinkedIn.

## Prerequisites
P01–P11.

## Context to paste
- `02-content-bible.md` §8 (Contact)
- `03-world-and-path-spec.md` §4 "Stop 7", §7 (wave/sleep)
- `04-interaction-and-motion-spec.md` §5 table row "contact"
- `01-design-system.md` §7.4 (night buttons)

## The Prompt
```text
Implement Stop 7 — Contact Pond (id `contact`, progress 1.00, night).

1. `src/components/world/sets/ContactSet.tsx`: a calm pond with a moon reflection (a mirrored, desaturated, slightly rippled copy of the moon and the nearest tree; ripple via a slow animated displacement implemented with transforms or a tiny SVG filter used on a SINGLE element — measure the cost and drop it if fps falls), a wooden dock with a mailbox (the flag wobbles), the far "deploy tower" lighthouse glowing with a soft pulse, and the pond bank with reeds.
2. Fireflies: 20–30 (tiered down on weak devices) drifting with independent slow bezier paths (transform only), a soft honey glow, a few pulsing brighter near the tortoise. Build it as the shared `Fx` firefly module in `src/components/world/layers/Fx.tsx` (so P13 can reuse/extend it). They gather slightly toward the center on enter.
3. `src/components/stops/StopContact.tsx` (night variants of Card/Button/Bubble):
   - `Caption`, h2 "Let's build something.", the body copy with availability sentence,
   - primary `Button` "Say hello" (mailto with the email, built from parts at runtime to deter scrapers, with a plain-text fallback visible on focus/hover and a "Copy email" secondary action showing a small "Copied" confirmation),
   - secondary buttons: "Download résumé" (`/resume.pdf`, `download` attribute, file-size label), "GitHub", "LinkedIn",
   - availability chip with a pulsing honey dot, response-time line in Caveat,
   - a `Bubble`: "Thanks for walking with me." (appears after the CTA card),
   - footer micro-line with the year and credits,
   - a subtle "Walk back" link/button that goes to Hello (`goTo('hello')`, a long glide) and a "Skip to static view" link.
4. Tortoise: `wave` when settled (the front leg waves, 1.2 s loop); the backpack letter is held out toward the mailbox; after 20 s of no input switch to `sleep` (eyes close, "z z z" floating text, aria-hidden); any input wakes it (`peek` then `idle`/`walk`).
5. Moon glow-up on enter (0.8 s), the CTA card fades in 0.7 s after the tortoise settles. The end-of-journey feeling: add a tiny, tasteful "journey complete" moment (e.g., all 6 backpack items sparkle once). No confetti.
6. Accessibility: contrast ≥ 7:1 on night surfaces, big hit targets, the CTA reachable by keyboard from the DotNav/Tab order after the stop's heading, `mailto` announced clearly (aria-label "Email {name}"), reduced motion → no fireflies drift (static glowing dots), no waving loop (a single wave).
7. Analytics hook points (no vendor yet): emit custom DOM events `portfolio:cta` with `{type: 'email'|'resume'|'github'|'linkedin'|'copy'}` for P18 to wire.

CONSTRAINTS: use the night variants from the design system; only the allowed filter; transform/opacity animation; never auto-open mail clients.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); report the fps at the contact stop with 30 fireflies.
```

## Acceptance criteria
- [ ] The night scene is beautiful, readable and holds ≥ 55 fps.
- [ ] CTA buttons work (mailto, copy with confirmation, résumé download, external links with proper rel).
- [ ] Wave → sleep → wake sequence works and never fights with input.
- [ ] "Walk back" glides to the start without bugs.
- [ ] Contrast and focus visible on night surfaces.
- [ ] Custom CTA events fire.

## Common pitfalls
- Displacement filters on a big area killing fps.
- Sleep timer not cleared on stop exit → the tortoise sleeps while walking.
- Low-contrast honey-on-night text for small sizes.

## Verification
Reach the end; wait 25 s; then wheel back; click each CTA; test with keyboard only and on a phone-size viewport.
