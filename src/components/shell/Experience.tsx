"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { resolveInitialMode } from "@/lib/a11y/modeStorage";
import { useReducedMotion } from "@/lib/a11y/reducedMotion";
import { setThemeColor } from "@/lib/walk/themeColor";
import { toggleMode } from "@/lib/walk/mode";
import { useWalkStore } from "@/lib/walk/store";
import { SkipLink } from "./SkipLink";

// The world, the stops and GSAP load as their own chunks, after hydration + idle, so the server-rendered
// poster (Poster.tsx) is what the first paint and LCP are about.
const Stage = dynamic(() => import("./Stage").then((m) => m.Stage), { ssr: false });

const IDLE_TIMEOUT_MS = 1200;

/** requestIdleCallback with a timeout, and a setTimeout fallback where it is missing (Safari). */
function whenIdle(cb: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
}

function scrollToHash(smooth: boolean) {
  const id = window.location.hash.slice(1);
  const el = id ? document.getElementById(`s-${id}`) : null;
  if (el) el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

/**
 * Owns walk vs static. The semantic page is server-rendered (StaticView); this decides which view is
 * live. Start: stored choice → reduced motion ? static : walk. Reduced-motion visitors can opt in to
 * the walk and that choice sticks for the tab.
 */
export function Experience() {
  const mode = useWalkStore((s) => s.mode);
  const modeReady = useWalkStore((s) => s.modeReady);
  const reduced = useReducedMotion();
  const [idle, setIdle] = useState(false);
  const settledStop = useWalkStore((s) => s.settledStop);

  useEffect(() => whenIdle(() => setIdle(true)), []);
  useEffect(() => setThemeColor(settledStop), [settledStop]);

  useEffect(() => {
    useWalkStore.getState().initMode(resolveInitialMode());
  }, []);

  useEffect(() => {
    if (modeReady) document.documentElement.setAttribute("data-mode", mode);
  }, [mode, modeReady]);

  // `S` toggles the mode from either view (the engine only lives in walk mode).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "s" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      toggleMode();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Static mode: honour the URL hash (`#projects` → the Projects section), on entry and on change.
  useEffect(() => {
    if (!modeReady || mode !== "static") return;
    scrollToHash(false);
    const onHash = () => scrollToHash(reduced === false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [mode, modeReady, reduced]);

  return (
    <>
      <SkipLink />
      {idle && modeReady && mode === "walk" && reduced !== null && (
        <Stage reducedMotion={reduced} onReady={() => document.documentElement.setAttribute("data-world", "ready")} />
      )}
    </>
  );
}
