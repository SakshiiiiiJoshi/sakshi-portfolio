"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { DESIGN_H, DESIGN_W, LAYER_SPEED, PATH_W, STOPS, WORLD_W } from "@/lib/walk/constants";
import { HelloSet } from "./sets/HelloSet";
import { AboutSet } from "./sets/AboutSet";
import { SkillsSet } from "./sets/SkillsSet";
import { ProjectsSet } from "./sets/ProjectsSet";
import { ExperienceSet } from "./sets/ExperienceSet";
import { FunSet } from "./sets/FunSet";
import { ContactSet } from "./sets/ContactSet";

const SETS = {
  hello: HelloSet,
  about: AboutSet,
  skills: SkillsSet,
  projects: ProjectsSet,
  experience: ExperienceSet,
  fun: FunSet,
  contact: ContactSet,
} as const;

/**
 * Mount points for the per-stop set pieces (P06-P12). Same speed as the path (1.0), so a wrapper
 * sits exactly where the tortoise stands when it settles on that stop: left = stop.progress *
 * WORLD_W + --anchor-x (the tortoise's screen x in design units, written by useWorldTransform).
 * Wrappers are bottom-anchored 900-unit-tall boxes; set pieces position themselves inside.
 */
const CULL_IN = 1.5; // viewports either side of the camera that stay live
const CULL_OUT = 2; // hysteresis: a set only goes dormant past this, so it never flickers at the edge
const CULL_EVERY_MS = 120;

/**
 * Culling: sets farther than ±1.5 viewports from the camera get `data-culled` (visibility hidden,
 * content-visibility hidden, animations paused; see globals.css). The DOM stays alive on purpose: the
 * stops query it (stones, plants) and re-creating hundreds of SVG nodes mid-walk would hitch. Runs on
 * the GSAP ticker at ~8 Hz and only touches an attribute when a set flips; no React state.
 */
function useCulling(progressRef: RefObject<number>, rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const world = root.closest<HTMLElement>(".world");
    const wraps = Array.from(root.querySelectorAll<HTMLElement>("[data-set]"));
    let last = -Infinity;
    const tick = (time: number) => {
      const now = time * 1000;
      if (now - last < CULL_EVERY_MS) return;
      last = now;
      const s = Number.parseFloat(world?.style.getPropertyValue("--s") ?? "") || 1;
      const viewport = Math.max(window.innerWidth / s, DESIGN_W);
      const camera = (progressRef.current ?? 0) * WORLD_W;
      for (const el of wraps) {
        const stop = STOPS.find((st) => st.id === el.dataset.set);
        if (!stop) continue;
        const d = Math.abs(camera - stop.progress * WORLD_W) / viewport;
        const culled = el.hasAttribute("data-culled");
        if (culled && d <= CULL_IN) el.removeAttribute("data-culled");
        else if (!culled && d > CULL_OUT) el.setAttribute("data-culled", "");
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [progressRef, rootRef]);
}

export function SetsLayer({ progressRef }: { progressRef: RefObject<number> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useCulling(progressRef, rootRef);
  return (
    <div
      ref={rootRef}
      className="world-layer"
      data-layer="sets"
      data-speed={LAYER_SPEED.path}
      style={{ bottom: 0, width: `calc(var(--s) * ${PATH_W}px)`, height: `calc(var(--s) * ${DESIGN_H}px)`, pointerEvents: "none" }}
    >
      {STOPS.map((stop) => {
        const Set = SETS[stop.id];
        return (
          <div
            key={stop.id}
            data-set={stop.id}
            style={{ position: "absolute", bottom: 0, height: "100%", left: `calc(var(--s) * (${Math.round(stop.progress * WORLD_W)}px + var(--anchor-x) * 1px))` }}
          >
            <Set />
          </div>
        );
      })}
    </div>
  );
}
