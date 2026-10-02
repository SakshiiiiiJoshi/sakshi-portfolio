# P13 — Day→Night & Ambient Effects

## Goal
Polish the continuous time-of-day transition (tint, light, shadows, stars) and add the ambient life layer (particles, birds, optional sound) with performance tiers.

## Prerequisites
P01–P12.

## Context to paste
- `03-world-and-path-spec.md` §6 (keyframes), §9 (sound)
- `04-interaction-and-motion-spec.md` §12 (performance contract)
- `01-design-system.md` §2.3, §5, §8
- `06-asset-brief.md` §8 (audio)

## The Prompt
```text
Finalize the time-of-day system and ambient effects.

1. Time-of-day: centralize the keyframe table from 03 §6 in `src/lib/walk/timeOfDay.ts` (typed, with a pure `sampleTimeOfDay(progress)` that returns interpolated sky-top, sky-bottom, tint color + opacity, star opacity, grain opacity, sun/moon positions). Use perceptually smooth color interpolation (interpolate in OKLab/OKLCH or at least linear sRGB with verified results; no muddy greys at the dusk transition). Drive `--sky-top`, `--sky-bottom`, `--tint`, `--tint-opacity`, `--grain-opacity` from it every frame via the ticker.
2. Tint overlay: one full-scene multiply/overlay layer using `--tint`, so foliage, hills and ground warm at golden hour and cool at night WITHOUT recoloring shapes individually. Also adjust the shadow ellipses' length/opacity (long at golden hour, faint at noon/night) and a soft vignette that strengthens toward night.
3. Light rays (golden hour) and a moon glow (night) layers with opacity by progress.
4. `Fx.tsx` — a single particle manager with quality tiers (from `src/lib/perf/tier.ts`): dew twinkles (dawn), pollen/dust motes (day), birds (occasional flock, golden hour), sparks (campfire; coordinate with P11), moths (dusk), fireflies (night; coordinate with P12). Each type has a progress window where it fades in/out, a max count per tier (high/medium/low), is transform-only, pauses on `visibilitychange`, and is disabled under reduced motion (static twinkles only).
5. `src/lib/perf/tier.ts`: detect a starting tier (hardwareConcurrency, deviceMemory when available, DPR, reduced motion) and downgrade at runtime if the average fps over 2 s drops below 45 (remove foreground drop-shadows → halve particles → disable grain) with a one-time console note in development. Never upgrade back automatically within a session (avoids flapping).
6. Optional sound (off by default): `SoundToggle` already in the HUD spec (build it fully in P14 if not yet; wire the logic here). Implement `src/lib/audio.ts` using the Web Audio API or HTMLAudio: lazy-loaded after the first user gesture AND only if the toggle is on; ≤ 5 short loops (wind-meadow, stream, crickets-dusk, night-pond, step), crossfaded by progress windows, gain ramps ≤ 0.6 s, a master gain of 0.35, a footstep tick while walking with a rate tied to velocity, auto-mute on tab blur, persist the preference in localStorage (try/catch). If audio files aren't present, the module must no-op gracefully with no console errors. Document in `public/audio/README.md` which files to add and their specs.

CONSTRAINTS: no new dependencies; transform/opacity-only animation; one ticker; sound is strictly opt-in with no autoplay.

VERIFICATION RULE: skip heavy verification. Do NOT run production builds, screenshots, Playwright/E2E, Lighthouse or other long-running checks unless I explicitly ask. At most run a quick typecheck/lint, and describe what you expect to see instead.

When done: typecheck/lint only (no build); scrub through progress 0→1 and capture/describe the look at 0, 0.25, 0.5, 0.75, 0.9, 1.0; report the fps per tier.
```

## Acceptance criteria
- [ ] The sky/tint transitions look natural with no muddy greys or abrupt jumps.
- [ ] Ambient particles fade in/out in their windows; counts respect tiers.
- [ ] FPS downgrade triggers when the CPU is throttled 6× in DevTools; there is no flapping.
- [ ] Sound is off by default; turning it on crossfades correctly; no console errors without audio files.
- [ ] Reduced motion → static ambient.

## Common pitfalls
- Interpolating hex colors as strings; use proper numeric interpolation.
- Autoplaying audio violating browser policy; only start from a user gesture.
- Too many simultaneous particle types at transitions.

## Verification
Scrub the slider/dev overlay; throttle the CPU; toggle sound; check `localStorage` persistence; run with `prefers-reduced-motion`.
