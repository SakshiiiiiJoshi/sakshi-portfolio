"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/content/site";
import { GROUP_COLOR } from "@/lib/skillsGarden";
import { useWalkStore } from "@/lib/walk/store";
import { TortoiseSvg } from "./TortoiseSvg";
import { setBackpackItems, sparkleItems } from "./Backpack";
import {
  PIVOTS, POSES, getRefs, hop, initRig, relax,
  type Pose, type TortoiseRefs, type TortoiseState,
} from "./poses";

export interface TortoiseProps {
  state: TortoiseState;
  speed?: number;
  facing: 1 | -1;
  items: number;
  onClick?: () => void;
  className?: string;
}

export interface TortoiseHandle {
  /** One-shot hop (Stepping Stones). */
  hop(opts?: { arc?: boolean; timeScale?: number }): void;
  /** One-shot front-leg wave (also under reduced motion, where looping poses are skipped). */
  waveOnce(): void;
  /** One-shot pop of every backpack item (journey complete). Skipped under reduced motion. */
  sparkle(): void;
}

const LABELS: Record<TortoiseState, string> = {
  idle: "resting",
  walk: "walking",
  peek: "peeking",
  hide: "hiding in its shell",
  wave: "waving",
  sleep: "sleeping",
};

export const Tortoise = forwardRef<TortoiseHandle, TortoiseProps>(function Tortoise(
  { state, speed = 1, facing, items, onClick, className },
  ref,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rigRef = useRef<TortoiseRefs | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const fadeRef = useRef<gsap.core.Timeline | null>(null);
  const reducedRef = useRef(false);
  const facingRef = useRef<1 | -1>(1);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useImperativeHandle(ref, () => ({
    hop(opts) {
      if (rigRef.current && !reducedRef.current) hop(rigRef.current, opts);
    },
    waveOnce() {
      const rig = rigRef.current;
      if (!rig) return;
      gsap.timeline()
        .set(rig.legs.fr, { rotation: 0, svgOrigin: PIVOTS.legFR })
        .to(rig.legs.fr, { rotation: -65, duration: 0.35, ease: "power2.out" })
        .to(rig.legs.fr, { rotation: -40, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 3 })
        .to(rig.legs.fr, { rotation: 0, duration: 0.3, ease: "power2.inOut" });
    },
    sparkle() {
      if (rigRef.current && !reducedRef.current) sparkleItems(rigRef.current);
    },
  }));

  // Mount: build the rig once; revert everything on unmount.
  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      const rig = getRefs(svg);
      rigRef.current = rig;
      initRig(rig);
      reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.set(svg, { scaleX: facing, transformOrigin: "50% 50%" });
      facingRef.current = facing;
      setBackpackItems(rig, items, false);
      return () => {
        poseRef.current?.kill();
        fadeRef.current?.kill();
        rigRef.current = null;
      };
    },
    { scope: svgRef },
  );

  // State changes: kill the old pose, relax to rest (~200 ms), start the new pose.
  useGSAP(
    () => {
      const rig = rigRef.current;
      if (!rig) return;
      poseRef.current?.kill();
      fadeRef.current?.kill();
      poseRef.current = null;
      if (reducedRef.current) {
        relax(rig, 0);
        return;
      }
      fadeRef.current = relax(rig, 0.2, () => {
        const pose = POSES[state](rig);
        pose.setSpeed?.(speedRef.current);
        poseRef.current = pose;
      });
    },
    { scope: svgRef, dependencies: [state] },
  );

  useGSAP(
    () => {
      poseRef.current?.setSpeed?.(speed);
    },
    { dependencies: [speed] },
  );

  useGSAP(
    () => {
      const rig = rigRef.current;
      if (rig) setBackpackItems(rig, items, !reducedRef.current);
    },
    { dependencies: [items] },
  );

  // Skills Garden polish: shell cells take the colour of the hovered plant's group (CSS-transitioned
  // fill, set straight on the DOM so there is no React work).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const cells = svg.querySelectorAll<SVGPathElement>("#shell-pattern g > path:nth-of-type(2)");
    return useWalkStore.subscribe((s, prev) => {
      if (s.hoverGroup === prev.hoverGroup) return;
      cells.forEach((c) => {
        c.style.fill = s.hoverGroup ? `color-mix(in srgb, ${GROUP_COLOR[s.hoverGroup]} 75%, var(--honey))` : "";
      });
    });
  }, []);

  // Facing: head swings first (100 ms), body flips (~150 ms), head settles.
  useGSAP(
    () => {
      const rig = rigRef.current;
      if (!rig || facing === facingRef.current) return;
      facingRef.current = facing;
      if (reducedRef.current) {
        gsap.set(rig.svg, { scaleX: facing });
        return;
      }
      gsap.timeline()
        .to(rig.head, { rotation: -14, svgOrigin: PIVOTS.head, duration: 0.1, ease: "power1.out" })
        .to(rig.svg, { scaleX: facing, duration: 0.15, ease: "power2.inOut", overwrite: "auto" })
        .to(rig.head, { rotation: 0, duration: 0.15, ease: "sine.out" });
    },
    { dependencies: [facing] },
  );

  return (
    <TortoiseSvg
      ref={svgRef}
      role="img"
      aria-label={`${site.tortoiseName} the tortoise ${LABELS[state]}`}
      className={className}
      onClick={onClick}
      style={{ overflow: "visible", cursor: onClick ? "pointer" : undefined, pointerEvents: onClick ? "auto" : undefined }}
    />
  );
});
