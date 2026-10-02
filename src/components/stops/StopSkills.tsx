"use client";

import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/a11y/reducedMotion";
import { useMedia } from "@/lib/useMedia";
import { arrivedByKeyboard, register } from "@/lib/walk/timeline";
import { useWalkStore } from "@/lib/walk/store";
import { skills, skillsCopy } from "@/content/skills";
import { captions } from "@/content/captions";
import { BEDS, levelWord, skillsByBed } from "@/lib/skillsGarden";
import type { TortoiseState } from "@/components/tortoise/poses";
import { Caption } from "./shared/Caption";

const NARROW = "(max-width: 639px)";
const PLANT_STAGGER = 0.07;
const TIP_GAP = 12;
const EDGE = 8;
/** Re-entry plays at this fraction of the first-visit durations. */
const REPLAY = 0.6;

// The seed packet goes into the satchel once per page load.
let firstVisitDone = false;

const PLANTS = '[data-set="skills"] [data-plant-grow]';

export function StopSkills({
  onTortoise,
  onSeeds,
}: {
  /** Pose the Skills stop wants the tortoise in (null = let the walk engine decide). */
  onTortoise: (pose: TortoiseState | null) => void;
  /** Called once, the first time the garden is reached: the seed packet goes into the satchel. */
  onSeeds: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const narrow = useMedia(NARROW);
  const activeName = useWalkStore((s) => s.activeSkill);
  const active = skills.find((s) => s.name === activeName) ?? null;
  const beds = skillsByBed();

  useGSAP(
    (_ctx, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;
      const card = root.querySelector<HTMLElement>("[data-card]");
      const caption = root.querySelector<HTMLElement>("[data-caption]");
      const title = root.querySelector<HTMLElement>("#skills-title");
      const reduced = prefersReducedMotion();
      const plants = () => gsap.utils.toArray<SVGGElement>(PLANTS);

      let tl: gsap.core.Timeline | null = null;

      gsap.set(root, { autoAlpha: 0 });
      // beds start empty so nothing pops in full size before the tortoise arrives
      if (!reduced) gsap.set(plants(), { scale: 0, svgOrigin: "0 0" });

      const enter = contextSafe(() => {
        tl?.kill();
        gsap.killTweensOf(root);
        const first = !firstVisitDone;
        firstVisitDone = true;

        if (reduced) {
          gsap.set(plants(), { scale: 1, clearProps: "transform" });
          gsap.set([card, caption], { autoAlpha: 1, y: 0 });
          gsap.to(root, { autoAlpha: 1, duration: 0.15, overwrite: true });
          onTortoise("peek");
          if (first) onSeeds();
        } else {
          const k = first ? 1 : REPLAY;
          gsap.set(root, { autoAlpha: 1 });
          gsap.set(card, { autoAlpha: 0, y: 24 });
          gsap.set(caption, { autoAlpha: 0 });
          gsap.set(plants(), { scale: 0, svgOrigin: "0 0" });

          tl = gsap.timeline();
          tl.to(card, { autoAlpha: 1, y: 0, duration: 0.7 * k, ease: "power2.out" }, 0)
            .to(caption, { autoAlpha: 1, duration: 0.6 * k }, 0)
            .call(() => onTortoise("peek"), undefined, 0.4 * k)
            .to(plants(), { scale: 1, duration: 0.6 * k, ease: "back.out(1.4)", stagger: PLANT_STAGGER, svgOrigin: "0 0" }, 0.4 * k);
          if (first) tl.call(onSeeds, undefined, 0.8);
        }

        if (arrivedByKeyboard()) title?.focus({ preventScroll: true });
      });

      const exit = contextSafe(() => {
        tl?.kill();
        onTortoise(null);
        useWalkStore.getState().setActiveSkill(null);
        gsap.to(root, {
          autoAlpha: 0,
          y: reduced ? 0 : -24,
          duration: reduced ? 0.15 : 0.35,
          ease: "power2.in",
          overwrite: true,
        });
      });

      const unregister = register("skills", { enter, exit });
      return () => {
        unregister();
        tl?.kill();
        onTortoise(null);
        useWalkStore.getState().setActiveSkill(null);
      };
    },
    { scope: rootRef, dependencies: [] },
  );

  // Tooltip placement: measured once per change (never per frame). Above the plant, flipped below
  // near the top edge, clamped to the viewport. On narrow screens CSS pins it to the bottom.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const tip = tipRef.current;
    if (!root || !tip) return;
    tip.removeAttribute("data-flip");
    if (!active || narrow) return;
    const el = document.querySelector<SVGGElement>(`[data-set="skills"] [data-skill="${CSS.escape(active.name)}"]`);
    if (!el) return;
    const plant = el.getBoundingClientRect();
    const box = root.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    const cx = plant.left + plant.width / 2;
    const left = Math.min(Math.max(cx - t.width / 2, EDGE), box.width - t.width - EDGE);
    let top = plant.top - t.height - TIP_GAP - box.top;
    if (top < EDGE) {
      top = plant.bottom + TIP_GAP - box.top;
      tip.setAttribute("data-flip", "");
    }
    tip.style.left = `${left - box.left}px`;
    tip.style.top = `${top}px`;
    tip.style.setProperty("--tip-arrow", `${Math.min(Math.max(cx - box.left - (left - box.left), 14), t.width - 14)}px`);
  }, [active, narrow]);

  // Touch: tapping anywhere that isn't a plant (or the tooltip) dismisses the tooltip.
  useEffect(() => {
    if (!activeName) return;
    const onDown = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-skill], .skills-tip, .skills-list")) return;
      useWalkStore.getState().setActiveSkill(null);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [activeName]);

  // Arrow keys move between plants while focus is inside the garden; they must not walk the stop away.
  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const root = rootRef.current;
    if (!root) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      useWalkStore.getState().setActiveSkill(null);
      root.querySelector<HTMLElement>("#skills-title")?.focus({ preventScroll: true });
      return;
    }
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(".skills-list button"));
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    e.stopPropagation();
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? Math.max(i - 1, 0) : Math.min(i + 1, buttons.length - 1);
    buttons[next]?.focus({ preventScroll: true });
  };

  return (
    <div ref={rootRef} className="skills" data-stop="skills">
      <section className="skills-card paper-card" data-card aria-labelledby="skills-title">
        <div data-caption>
          <Caption>{captions.skills}</Caption>
        </div>
        <h2 id="skills-title" tabIndex={-1}>
          {skillsCopy.title}
        </h2>
        <p className="skills-intro">{skillsCopy.intro}</p>

        {/* the one accessible description of the garden; the SVG plants are aria-hidden mirrors */}
        <ul className="sr-only skills-list" aria-label="Skills" onKeyDown={onListKey}>
          {BEDS.filter((b) => beds[b.id].length > 0).map((b) => (
            <li key={b.id}>
              <h3>{b.label}</h3>
              <ul>
                {beds[b.id].map((s) => (
                  <li key={s.name}>
                    <button
                      type="button"
                      onFocus={() => useWalkStore.getState().setActiveSkill({ name: s.name, group: s.group })}
                      onBlur={() => useWalkStore.getState().setActiveSkill(null)}
                    >
                      {s.name} — {levelWord(s)}
                      {s.note ? `. ${s.note}` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <div ref={tipRef} className="skills-tip paper-card" data-visible={active ? "" : undefined} aria-hidden="true">
        {active && (
          <>
            <strong>{active.name}</strong> — {active.note ?? levelWord(active)}
          </>
        )}
      </div>
    </div>
  );
}
