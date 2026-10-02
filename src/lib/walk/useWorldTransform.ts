"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { applySky } from "./timeOfDay";
import { bindPerfToRoot, createFpsMonitor } from "@/lib/perf/tier";
import { getPathPoint } from "./path";
import { useWalkStore } from "./store";
import { bankBlend, camProgress, hopTarget, ride } from "./stones";
import { DESIGN_H, DESIGN_W, MAX_SCALE, TORTOISE_W, WORLD_W, anchorFraction } from "./constants";

// Foot point of the tortoise art (shadow ellipse centre) as fractions of its 400x300 viewBox.
const FOOT_X = 195 / 400;
const FOOT_Y = 262 / 300;
const TORTOISE_H = (TORTOISE_W * 3) / 4;

const WILL_CHANGE_OFF_MS = 1500;
const IDLE_MS = 250;
const MOVE_EPS = 1e-5;

export interface FrameSample {
  p: number;
  x: number;
  y: number;
  angle: number;
  fps: number;
}

/** Live camera signal for non-React consumers (audio footsteps). `vel` is progress units / second. */
export const liveMotion = { p: 0, vel: 0, moving: false };

export interface MotionState {
  moving: boolean;
  facing: 1 | -1;
  speed: number;
}

interface LayerEl {
  el: HTMLElement;
  speed: number;
  wrap: number;
}

/**
 * Builds the imperative camera. `applyProgress(p)` is the single place that moves things: it sets
 * each layer's translateX = -p * WORLD_W * speed (wrapping where asked), writes the sky variables,
 * places sun/moon, and positions + tilts the tortoise on the path. No React state is involved.
 */
export function createWorldTransform(root: HTMLElement, tortoise: HTMLElement) {
  const layers: LayerEl[] = Array.from(root.querySelectorAll<HTMLElement>("[data-layer]")).map((el) => ({
    el,
    speed: Number(el.dataset.speed),
    wrap: Number(el.dataset.wrap) || 0,
  }));
  const hopEl = tortoise.querySelector<HTMLElement>("[data-tortoise-hop]");
  const sun = root.querySelector<HTMLElement>("[data-sun]");
  const moon = root.querySelector<HTMLElement>("[data-moon]");

  let s = 1;
  let vw = DESIGN_W;
  let vh = DESIGN_H;
  let anchorX = DESIGN_W * 0.35;
  let angleSmooth = 0;
  const sample: FrameSample = { p: 0, x: 0, y: 0, angle: 0, fps: 0 };

  function measure() {
    const rect = root.getBoundingClientRect();
    vw = rect.width;
    vh = rect.height;
    s = Math.min(vh / DESIGN_H, MAX_SCALE);
    anchorX = (anchorFraction(vw, vh) * vw) / s;
    root.style.setProperty("--s", String(s));
    root.style.setProperty("--anchor-x", String(anchorX));
    tortoise.style.width = `${TORTOISE_W * s}px`;
    tortoise.style.height = `${TORTOISE_H * s}px`;
  }

  function applyProgress(p: number, dt = 1 / 60): FrameSample {
    const cp = camProgress(p); // held at the stream while the tortoise hops stone to stone
    const world = cp * WORLD_W;
    for (const l of layers) {
      let off = world * l.speed;
      if (l.wrap) off %= l.wrap;
      l.el.style.transform = `translate3d(${(-off * s).toFixed(2)}px,0,0)`;
    }

    const sm = applySky(root, p);
    if (sun) {
      const d = 140 * s * sm.sunScale;
      sun.style.width = sun.style.height = `${d}px`;
      sun.style.opacity = String(sm.sunOpacity);
      sun.style.transform = `translate3d(${sm.sunX * vw - d / 2}px,${sm.sunY * vh - d / 2}px,0)`;
    }
    if (moon) {
      const d = 110 * s;
      moon.style.width = moon.style.height = `${d}px`;
      moon.style.opacity = String(sm.moonOpacity);
      moon.style.transform = `translate3d(${sm.moonX * vw - d / 2}px,${sm.moonY * vh - d / 2}px,0)`;
    }

    const pt = getPathPoint(cp, anchorX);
    // Low-pass the tilt so it never snaps on steep sections or fast scrubbing.
    angleSmooth += (pt.angle - angleSmooth) * (1 - Math.exp(-dt * 14));
    const tx = (anchorX - FOOT_X * TORTOISE_W) * s;
    const ty = (pt.y - FOOT_Y * TORTOISE_H) * s; // relative to the stage (design y 0 at its top)
    tortoise.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) rotate(${angleSmooth.toFixed(2)}deg)`;

    if (hopEl) {
      if (!ride.active) {
        const st = useWalkStore.getState();
        const t = hopTarget(st.stoneIndex, st.stoneCount);
        const k = st.stoneIndex > st.stoneCount ? bankBlend(p) : 1;
        ride.x = t.x * k;
        ride.y = t.y * k;
        ride.lift = 0;
      }
      hopEl.style.transform = ride.x || ride.y || ride.lift ? `translate3d(${(ride.x * s).toFixed(2)}px,${((ride.y - ride.lift) * s).toFixed(2)}px,0)` : "";
    }

    sample.p = p;
    sample.x = pt.x;
    sample.y = pt.y;
    sample.angle = angleSmooth;
    return sample;
  }

  function setWillChange(on: boolean) {
    // will-change: transform now stays on permanently via CSS; turning it off made scroll start re-raster layers.
    void on;
  }

  return { measure, applyProgress, setWillChange };
}

export interface UseWorldTransformArgs {
  rootRef: RefObject<HTMLElement | null>;
  tortoiseRef: RefObject<HTMLElement | null>;
  progressRef: RefObject<number>;
  onMotion: (m: MotionState) => void;
  onFrame?: (s: FrameSample) => void;
}

/** Registers applyProgress on the GSAP ticker. React hears only about low-frequency motion changes. */
export function useWorldTransform({ rootRef, tortoiseRef, progressRef, onMotion, onFrame }: UseWorldTransformArgs) {
  // Latest callbacks without re-subscribing the ticker.
  const cb = useRef({ onMotion, onFrame });
  useEffect(() => {
    cb.current = { onMotion, onFrame };
  });

  useEffect(() => {
    const root = rootRef.current;
    const tortoise = tortoiseRef.current;
    if (!root || !tortoise) return;

    const cam = createWorldTransform(root, tortoise);
    cam.measure();
    const unbindPerf = bindPerfToRoot(root);
    const fps = createFpsMonitor();

    let last = Number.NaN;
    let lastCam = Number.NaN;
    let lastMove = -Infinity;
    let willChangeOn = false;
    let facing: 1 | -1 = 1;
    let moving = false;
    let speedQ = 1;
    let vel = 0;
    const dts: number[] = [];
    let frame: FrameSample | null = null;

    const tick = (time: number, deltaTime: number) => {
      const p = Math.min(Math.max(progressRef.current ?? 0, 0), 1);
      const dtMs = Math.max(deltaTime, 1);
      const dt = dtMs / 1000;
      const dp = Number.isNaN(last) ? 0 : p - last; // direction (a backward hop still faces back)
      const camP = camProgress(p);
      const cdp = Number.isNaN(lastCam) ? 0 : camP - lastCam; // ground actually moving under the feet
      const changed = dp !== 0 || Number.isNaN(last) || ride.active;
      const now = time * 1000;

      if (Math.abs(cdp) > MOVE_EPS) {
        lastMove = now;
        if (!willChangeOn) {
          cam.setWillChange(true);
          willChangeOn = true;
        }
      } else if (willChangeOn && now - lastMove > WILL_CHANGE_OFF_MS) {
        cam.setWillChange(false);
        willChangeOn = false;
      }

      fps.sample(dtMs);
      vel += (Math.abs(cdp) / dt - vel) * 0.2;
      const nowMoving = now - lastMove < IDLE_MS;
      liveMotion.p = p;
      liveMotion.vel = vel;
      liveMotion.moving = nowMoving;
      const nextFacing: 1 | -1 = dp < -MOVE_EPS ? -1 : dp > MOVE_EPS ? 1 : facing;
      // 0.6-1.8x leg speed from velocity (0.9 progress/s is the engine cap), quantised to 0.2 steps.
      // steep sections (the climb) slow the legs by 15%.
      const steep = frame && Math.abs(frame.angle) > 6 ? 0.85 : 1;
      const nextSpeed = Math.round(Math.min(Math.max(0.6 + (vel / 0.9) * 1.2, 0.6), 1.8) * steep * 5) / 5;
      if (nowMoving !== moving || nextFacing !== facing || (nowMoving && nextSpeed !== speedQ)) {
        moving = nowMoving;
        facing = nextFacing;
        speedQ = nextSpeed;
        cb.current.onMotion({ moving, facing, speed: speedQ });
      }

      // The tortoise tilt is smoothed over time, so keep applying briefly after motion stops.
      if (changed || now - lastMove < 400) frame = cam.applyProgress(p, dt);
      last = p;
      lastCam = camP;

      if (cb.current.onFrame) {
        dts.push(dtMs);
        if (dts.length > 30) dts.shift();
        const avg = dts.reduce((a, b) => a + b, 0) / dts.length;
        if (frame) cb.current.onFrame({ ...frame, fps: 1000 / avg });
      }
    };

    gsap.ticker.add(tick);
    // Coalesce ResizeObserver + visualViewport + orientation events into one measure per frame,
    // debounced, so the iOS URL-bar collapse doesn't make the stage jump or thrash layout.
    let rafId = 0;
    let timer = 0;
    let lastW = -1;
    let lastH = -1;
    const remeasure = () => {
      rafId = 0;
      const r = root.getBoundingClientRect();
      if (Math.abs(r.width - lastW) < 1 && Math.abs(r.height - lastH) < 1) return;
      lastW = r.width;
      lastH = r.height;
      cam.measure();
      last = Number.NaN; // force a re-apply at the new scale
      lastCam = Number.NaN;
    };
    const scheduleMeasure = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!rafId) rafId = requestAnimationFrame(remeasure);
      }, 80);
    };
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(root);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure, { passive: true });

    const onVisibility = () => {
      if (document.hidden) root.setAttribute("data-paused", "");
      else root.removeAttribute("data-paused");
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      vv?.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      window.clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      unbindPerf();
      liveMotion.vel = 0;
      liveMotion.moving = false;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rootRef, tortoiseRef, progressRef]);
}
