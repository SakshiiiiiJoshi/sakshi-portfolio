"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { gsap, Observer } from "@/lib/gsap";
import { isTypingTarget } from "@/lib/easter";
import { useWalkStore } from "./store";
import {
  FINE_STEP, FLICK_VELOCITY, GOTO_MAX, GOTO_MIN, HIDE_MS, MAX_EVENT_DELTA, MAX_VELOCITY, MOMENTUM_MS,
  RESIST, SETTLE_ENTER, SETTLE_LEAVE, SETTLE_MS, SETTLE_VELOCITY, SMOOTH_TAU, SNAP_DELAY, SNAP_DURATION,
  SNAP_WINDOW, STOPS, TOUCH_K, WHEEL_K, nearestStop, stopById, type StopId,
} from "./constants";
import { STONE_SEG, inSegment, stoneCenter, stoneCount, stoneIndexAt } from "./stones";
import { TRAIL, inTrail, roleCenter, roleIndexAt } from "./trail";

export interface UseWalkArgs {
  stageRef: RefObject<HTMLElement | null>;
  /** Written every tick with the smoothed progress; the world reads it on the same ticker. */
  progressRef: RefObject<number>;
  /** Optional <pre> that receives a ~10 Hz text readout (no React state). */
  debugRef?: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
  /** Discrete: true for HIDE_MS after a very fast flick. */
  onFlick?: (hiding: boolean) => void;
}

export interface WalkControls {
  goTo(target: StopId | number, opts?: { duration?: number }): void;
  next(): void;
  prev(): void;
  nudge(delta: number): void;
  /** Stepping Stones: glide to stone i (0..N; N is the "More" stone). */
  goToStone(i: number): void;
  /** Experience Trail: glide to signpost i (0 = oldest). */
  goToRole(i: number): void;
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

/** Last stop passed, unless one is within SNAP_WINDOW (then that one). */
function activeStopAt(p: number): StopId {
  if (inSegment(p)) return "projects";
  if (inTrail(p)) return "experience";
  const { stop, dist } = nearestStop(p);
  if (dist <= SNAP_WINDOW) return stop.id;
  let last: StopId = STOPS[0].id;
  for (const s of STOPS) if (s.progress <= p) last = s.id;
  return last;
}

/**
 * The walk engine. Input -> `target` -> exponentially smoothed `progress`. Per-frame values live in
 * refs; only discrete changes (activeStop, settledStop, direction, hasInteracted) reach the store.
 */
export function useWalk({ stageRef, progressRef, debugRef, reducedMotion, onFlick }: UseWalkArgs): WalkControls {
  const api = useRef<WalkControls | null>(null);
  const cb = useRef({ onFlick });
  useEffect(() => {
    cb.current = { onFlick };
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const store = useWalkStore;

    const tgt = { v: progressRef.current ?? 0 }; // where input wants to go (tweened by glides)
    let dest = tgt.v; // final destination of the current glide / input; base for next()/prev()
    let prog = tgt.v;
    let vel = 0;
    let glide: gsap.core.Tween | null = null;
    let momentum: gsap.core.Tween | null = null;
    let snapTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let hiding = false;
    let settleSince = 0;
    let bootingDeepLink = false;
    let lastDebug = 0;
    const dts: number[] = [];

    const interacted = () => {
      if (!store.getState().hasInteracted) store.getState().setHasInteracted(true);
    };

    const killMotion = () => {
      glide?.kill();
      momentum?.kill();
      glide = momentum = null;
    };

    const scheduleSnap = () => {
      clearTimeout(snapTimer);
      if (reducedMotion) return;
      snapTimer = setTimeout(() => {
        if (inSegment(tgt.v)) {
          // inside the stream: settle on the nearest stone, not the stop
          const n = store.getState().stoneCount;
          const c = ((tgt.v - STONE_SEG.start) / (STONE_SEG.end - STONE_SEG.start)) * stoneCount(n);
          const to = stoneCenter(Math.floor(c), n);
          if (Math.abs(to - tgt.v) > 0.0005) glideTo(to, SNAP_DURATION, "power2.out");
          return;
        }
        if (inTrail(tgt.v)) {
          const m = store.getState().roleCount;
          const c = Math.floor(((tgt.v - TRAIL.start) / (TRAIL.end - TRAIL.start)) * m);
          const to = roleCenter(c, m);
          if (Math.abs(to - tgt.v) > 0.0005) glideTo(to, SNAP_DURATION, "power2.out");
          return;
        }
        const { stop, dist } = nearestStop(tgt.v);
        if (dist < SNAP_WINDOW && dist > 0.0005) glideTo(stop.progress, SNAP_DURATION, "power2.out");
      }, SNAP_DELAY);
    };

    function glideTo(to: number, duration: number, ease: string, onDone?: () => void) {
      killMotion();
      interacted();
      clearTimeout(snapTimer);
      dest = clamp01(to);
      if (reducedMotion || duration <= 0) {
        tgt.v = dest;
        prog = dest;
        onDone?.();
        return;
      }
      glide = gsap.to(tgt, {
        v: dest,
        duration,
        ease,
        onComplete: () => {
          glide = null;
          onDone?.();
        },
      });
    }

    /** Wheel / touch input: add to the target with resistance near stops and a per-event cap. */
    function addDelta(raw: number, fromMomentum = false) {
      if (!fromMomentum) killMotion(); // fresh input interrupts any glide or leftover momentum
      interacted();
      let d = raw;
      if (nearestStop(tgt.v).dist < SNAP_WINDOW) d *= RESIST;
      d = clamp(d, -MAX_EVENT_DELTA, MAX_EVENT_DELTA);
      tgt.v = clamp01(tgt.v + d);
      dest = tgt.v;
      if (reducedMotion) prog = tgt.v;
      scheduleSnap();
    }

    /** Stop-to-stop waypoints: the projects stop expands into one waypoint per stone. */
    const waypoints = (): { id?: StopId; progress: number }[] => {
      const n = store.getState().stoneCount;
      const m = store.getState().roleCount;
      return STOPS.flatMap<{ id?: StopId; progress: number }>((st) =>
        st.id === "projects"
          ? Array.from({ length: stoneCount(n) }, (_, i) => ({ id: i === 0 ? st.id : undefined, progress: stoneCenter(i, n) }))
          : st.id === "experience" && m > 0
            ? Array.from({ length: m }, (_, i) => ({ id: i === 0 ? st.id : undefined, progress: roleCenter(i, m) }))
            : [{ id: st.id, progress: st.progress }],
      );
    };

    const durationFor = (dist: number) => clamp(1 + dist * 5, GOTO_MIN, GOTO_MAX);

    const controls: WalkControls = {
      goTo(target, opts) {
        const stop = typeof target === "string" ? stopById(target) : undefined;
        const roles = store.getState().roleCount;
        const stopTo =
          stop?.id === "projects"
            ? stoneCenter(0, store.getState().stoneCount)
            : stop?.id === "experience" && roles > 0
              ? roleCenter(0, roles)
              : stop?.progress;
        const to = clamp01(typeof target === "string" ? (stopTo ?? dest) : target);
        glideTo(to, opts?.duration ?? durationFor(Math.abs(to - tgt.v)), "power3.inOut");
      },
      next() {
        const w = waypoints().find((st) => st.progress > dest + 0.002);
        if (w) controls.goTo(w.progress);
      },
      prev() {
        const w = waypoints().reverse().find((st) => st.progress < dest - 0.002);
        if (w) controls.goTo(w.progress);
      },
      goToStone(i) {
        const n = store.getState().stoneCount;
        const to = stoneCenter(i, n);
        glideTo(to, durationFor(Math.abs(to - tgt.v)) * 0.5, "power2.inOut");
      },
      goToRole(i) {
        const m = store.getState().roleCount;
        const to = roleCenter(i, m);
        glideTo(to, durationFor(Math.abs(to - tgt.v)) * 0.5, "power2.inOut");
      },
      nudge(delta) {
        glideTo(dest + delta, 0.35, "power2.out");
        scheduleSnap();
      },
    };
    api.current = controls;

    // ---- Observer: wheel + touch (mouse drag deliberately excluded) ----
    const observer = Observer.create({
      target: stage,
      type: "wheel,touch",
      ignore: "[data-scroll-region],[data-hud] button,[data-hud] [role=dialog]", // overflowing card/sheet scrolls itself
      preventDefault: true,
      tolerance: 8,
      dragMinimum: 3,
      onWheel: (self) => {
        const e = self.event as WheelEvent;
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
        const dx = e.deltaX * unit;
        const dy = e.deltaY * unit;
        addDelta((Math.abs(dy) >= Math.abs(dx) ? dy : dx) * WHEEL_K);
      },
      onDrag: (self) => {
        const dx = self.deltaX;
        const dy = self.deltaY;
        // Swiping up or left advances; dominant axis wins.
        addDelta(-(Math.abs(dy) >= Math.abs(dx) ? dy : dx) * TOUCH_K);
      },
      onDragEnd: (self) => {
        const vx = self.velocityX;
        const vy = self.velocityY;
        const v = -(Math.abs(vy) >= Math.abs(vx) ? vy : vx); // px/s
        const total = v * TOUCH_K * 0.2;
        if (reducedMotion || Math.abs(total) < 0.0005) return;
        let applied = 0;
        const m = { v: 0 };
        momentum = gsap.to(m, {
          v: total,
          duration: MOMENTUM_MS / 1000,
          ease: "power3.out",
          onUpdate: () => {
            addDelta(m.v - applied, true);
            applied = m.v;
          },
          onComplete: () => {
            momentum = null;
          },
        });
      },
    });

    // ---- keyboard ----
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      const active = document.activeElement;
      const onBody = !active || active === document.body || active === stage;
      // Focused HUD controls keep their own arrow/space/Esc behavior (1–7, Home/End still walk).
      const inHud = e.target instanceof Element && !!e.target.closest("[data-hud]");
      if (inHud && (e.key.startsWith("Arrow") || e.key.startsWith("Page") || e.key === " " || e.key === "Escape")) return;
      const go = (fn: () => void) => {
        e.preventDefault();
        fn();
      };
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          return go(() => (e.shiftKey ? controls.nudge(FINE_STEP) : controls.next()));
        case "ArrowLeft":
        case "ArrowUp":
          return go(() => (e.shiftKey ? controls.nudge(-FINE_STEP) : controls.prev()));
        case "PageDown":
          return go(controls.next);
        case "PageUp":
          return go(controls.prev);
        case " ":
          if (onBody) go(controls.next);
          return;
        case "Home":
          return go(() => controls.goTo("hello"));
        case "End":
          return go(() => controls.goTo("contact"));
        case "Escape":
          window.dispatchEvent(new CustomEvent("walk:close-card"));
          return;
        default:
          if (/^[1-7]$/.test(e.key) && !e.shiftKey) go(() => controls.goTo(STOPS[Number(e.key) - 1].id));
      }
    };
    window.addEventListener("keydown", onKey);
    const onGoStone = (e: Event) => controls.goToStone(Number((e as CustomEvent<number>).detail));
    window.addEventListener("walk:goto-stone", onGoStone);
    const onGoRole = (e: Event) => controls.goToRole(Number((e as CustomEvent<number>).detail));
    window.addEventListener("walk:goto-role", onGoRole);
    const onGoStop = (e: Event) => {
      const d = (e as CustomEvent<{ id: StopId; duration?: number }>).detail;
      if (d?.id) controls.goTo(d.id, { duration: d.duration });
    };
    window.addEventListener("walk:goto", onGoStop);

    // ---- hash sync ----
    const hashStop = () => stopById(window.location.hash.slice(1));
    const onHash = () => {
      const s = hashStop();
      if (s) controls.goTo(s.id);
    };
    window.addEventListener("hashchange", onHash);
    const initial = hashStop();
    if (initial && initial.progress > 0) {
      bootingDeepLink = true; // don't let the hello "settle" at p=0 erase the hash first
      const bootTo = initial.id === "projects" ? stoneCenter(0, store.getState().stoneCount) : initial.progress;
      glideTo(bootTo, reducedMotion ? 0 : durationFor(bootTo), "power3.inOut", () => {
        bootingDeepLink = false;
      });
    }

    // ---- the single ticker ----
    let lastHudT = -1;
    const tick = (time: number, deltaTime: number) => {
      const dtMs = Math.max(deltaTime, 1);
      const dt = Math.min(dtMs, 100) / 1000;
      const prev = prog;
      if (reducedMotion) prog = tgt.v;
      else {
        prog += (tgt.v - prog) * (1 - Math.exp(-dt / SMOOTH_TAU));
        if (Math.abs(tgt.v - prog) < 1e-5) prog = tgt.v;
      }
      progressRef.current = prog;
      // HUD day→night swap between .77 and .79; only touch the DOM while the value changes.
      const hudT = Math.round(clamp((prog - 0.77) * 50, 0, 1) * 100) / 100;
      if (hudT !== lastHudT) {
        lastHudT = hudT;
        stage.style.setProperty("--hud-t", String(hudT));
      }

      const dp = prog - prev;
      vel += (clamp(dp / dt, -MAX_VELOCITY, MAX_VELOCITY) - vel) * 0.25;
      const st = store.getState();
      const dir: 1 | -1 = dp > 1e-6 ? 1 : dp < -1e-6 ? -1 : st.direction;
      if (dir !== st.direction) st.setDirection(dir);

      const si = stoneIndexAt(prog, st.stoneCount, st.stoneIndex);
      if (si !== st.stoneIndex) st.setStoneIndex(si);

      const ri = roleIndexAt(prog, st.roleCount, st.roleIndex);
      if (ri !== st.roleIndex) st.setRoleIndex(ri);

      const a = activeStopAt(prog);
      if (a !== st.activeStop) st.setActiveStop(a);

      // settled: slow for SETTLE_MS inside SETTLE_ENTER of a stop; cleared past SETTLE_LEAVE (hysteresis)
      const { stop, dist } = nearestStop(prog);
      const now = time * 1000;
      if (st.settledStop) {
        if (st.settledStop !== stop.id || dist > SETTLE_LEAVE) {
          st.setSettledStop(null);
          settleSince = 0;
        }
      } else if (!bootingDeepLink && dist <= SETTLE_ENTER && Math.abs(vel) < SETTLE_VELOCITY) {
        if (!settleSince) settleSince = now;
        else if (now - settleSince >= SETTLE_MS) {
          st.setSettledStop(stop.id);
          st.setProgress(prog);
          st.setTarget(tgt.v);
          st.setVelocity(vel);
          const path = window.location.pathname + window.location.search;
          history.replaceState(null, "", stop.id === "hello" ? path : `${path}#${stop.id}`);
        }
      } else settleSince = 0;

      // very fast flick -> hide in shell for HIDE_MS (glides are never that fast)
      if (!hiding && !glide && Math.abs(vel) > FLICK_VELOCITY) {
        hiding = true;
        cb.current.onFlick?.(true);
        hideTimer = setTimeout(() => {
          hiding = false;
          cb.current.onFlick?.(false);
        }, HIDE_MS);
      }

      dts.push(dtMs);
      if (dts.length > 30) dts.shift();
      const el = debugRef?.current;
      if (el && now - lastDebug > 100) {
        lastDebug = now;
        const fps = 1000 / (dts.reduce((x, y) => x + y, 0) / dts.length);
        const s2 = store.getState();
        el.textContent =
          `progress ${prog.toFixed(4)}\ntarget   ${tgt.v.toFixed(4)}\nvelocity ${vel.toFixed(3)}\n` +
          `active   ${s2.activeStop}\nsettled  ${s2.settledStop ?? "-"}\nfps      ${fps.toFixed(0)}`;
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      observer.kill();
      killMotion();
      clearTimeout(snapTimer);
      clearTimeout(hideTimer);
      if (hiding) cb.current.onFlick?.(false);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("walk:goto-stone", onGoStone);
      window.removeEventListener("walk:goto-role", onGoRole);
      window.removeEventListener("walk:goto", onGoStop);
      window.removeEventListener("hashchange", onHash);
      api.current = null;
    };
  }, [stageRef, progressRef, debugRef, reducedMotion]);

  return {
    goTo: useCallback((t, o) => api.current?.goTo(t, o), []),
    next: useCallback(() => api.current?.next(), []),
    prev: useCallback(() => api.current?.prev(), []),
    nudge: useCallback((d) => api.current?.nudge(d), []),
    goToStone: useCallback((i) => api.current?.goToStone(i), []),
    goToRole: useCallback((i) => api.current?.goToRole(i), []),
  };
}
