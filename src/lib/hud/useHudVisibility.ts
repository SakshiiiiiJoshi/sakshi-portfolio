import { useEffect, type RefObject } from "react";

/**
 * Keeps the dots visible when a mobile bottom sheet is open: publishes the dots' height as
 * `--hud-dots-h` on the stage so sheets (and the skills tooltip) sit above them.
 */
export function useHudVisibility(hudRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hud = hudRef.current;
    const stage = hud?.closest<HTMLElement>(".stage");
    const dots = hud?.querySelector<HTMLElement>(".dotnav");
    if (!stage || !dots) return;
    const publish = () => stage.style.setProperty("--hud-dots-h", `${dots.offsetHeight + 8}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(dots);
    return () => {
      ro.disconnect();
      stage.style.removeProperty("--hud-dots-h");
    };
  }, [hudRef]);
}
