import { useSyncExternalStore } from "react";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** The live preference; `null` on the server and during hydration. */
export function useReducedMotion(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, prefersReducedMotion, () => null);
}
