"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/a11y/reducedMotion";
import { isTypingTarget } from "@/lib/easter";
import { useMedia } from "@/lib/useMedia";
import { rng } from "@/lib/walk/art";
import { arrivedByKeyboard, register } from "@/lib/walk/timeline";
import { funCopy, funFacts } from "@/content/fun";
import { captions } from "@/content/captions";
import type { TortoiseState } from "@/components/tortoise/poses";
import { Caption } from "./shared/Caption";
import { SheetBar } from "./shared/Sheet";

const NARROW = "(max-width: 639px)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const PIN_MS = 700;
const FIRST_PIN_MS = 650;
const MAX_NOTES = 8;
const SWIPE_PX = 40;
const ANNOUNCE_MS = 250;
/** Re-entry plays at this fraction of the first-visit durations. */
const REPLAY = 0.6;
/** The tortoise sits a little nearer the fire than its walking anchor. */
const SIT_X = 36;

// The marshmallow stick goes into the satchel once per page load.
let stickGiven = false;

interface View {
  /** Reveal ticks so far: 1..n pin that many notes, n+1 shows the marshmallow joke. */
  ticks: number;
  /** Note brought to the front. */
  front: number;
}

function Pin() {
  return (
    <svg className="fun-pin" viewBox="0 0 18 38" aria-hidden="true">
      <rect x="3" y="0" width="12" height="34" rx="4" fill="#C79A63" stroke="var(--forest)" strokeWidth="2" />
      <path d="M9 14 V34" stroke="var(--forest)" strokeWidth="2" />
      <circle cx="9" cy="8" r="2" fill="var(--forest)" />
    </svg>
  );
}

export function StopFun({
  onTortoise,
  onStick,
}: {
  /** Pose the Fun stop wants the tortoise in (null = let the walk engine decide). */
  onTortoise: (pose: TortoiseState | null) => void;
  /** Called once, the first time the fire is reached: the marshmallow stick goes into the satchel. */
  onStick: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const narrow = useMedia(NARROW);
  const reduced = useMedia(REDUCED);
  const facts = funFacts.slice(0, MAX_NOTES);
  const n = facts.length;
  const flat = reduced && !narrow;

  const [active, setActive] = useState(false);
  const [view, setViewState] = useState<View>({ ticks: 0, front: 0 });
  const viewRef = useRef<View>(view);
  const setView = (next: View) => {
    viewRef.current = next;
    setViewState(next);
  };
  const swipeX = useRef<number | null>(null);

  const vis = Math.min(view.ticks, n);
  const joke = view.ticks > n;

  /** Move the front note. Returns false when there is nowhere to go (the input should leave the stop). */
  const stepNote = (dir: 1 | -1): boolean => {
    const v = viewRef.current;
    const shown = Math.min(v.ticks, n);
    if (dir === 1) {
      if (v.front < shown - 1) setView({ ...v, front: v.front + 1 });
      else if (v.ticks < n) setView({ ticks: v.ticks + 1, front: v.ticks });
      else return false;
      return true;
    }
    if (v.front > 0) {
      setView({ ...v, front: v.front - 1 });
      return true;
    }
    return false;
  };
  const stepRef = useRef(stepNote);
  useEffect(() => {
    stepRef.current = stepNote;
  });

  useGSAP(
    (_ctx, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;
      const card = root.querySelector<HTMLElement>("[data-card]");
      const caption = root.querySelector<HTMLElement>("[data-caption]");
      const title = root.querySelector<HTMLElement>("#fun-title");
      const slide = () => document.querySelector<HTMLElement>("[data-tortoise-slide]");
      const isReduced = prefersReducedMotion();

      let tl: gsap.core.Timeline | null = null;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const stopTimer = () => clearTimeout(timer);

      gsap.set(root, { autoAlpha: 0 });

      const enter = contextSafe(() => {
        tl?.kill();
        stopTimer();
        gsap.killTweensOf(root);
        const first = !stickGiven;
        const k = first ? 1 : REPLAY;
        setActive(true);

        if (isReduced) {
          setView({ ticks: n + 1, front: 0 });
          gsap.set([card, caption], { autoAlpha: 1, y: 0 });
          gsap.to(root, { autoAlpha: 1, duration: 0.15, overwrite: true });
          onTortoise("idle");
          gsap.set(slide(), { x: SIT_X });
          if (first) onStick();
        } else {
          setView({ ticks: 0, front: 0 });
          gsap.set(root, { autoAlpha: 1 });
          gsap.set(card, { autoAlpha: 0, y: 24 });
          gsap.set(caption, { autoAlpha: 0 });
          tl = gsap.timeline();
          tl.to(card, { autoAlpha: 1, y: 0, duration: 0.7 * k, ease: "power2.out" }, 0)
            .to(caption, { autoAlpha: 1, duration: 0.6 * k }, 0)
            .call(() => onTortoise("idle"), undefined, 0.4 * k)
            .to(slide(), { x: SIT_X, duration: 0.8 * k, ease: "power2.inOut" }, 0.4 * k);
          if (first) tl.call(onStick, undefined, 0.9);

          // one note every 700 ms, the latest brought to the front; the joke is the last tick
          const tick = () => {
            const v = viewRef.current;
            if (v.ticks > n) return;
            const ticks = v.ticks + 1;
            setView({ ticks, front: ticks <= n ? ticks - 1 : v.front });
            if (ticks <= n) timer = setTimeout(tick, PIN_MS * k);
          };
          timer = setTimeout(tick, FIRST_PIN_MS);
        }
        stickGiven = true;

        if (arrivedByKeyboard()) title?.focus({ preventScroll: true });
      });

      const exit = contextSafe(() => {
        tl?.kill();
        stopTimer();
        setActive(false);
        onTortoise(null);
        gsap.to(slide(), { x: 0, duration: isReduced ? 0 : 0.5, ease: "power2.inOut", overwrite: "auto" });
        gsap.to(root, {
          autoAlpha: 0,
          y: isReduced ? 0 : 24,
          duration: isReduced ? 0.15 : 0.35,
          ease: "power2.in",
          overwrite: true,
        });
      });

      const unregister = register("fun", { enter, exit });
      return () => {
        unregister();
        tl?.kill();
        stopTimer();
        onTortoise(null);
      };
    },
    { scope: rootRef, dependencies: [] },
  );

  // While settled: ←/→ and forward/back scrolling cycle the notes; at either end the input falls
  // through so the walk leaves the stop naturally. stopPropagation (not Immediate) keeps other
  // capture listeners, such as the Konami detector, alive.
  useEffect(() => {
    if (!active || n === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || isTypingTarget(e.target)) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (stepRef.current(e.key === "ArrowRight" ? 1 : -1)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    let lockUntil = 0;
    const onWheel = (e: WheelEvent) => {
      const d = e.deltaY || e.deltaX;
      if (Math.abs(d) < 4) return;
      const now = performance.now();
      if (now < lockUntil) {
        // swallow the inertia tail of a wheel flick that already moved a note
        lockUntil = Math.max(lockUntil, now + 140);
        e.stopPropagation();
        return;
      }
      if (stepRef.current(d > 0 ? 1 : -1)) {
        lockUntil = now + 450;
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("wheel", onWheel, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("wheel", onWheel, true);
    };
  }, [active, n]);

  // Mobile: the card is a bottom sheet, so lift the scene.
  useEffect(() => {
    const world = rootRef.current?.closest<HTMLElement>(".world");
    if (!world) return;
    if (active && narrow) world.setAttribute("data-sheet", "");
    else world.removeAttribute("data-sheet");
    return () => world.removeAttribute("data-sheet");
  }, [active, narrow]);

  // Live region: announce the front note once it settles (not mid-reveal).
  const [announce, setAnnounce] = useState("");
  useEffect(() => {
    const t = setTimeout(
      () => setAnnounce(active && vis > 0 ? `Note ${view.front + 1} of ${n}: ${facts[view.front]?.text ?? ""}` : ""),
      ANNOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [active, vis, view.front, n, facts]);

  // Horizontal swipe inside the sheet changes the note; the board is a scroll region so the walk ignores it.
  const onDown = (e: PointerEvent) => {
    swipeX.current = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    const x0 = swipeX.current;
    swipeX.current = null;
    if (x0 == null || !narrow) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) >= SWIPE_PX) stepRef.current(dx < 0 ? 1 : -1);
  };

  const step = n > 1 ? Math.min(24, 110 / (n - 1)) : 0;
  const stepY = step * 0.5;
  const boardStyle = {
    "--fun-n": n,
    "--fun-stack": `${((n - 1) * stepY).toFixed(1)}px`,
  } as CSSProperties;

  return (
    <>
      <div ref={rootRef} className="fun" data-stop="fun">
        <section className="fun-card paper-card sheet" data-card aria-labelledby="fun-title">
          <SheetBar id="fun" title="Fun facts" />
          <div data-caption>
            <Caption>{captions.fun}</Caption>
          </div>
          <h2 id="fun-title" tabIndex={-1}>
            {funCopy.title}
          </h2>
          <p className="fun-intro">{funCopy.intro}</p>

          {/* decorative board: the visually hidden list below is the accessible copy of every fact */}
          <div
            className="fun-board"
            style={boardStyle}
            data-flat={flat ? "" : undefined}
            data-carousel={narrow ? "" : undefined}
            data-scroll-region={narrow ? "" : undefined}
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerCancel={() => (swipeX.current = null)}
            aria-hidden="true"
          >
            {facts.map((f, i) => {
              const rot = ((rng(7000 + i)() - 0.5) * 6).toFixed(2);
              const style = {
                "--rot": `${rot}deg`,
                "--ox": `${(i * step).toFixed(1)}px`,
                "--oy": `${(i * stepY).toFixed(1)}px`,
                "--fun-w": `calc(100% - ${((n - 1) * step).toFixed(1)}px)`,
                zIndex: i === view.front ? 50 : i,
              } as CSSProperties;
              return (
                <button
                  key={f.text}
                  type="button"
                  tabIndex={-1}
                  className="fun-note"
                  data-pinned={i < vis ? "" : undefined}
                  data-front={i === view.front ? "" : undefined}
                  style={style}
                  onClick={() => i < vis && setView({ ...viewRef.current, front: i })}
                >
                  <Pin />
                  <span>{f.text}</span>
                </button>
              );
            })}
          </div>

          {narrow && n > 1 && (
            <div className="fun-dots" aria-hidden="true">
              {facts.map((f, i) => (
                <button
                  key={f.text}
                  type="button"
                  tabIndex={-1}
                  aria-current={i === view.front}
                  data-ready={i < vis ? "" : undefined}
                  onClick={() => i < vis && setView({ ...viewRef.current, front: i })}
                />
              ))}
            </div>
          )}

          <p className="fun-joke hand" data-on={joke ? "" : undefined} aria-hidden="true">
            {funCopy.marshmallow}
          </p>
        </section>
      </div>

      <section className="sr-only" aria-label="Fun facts">
        <div aria-live="polite" aria-atomic="true">
          {announce}
        </div>
        <ul>
          {facts.map((f) => (
            <li key={f.text}>{f.text}</li>
          ))}
        </ul>
        <p>{funCopy.marshmallow}</p>
      </section>
    </>
  );
}
