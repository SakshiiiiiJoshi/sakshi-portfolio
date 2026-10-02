"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/a11y/reducedMotion";
import { useMedia } from "@/lib/useMedia";
import { arrivedByKeyboard, register } from "@/lib/walk/timeline";
import { about } from "@/content/site";
import { captions } from "@/content/captions";
import type { TortoiseState } from "@/components/tortoise/poses";
import { Bubble } from "./shared/Bubble";
import { Caption } from "./shared/Caption";
import { Tag } from "./shared/Tag";
import { SHEET_MQ, SheetBar } from "./shared/Sheet";

const NARROW = "(max-width: 639px)";
const WORD_STAGGER = 0.025;
/** Re-entry plays at this fraction of the first-visit durations. */
const REPLAY = 0.6;

// The first arrival (leaf + toast + word-by-word reveal) happens once per page load.
let firstVisitDone = false;

const WORDS = about.bio.split(/\s+/);

const ICON_PATHS: Record<(typeof about.values)[number]["icon"], string> = {
  // diamond facet
  craft: "M12 3 L20 10 L12 21 L4 10 Z M4 10 H20 M9 10 L12 3 L15 10 M9 10 L12 21 L15 10",
  // sun-ish clear circle with a line
  clarity: "M12 4 a8 8 0 1 0 0.01 0 Z M7 12 H17",
  // heart
  care: "M12 20 C4 14 3 9 6 6.5 C8.5 4.5 11 6 12 8 C13 6 15.5 4.5 18 6.5 C21 9 20 14 12 20 Z",
};

function ValueIcon({ icon }: { icon: keyof typeof ICON_PATHS }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICON_PATHS[icon]} />
    </svg>
  );
}

export function StopAbout({
  onTortoise,
  onLeaf,
}: {
  /** Pose the About stop wants the tortoise in (null = let the walk engine decide). */
  onTortoise: (pose: TortoiseState | null) => void;
  /** Called once, the first time About is reached: the leaf goes into the satchel. */
  onLeaf: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const narrow = useMedia(NARROW);

  // The card only captures wheel/touch when it actually overflows (see Observer `ignore` in useWalk).
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const update = () => {
      if (card.scrollHeight > card.clientHeight + 1) card.setAttribute("data-scroll-region", "");
      else if (!window.matchMedia(SHEET_MQ).matches) card.removeAttribute("data-scroll-region"); // sheets stay a scroll region
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(card);
    return () => ro.disconnect();
  }, [narrow]);

  useGSAP(
    (_ctx, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;
      const q = <T extends Element>(sel: string) => gsap.utils.toArray<T>(sel, root);
      const card = root.querySelector<HTMLElement>("[data-card]");
      const caption = root.querySelector<HTMLElement>("[data-caption]");
      const bubble = root.querySelector<HTMLElement>("[data-bubble]");
      const title = root.querySelector<HTMLElement>("#about-title");
      const toast = root.querySelector<HTMLElement>("[data-toast]");
      const words = q("[data-word]");
      const chips = q("[data-fact]");
      const values = q("[data-value]");
      const reduced = prefersReducedMotion();

      let tl: gsap.core.Timeline | null = null;

      gsap.set(root, { autoAlpha: 0 });
      gsap.set(toast, { autoAlpha: 0 });

      const showAll = () => {
        gsap.set([card, caption, bubble, ...words, ...chips, ...values], { autoAlpha: 1, y: 0, scale: 1, clearProps: "transform" });
      };

      const enter = contextSafe(() => {
        tl?.kill();
        gsap.killTweensOf(root);
        const first = !firstVisitDone;
        firstVisitDone = true;

        if (reduced) {
          showAll();
          gsap.to(root, { autoAlpha: 1, y: 0, duration: 0.15, overwrite: true });
          onTortoise("peek");
          if (first) {
            onLeaf();
            gsap.timeline().to(toast, { autoAlpha: 1, duration: 0.15 }).to(toast, { autoAlpha: 0, duration: 0.15 }, 2);
          }
        } else {
          const k = first ? 1 : REPLAY;
          gsap.set(root, { autoAlpha: 1, y: 0 });
          gsap.set(card, { autoAlpha: 0, y: 24 });
          gsap.set(caption, { autoAlpha: 0 });
          gsap.set(bubble, { autoAlpha: 0, scale: 0.9, transformOrigin: window.matchMedia(NARROW).matches ? "50% 0%" : "0% 50%" });
          gsap.set(words, { autoAlpha: first ? 0 : 1 });
          gsap.set(chips, { autoAlpha: 0, y: 10 });
          gsap.set(values, { autoAlpha: 0, y: 14 });

          tl = gsap.timeline();
          tl.to(card, { autoAlpha: 1, y: 0, duration: 0.7 * k, ease: "power2.out" }, 0)
            .to(caption, { autoAlpha: 1, duration: 0.6 * k }, 0)
            .call(() => onTortoise("peek"), undefined, 0.5 * k)
            .to(bubble, { autoAlpha: 1, scale: 1, duration: 0.3 * k, ease: "back.out(1.6)" }, 0.7 * k);
          if (first) {
            tl.to(words, { autoAlpha: 1, duration: 0.12, ease: "none", stagger: WORD_STAGGER }, 1 * k);
            tl.call(onLeaf, undefined, 1 * k);
            tl.fromTo(
              toast,
              { autoAlpha: 0, y: 6 },
              { autoAlpha: 1, y: -18, duration: 0.4, ease: "power2.out" },
              1.2,
            ).to(toast, { autoAlpha: 0, y: -34, duration: 0.5, ease: "power1.in" }, 2.6);
          }
          const wordsEnd = first ? 1 + words.length * WORD_STAGGER : 1 * k;
          tl.to(chips, { autoAlpha: 1, y: 0, duration: 0.35 * k, stagger: 0.06 * k, ease: "power2.out" }, wordsEnd)
            .to(values, { autoAlpha: 1, y: 0, duration: 0.4 * k, stagger: 0.08, ease: "power2.out" }, ">-0.1");
        }

        if (arrivedByKeyboard()) title?.focus({ preventScroll: true });
      });

      const exit = contextSafe(() => {
        tl?.kill();
        onTortoise(null);
        gsap.to(root, {
          autoAlpha: 0,
          y: reduced ? 0 : -24,
          duration: reduced ? 0.15 : 0.35,
          ease: "power2.in",
          overwrite: true,
        });
      });

      const unregister = register("about", { enter, exit });
      return () => {
        unregister();
        tl?.kill();
        onTortoise(null);
      };
    },
    { scope: rootRef, dependencies: [] },
  );

  return (
    <div ref={rootRef} className="about" data-stop="about">
      <section ref={cardRef} className="about-card paper-card sheet" data-card aria-labelledby="about-title">
        <SheetBar id="about" title={about.title} />
        <div data-caption>
          <Caption>{captions.about}</Caption>
        </div>
        <h2 id="about-title" tabIndex={-1}>
          {about.title}
        </h2>

        <div className="about-bubble" data-bubble>
          <Bubble tail={narrow ? "down" : "left"}>
            {/* read once by assistive tech; the animated copy below is hidden from it */}
            <p className="sr-only">{about.bio}</p>
            <p className="about-bio" aria-hidden="true">
              {WORDS.map((w, i) => (
                <span key={i}>
                  {i > 0 && " "}
                  <span data-word>{w}</span>
                </span>
              ))}
            </p>
          </Bubble>
        </div>

        <ul className="about-facts" aria-label="Quick facts">
          {about.facts.map((f) => (
            <li key={f} data-fact>
              <Tag>{f}</Tag>
            </li>
          ))}
        </ul>

        <p className="hand about-care">{about.careAbout}</p>
        <ul className="about-values">
          {about.values.map((v) => (
            <li key={v.title} data-value>
              <ValueIcon icon={v.icon} />
              <strong>{v.title}</strong>
              <span>{v.caption}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="about-toast hand" data-toast aria-hidden="true">
        {about.toast}
      </div>
    </div>
  );
}
