import { useSyncExternalStore } from "react";

/** Subscribes to a media query; false on the server / during hydration. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export type Breakpoint = "wide" | "mid" | "narrow";

/** 03 §5 breakpoints: ≥1024 wide, 640–1023 mid, <640 narrow (false-y "wide" on the server). */
export function useBreakpoint(): Breakpoint {
  const mid = useMedia("(max-width: 1023px)");
  const narrow = useMedia("(max-width: 639px)");
  return narrow ? "narrow" : mid ? "mid" : "wide";
}

/** Landscape phones: short viewports where the scene and chrome must be compact. */
export const SHORT_LANDSCAPE = "(max-height: 450px) and (orientation: landscape)";
