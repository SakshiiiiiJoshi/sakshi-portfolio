import { gsap } from "gsap";
import type { TortoiseRefs } from "./poses";

/**
 * Backpack logic. The satchel/item markup lives in TortoiseSvg (items are
 * #item-leaf … #item-letter); this shows items 0..count-1 and hides the rest.
 * Items already in the right state are left alone so they don't re-pop.
 */
export function setBackpackItems(r: TortoiseRefs, count: number, animate = true) {
  const n = Math.max(0, Math.min(r.items.length, Math.round(count)));
  r.items.forEach((el, i) => {
    const shown = i < n;
    const current = Number(gsap.getProperty(el, "scale"));
    if (shown === current > 0.5 && !gsap.isTweening(el)) return;
    gsap.killTweensOf(el);
    if (!animate) {
      gsap.set(el, { scale: shown ? 1 : 0 });
      return;
    }
    gsap.to(el, shown
      ? { scale: 1, duration: 0.45, ease: "back.out(1.6)", delay: i * 0.06 }
      : { scale: 0, duration: 0.2, ease: "power2.in" });
  });
}

/** "Journey complete": every shown item pops once (scale only), the letter leaning out last. No loop. */
export function sparkleItems(r: TortoiseRefs) {
  const tl = gsap.timeline();
  r.items.forEach((el, i) => {
    if (Number(gsap.getProperty(el, "scale")) < 0.5) return;
    tl.to(el, { scale: 1.3, duration: 0.18, ease: "power2.out", overwrite: "auto" }, i * 0.09)
      .to(el, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" }, i * 0.09 + 0.18);
  });
  return tl;
}
