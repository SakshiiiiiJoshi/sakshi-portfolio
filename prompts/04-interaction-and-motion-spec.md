# 04 — Interaction & Motion Spec

## 1. The core idea
There is **no document scroll**. `html, body { overflow: hidden; height: 100dvh }`. Input events are captured and converted into a single number, `progress ∈ [0, 1]`. Everything (camera, tortoise, sky, content reveals) is a pure function of `progress`, plus a few time-based loops.

## 2. State model

```ts
// store (zustand)
{
  progress: number,        // 0..1, the *rendered* (smoothed) value
  target: number,          // 0..1, where input wants to go
  velocity: number,        // signed, progress units per second (smoothed)
  activeStop: StopId,      // nearest stop within SNAP window, else the last passed
  settledStop: StopId | null, // set when idle at a stop (drives peek/content)
  direction: 1 | -1,
  mode: 'walk' | 'static', // static = StaticView / reduced motion
  soundOn: boolean,
  hasInteracted: boolean,
}
```
`progress` chases `target` via a critically-damped smoothing (GSAP `quickTo` on a proxy, `duration ≈ 0.9`, `ease: power3.out`) so input feels weighty and "tortoise-like".

## 3. Input mapping

| Input | Behavior |
|---|---|
| Mouse wheel / trackpad | `Δy` (and `Δx`) × `WHEEL_K` added to `target`. Clamp 0..1. Normalize deltaMode. Use GSAP `Observer` (`type: "wheel,touch,pointer"`, `preventDefault: true`, `tolerance: 8`). |
| Touch swipe (vertical **or** horizontal; either advances) | `dragDelta` × `TOUCH_K`; momentum continues for ~600 ms, decaying. |
| Arrow Right / Down / Space / PageDown | Advance to the **next stop** (animated, 1.4–2.4 s depending on distance). |
| Arrow Left / Up / PageUp | Go to the **previous stop**. |
| Shift + Arrow | Fine step ±0.02 progress. |
| `Home` / `End` | Jump to hello / contact (animated). |
| `1`–`7` | Jump to that stop. |
| Click a dot (DotNav) | Animate to that stop (duration ∝ distance, min 1.2 s, max 3.2 s). |
| Click the tortoise / `T` | easter eggs (see 02). |
| `Esc` | Close open case-study card / return to the walk. |
| `S` | Toggle StaticView ("Skip the walk" / "Back to the walk"). |

Constants (tunable in one file `lib/walk/constants.ts`): `WHEEL_K = 0.00035`, `TOUCH_K = 0.0016`, `SNAP_WINDOW = 0.025`, `SNAP_DELAY = 350 ms`, `MAX_VELOCITY = 0.9 /s`.

Total "length" tuning target: **a casual wheel/swipe journey from Hello to Contact takes ~90–120 seconds**, with the keyboard "next" route taking ~25 s.

## 4. Snapping ("gravity wells")
- After input stops for `SNAP_DELAY`, if `|progress − stopProgress| < SNAP_WINDOW`, glide to the exact stop value (`power2.out`, 0.7 s).
- Between stops there is **no forced snap**, so the visitor can savor the scenery.
- While inside `SNAP_WINDOW`, input has **resistance** (a 0.6× multiplier on `WHEEL_K` and `TOUCH_K`), a gentle "pull" that makes stops feel intentional.
- A stop is `settled` when velocity < 0.01 for 250 ms inside its window; that triggers `peek` and content reveal.

## 5. Content reveal timeline per stop
Each stop exposes an `enter` timeline, an `exit` timeline and a `scrub` (continuous) part.
- **Enter** (when `settledStop` becomes this stop): narrator caption fades in (0.6 s) → tortoise `peek` (0.5 s) → bubble pops (0.3 s) → card slides/fades in (0.7 s, `power2.out`) → staggered children (60–90 ms).
- **Exit** (when input resumes and `|progress − stopProgress| > 0.012`): the card fades and slides out 24 px (0.35 s), the bubble disappears, and the tortoise returns to `walk`.
- **Scrub part:** the parallax and sky are always scrubbed directly by `progress` with no easing, so the world feels glued to the input.
- **Reentry:** returning to a visited stop replays `enter` but faster (0.6×).

### Stop-specific timings (summary)
| Stop | Hero beat | Extra interaction |
|---|---|---|
| hello | headline letters rise (stagger 30 ms), chevron bobs | none, "scroll to begin" idle hint after 4 s |
| about | bubble types in word-by-word (Caveat, 25 ms/word) | none |
| skills | plants **grow** from 0 → level (stagger 70 ms, `back.out`) | hover/focus tooltips; tortoise peeks at the plant |
| projects | stones **appear** (drop + ripple), tortoise hops | the visitor advances through stones by scroll; the active stone's card shows; click a stone to jump to it; `Esc` closes |
| experience | signposts rise from the ground in order as the tortoise climbs | the active signpost's card swaps with a 200 ms crossfade |
| fun | fire ignites (scale/opacity), notes pin one by one every 700 ms | click a note to bring it to the front; `←→` cycle notes |
| contact | moon glow up, fireflies gather, CTA card fades in | tortoise waves; sleep after 20 s |

## 6. Projects stones: special progress mapping
Between `progress 0.42` and `0.56` the world pan slows (camera locked at the stream) and progress maps to **stone index**:
```
stoneIndex = floor( remap(progress, 0.43, 0.55, 0, N) )   // N = number of stones
```
Hop animation triggers when `stoneIndex` changes. The card for `stoneIndex` crossfades. Leaving the segment forward continues across the far bank to the experience stop.

## 7. Experience trail progress mapping
Between `0.58` and `0.74`, the tortoise climbs; signposts are spaced evenly; the active signpost is the one nearest the tortoise within ±1/(2·M) of progress span (M = number of roles). The active card follows the active signpost.

## 8. Fun facts mapping
At the `fun` stop (settled), facts reveal on a timer **and** respond to input: scrolling forward shows the next fact; after the last fact, the next input leaves the stop.

## 9. HUD behavior
- **Dot trail:** reflects `progress` continuously (a small tortoise-head marker slides along the dashed line between dots). Click/keyboard to jump.
- **Hint** fades out after the first real input and returns after 8 s of idle at the Hello stop only.
- **Skip the walk** is always visible. It sets `mode = 'static'` with a crossfade (400 ms).
- Focus management: when `settledStop` changes via keyboard, move focus to the stop's heading (`tabIndex=-1`) and announce it with a polite live region ("Stop 3 of 7: Skills Garden").

## 10. Reduced motion & static fallback
- If `prefers-reduced-motion: reduce`: start in `mode = 'static'` automatically (with a visible "Take the walk anyway" button). If the user opts into the walk, replace continuous parallax with discrete crossfades between stops (no tortoise leg animation, no ambient loops, no hops).
- In `static` mode: standard scrolling page (`overflow: auto`), semantic sections, the same content data, and a pared-down illustrated header.
- No content is ever **only** reachable through animation or hover.

## 11. Mobile specifics
- Vertical swipe **or** horizontal swipe both advance progress (dominant axis wins).
- Prevent browser pull-to-refresh/overscroll: `overscroll-behavior: none; touch-action: none` on the stage (but keep `touch-action: pan-y` on scrollable case-study cards if their content overflows).
- Use `100dvh`; handle URL-bar resize without jumps by reading `visualViewport`.
- Cards become a **bottom sheet** (max 55dvh) that can scroll internally; the sheet drag handle doesn't alter progress.
- Haptics: none (avoid).

## 12. Performance contract for motion
- One `requestAnimationFrame` loop (GSAP ticker) updates: the layer X transforms, the tortoise position/rotation, the sky vars. Everything else is CSS or short GSAP tweens.
- Layers use `will-change: transform` only while moving (toggled on after the first input, off after 1.5 s idle).
- Cap devicePixelRatio-dependent effects (filters, big blurs) on low-end devices (detect via `navigator.hardwareConcurrency <= 4` or a FPS monitor falling < 45 fps for 2 s → downgrade tier: remove foreground layer shadows → halve particles → drop grain).
- Pause all ambient loops when the tab is hidden (`visibilitychange`).

## 13. Deep links
`/#about`, `/#skills`, `/#projects`, `/#experience`, `/#fun`, `/#contact` open the walk and animate (or jump instantly if reduced motion) to that stop. The URL hash updates (`history.replaceState`, not push) when settled on a stop. Optional: `/#projects/<slug>` opens a specific stone.

## 14. Timing/easing cheat-sheet
| Use | Duration | Ease |
|---|---|---|
| progress smoothing | 0.9 s | power3.out |
| stop snap | 0.7 s | power2.out |
| jump between stops (dot click) | 1.2–3.2 s | power3.inOut |
| card enter | 0.7 s | power2.out |
| card exit | 0.35 s | power2.in |
| bubble pop | 0.3 s | back.out(1.6) |
| tortoise turn | 0.25 s | power2.inOut |
| stone hop | 0.5 s | custom arc (y: sine, x: linear) |
| ambient sway | 4–6 s | sine.inOut (yoyo) |
