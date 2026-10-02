"use client";

import { useRef, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/a11y/reducedMotion";
import { useMedia } from "@/lib/useMedia";
import { useWalkStore } from "@/lib/walk/store";
import { site, hello } from "@/content/site";
import { captions } from "@/content/captions";
import type { TortoiseState } from "@/components/tortoise/poses";
import { Bubble } from "./shared/Bubble";
import { Caption } from "./shared/Caption";
import { Tag } from "./shared/Tag";

/** Overlay is visible while the tortoise is within this much of the start; peek only when settled-ish. */
const VISIBLE_BELOW = 0.07;
const NEAR_BELOW = 0.012;
/** Door sits this many design units left of the tortoise (see HelloSet: 700 − 340). */
const DOOR_OFFSET = 360;

const NARROW = "(max-width: 639px)";

// The intro choreography plays once per page load.
let introPlayed = false;

const headline = `Hi, I'm ${site.displayName}.`;

function Headline() {
  return (
    <h1 id="hello-title" tabIndex={-1} aria-label={headline} className="hello-h1">
      {headline.split(" ").map((word, w) => (
        <span key={w}>
          {w > 0 && " "}
          <span className="hello-word" aria-hidden="true">
            {Array.from(word).map((ch, i) => (
              <span key={i} className="hello-letter" data-letter>
                {ch}
              </span>
            ))}
          </span>
        </span>
      ))}
    </h1>
  );
}

export function StopHello({
  progressRef,
  onTortoise,
}: {
  progressRef: RefObject<number>;
  /** Pose the Hello stop wants the tortoise in (null = let the walk engine decide). */
  onTortoise: (pose: TortoiseState | null) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const narrow = useMedia(NARROW);

  useGSAP(
    (_ctx, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;
      const world = root.closest<HTMLElement>(".world");
      const slide = world?.querySelector<HTMLElement>("[data-tortoise-slide]") ?? null;
      const letters = root.querySelectorAll("[data-letter]");
      const bubble = root.querySelector<HTMLElement>("[data-bubble]");
      const reduced = prefersReducedMotion();
      const store = useWalkStore;

      let visible = true;
      let near = true;
      let introDone = false;
      let tl: gsap.core.Timeline | null = null;

      const sync = () => {
        if (introDone) onTortoise(visible && near ? "peek" : null);
      };

      const popBubble = (scale: number) =>
        gsap.fromTo(
          bubble,
          { autoAlpha: 0, scale: 0.9, transformOrigin: "0% 100%" },
          { autoAlpha: 1, scale: 1, duration: 0.3 * scale, ease: "back.out(1.6)" },
        );

      const finish = () => {
        if (introDone) return;
        introPlayed = true;
        introDone = true;
        sync();
      };

      if (reduced || introPlayed || store.getState().hasInteracted) {
        // no choreography: everything is already visible
        introDone = true;
        sync();
      } else {
        const s = parseFloat(world ? getComputedStyle(world).getPropertyValue("--s") : "") || 1;
        gsap.set(letters, { yPercent: 70, autoAlpha: 0 });
        gsap.set(bubble, { autoAlpha: 0 });
        if (slide) gsap.set(slide, { x: -DOOR_OFFSET * s, autoAlpha: 0 });
        onTortoise("hide");

        tl = gsap.timeline({ onComplete: finish });
        // door opens (0.3 s beat), tortoise walks out for 1.4 s
        tl.call(() => onTortoise("walk"), undefined, 0.3);
        if (slide) {
          tl.to(slide, { autoAlpha: 1, duration: 0.2 }, 0.3);
          tl.to(slide, { x: 0, duration: 1.4, ease: "power1.inOut" }, 0.3);
        }
        // stops → peeks → bubble pops → headline letters rise
        tl.call(() => onTortoise("peek"), undefined, 1.7);
        tl.add(popBubble(1), 1.9);
        tl.to(letters, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out", stagger: 0.03 }, 2.2);
      }

      const exit = contextSafe(() => {
        gsap.to(root, {
          autoAlpha: 0,
          y: reduced ? 0 : -24,
          duration: reduced ? 0.15 : 0.35,
          ease: "power2.in",
          overwrite: true,
        });
      });
      const enter = contextSafe(() => {
        gsap.to(root, { autoAlpha: 1, y: 0, duration: reduced ? 0.15 : 0.42, ease: "power2.out", overwrite: true });
        if (reduced || !introDone) return;
        // faster replay (0.6× duration)
        popBubble(0.6);
        gsap.fromTo(
          letters,
          { yPercent: 70, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out", stagger: 0.018 },
        );
      });

      // Overlay visibility is driven by the ticker (progressRef is continuous; React state is not).
      const tick = () => {
        const p = progressRef.current;
        const v = p < VISIBLE_BELOW;
        const n = p < NEAR_BELOW;
        let changed = false;
        if (v !== visible) {
          visible = v;
          changed = true;
          if (v) enter();
          else exit();
        }
        if (n !== near) {
          near = n;
          changed = true;
        }
        if (changed) sync();
      };
      gsap.ticker.add(tick);

      // first real input: finish the intro instantly (no stuck states)
      const unsubscribe = store.subscribe((state, prev) => {
        if (state.hasInteracted && !prev.hasInteracted) {
          if (tl && tl.progress() < 1) tl.progress(1);
          finish();
        }
      });

      return () => {
        gsap.ticker.remove(tick);
        unsubscribe();
        tl?.kill();
        if (!introDone) onTortoise(null);
      };
    },
    { scope: rootRef, dependencies: [] },
  );

  return (
    <div ref={rootRef} className="hello" data-stop="hello">
      <section className="hello-card paper-card" aria-labelledby="hello-title">
        <Caption>{captions.hello}</Caption>
        <Headline />
        <p className="hello-sub">
          I&apos;m a {site.role} who builds {site.whatYouBuild}.
        </p>
        <p className="hand hello-tagline">{site.tagline}</p>
        <Tag>
          <span className="hello-dot" aria-hidden="true" />
          {site.availability}
        </Tag>
      </section>

      <div className="hello-bubble" data-bubble>
        <Bubble tail={narrow ? "down" : "left"}>{hello.bubble}</Bubble>
      </div>

    </div>
  );
}
