"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { hud } from "@/content/site";
import { STOPS } from "@/lib/walk/constants";
import { markKeyboardArrival } from "@/lib/walk/timeline";
import { useWalkStore } from "@/lib/walk/store";

const LAST = STOPS.length - 1;

/** progress → 0..1 along the (evenly spaced) dots, interpolated piecewise between the real stop positions. */
function trailFraction(p: number) {
  if (p <= STOPS[0].progress) return 0;
  for (let i = 0; i < LAST; i++) {
    const a = STOPS[i].progress;
    const b = STOPS[i + 1].progress;
    if (p <= b) return (i + (p - a) / (b - a)) / LAST;
  }
  return 1;
}

function HeadMarker() {
  return (
    <svg viewBox="320 138 80 74" width="26" height="24" aria-hidden="true">
      <path d="M326 168C330 148 360 140 378 152C394 162 396 182 386 194C374 206 345 208 332 196C324 188 324 178 326 168Z" fill="var(--sage)" stroke="var(--forest)" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="372" cy="166" r="6" fill="var(--ink)" />
      <ellipse cx="364" cy="184" rx="7" ry="5" fill="var(--coral)" opacity="0.7" />
    </svg>
  );
}

export function DotNav({ progressRef }: { progressRef: RefObject<number> }) {
  const navRef = useRef<HTMLElement>(null);
  const activeStop = useWalkStore((s) => s.activeStop);
  const activeIdx = STOPS.findIndex((s) => s.id === activeStop);

  // Marker follows progress on the ticker (CSS var only; no React renders, no transition → jumps under reduced motion too).
  useEffect(() => {
    const tick = () => navRef.current?.style.setProperty("--f", trailFraction(progressRef.current).toFixed(4));
    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [progressRef]);

  const go = (i: number) => {
    markKeyboardArrival(); // focus the heading on arrival, however the dot was activated
    window.dispatchEvent(new CustomEvent("walk:goto", { detail: { id: STOPS[i].id } }));
  };

  return (
    <nav ref={navRef} className="dotnav" aria-label={hud.navLabel}>
      <p className="dotnav-current" aria-hidden="true">
        {STOPS[activeIdx].title}
      </p>
      <ol className="dotnav-list">
        <li className="dotnav-line" aria-hidden="true" />
        {STOPS.map((stop, i) => {
          const state = i === activeIdx ? "active" : i < activeIdx ? "visited" : "upcoming";
          return (
            <li key={stop.id} className="dotnav-cell">
              <button type="button" className="dotnav-btn" data-state={state} aria-current={state === "active" ? "step" : undefined} onClick={() => go(i)}>
                <span className="dotnav-dot" aria-hidden="true">
                  <svg viewBox="0 0 10 10" width="8" height="8">
                    <path d="M2 5.2 4.2 7.4 8 2.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="sr-only">{`${i + 1}. ${stop.title}`}</span>
                <span className="dotnav-tip" aria-hidden="true">
                  {stop.title}
                </span>
              </button>
            </li>
          );
        })}
        <li className="dotnav-marker" aria-hidden="true">
          <HeadMarker />
        </li>
      </ol>
    </nav>
  );
}
