# Responsive QA (P15)

Status: implemented and typechecked/linted only. Per the project's verification rule no builds, screenshots or E2E were run, so the "Expected" lines describe what DevTools emulation should show; tick each box when you've confirmed it.

## What changed
- `layout.tsx`: `viewport` export with `viewport-fit=cover` (safe-area insets are now real on notched phones).
- `useWorldTransform.ts`: `ResizeObserver` + `visualViewport` + `orientationchange` are coalesced (80 ms debounce, one rAF, <1px changes ignored), so the iOS URL-bar collapse doesn't jolt the scene.
- `constants.ts`: `anchorFraction(vw, vh)` → 27% on landscape phones (≤450px tall); 35 / 40 / 50% otherwise.
- `shared/Sheet.tsx` (`SheetBar`, `SHEET_MQ`): shared bottom-sheet behaviour for About, Projects, Experience, Fun and Contact: visual handle, collapse/expand button (title peek), always a `data-scroll-region`, scene shifts up while open. Skills keeps its top card (the garden is the content) and Hello keeps its top card.
- `globals.css` (end of file): shared `.sheet` rules (55dvh, `overscroll-behavior: contain`, `touch-action: pan-y`, safe-area padding), tablet-portrait sheet mode, landscape-phone compact side panel, foreground/cloud reduction, 44px dot-nav cells.
- `Fx.tsx`: particle budget drops a tier on <640 and is `low` on landscape phones.
- `StopContact.tsx`: address reveal also fires on `pointerdown` (touch), not only hover/focus.

## Checklist per profile
Layout modes: **wide** ≥1024, **mid** 640–1023, **narrow** <640, **sheet mode** = narrow or (≤1023 and portrait), **short landscape** = ≤450px tall landscape.

| Profile | Mode | Tortoise x | Cards | Expected |
|---|---|---|---|---|
| iPhone SE 375×667 | narrow, sheet | 50% | bottom sheet ≤55dvh (≈367px), scene shifted up | [ ] sheet clears the dots; [ ] collapse shows title peek; [ ] no horizontal overflow |
| iPhone 14 390×844 | narrow, sheet | 50% | bottom sheet | [ ] notch/home indicator padding; [ ] URL-bar collapse does not move the scene |
| Pixel 7 412×915 | narrow, sheet | 50% | bottom sheet | [ ] no pull-to-refresh / overscroll glow; [ ] swipe up/left advances, down/right goes back |
| iPad 768×1024 | mid, **sheet** (portrait) | 40% | bottom sheet, tortoise never covered | [ ] foreground density halved; [ ] sheet collapses |
| iPad 1024×768 | wide | 35% | right panel | [ ] card does not overlap the tortoise |
| Phone landscape 844×390 | short landscape | 27% | 50% side panel, scrolls inside | [ ] HUD compact; [ ] decor hidden; [ ] bubbles hidden; [ ] rotate mid-stop and mid-hop keeps position |
| Desktop 1440×900 | wide | 35% | right panel | [ ] unchanged from P14 |
| Desktop 2560×1440 | wide, scale capped 1.25× | 35% | right panel | [ ] sky/ground extend, no gaps |
| 320×568 (floor) | narrow, sheet | 50% | bottom sheet | [ ] dot nav (7 × 44px + padding = 312px) fits; [ ] no cut-off text |

## Cross-cutting
- [ ] No page scroll or elastic bounce (`html, body { overflow: hidden; overscroll-behavior: none }`, `.stage { touch-action: none }`).
- [ ] Dragging inside a sheet scrolls the sheet, never `progress` (`data-scroll-region` is on every sheet; Observer ignores it).
- [ ] Targets ≥44×44: dot-nav buttons/cells, HUD buttons, sheet toggle.
- [ ] Body text ≥16px on mobile; mono tags ≥12px.
- [ ] Hover-only affordances have tap equivalents: dot-nav tooltip → "current stop" label; Skills tooltip → tap toggle; Contact address → pointerdown/focus/copy button; sound toggle and Experience role dots expose state via icon/aria-pressed and the card's visible company name.

## Known follow-ups
- Skills and Hello cards are top cards on phones and were not moved into the sheet component.
- Landscape: verify long Contact/Fun cards scroll (they use `overflow-y: auto`; `data-scroll-region` is only forced in sheet mode, and Fun sets it when narrow).
