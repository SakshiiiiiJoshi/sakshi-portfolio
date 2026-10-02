import type { StopId } from "./constants";
import { useWalkStore } from "./store";

export interface StopTimeline {
  enter: () => void;
  exit: () => void;
}

const registry = new Map<StopId, StopTimeline>();

/** Register a stop's enter/exit timelines. Returns an unregister function (use as effect cleanup). */
export function register(stopId: StopId, timeline: StopTimeline): () => void {
  registry.set(stopId, timeline);
  return () => {
    if (registry.get(stopId) === timeline) registry.delete(stopId);
  };
}

export function enter(stopId: StopId) {
  registry.get(stopId)?.enter();
}

export function exit(stopId: StopId) {
  registry.get(stopId)?.exit();
}

let keyboardArrival = false;

/** True if the last input before arriving at a stop was the keyboard (focus the stop's heading). */
export function arrivedByKeyboard() {
  return keyboardArrival;
}

/** Treat the next arrival as keyboard-driven (DotNav activation), so the stop heading takes focus. */
export function markKeyboardArrival() {
  keyboardArrival = true;
}

/** Calls enter(stop) when the walk settles on a stop and exit(stop) when it leaves. */
export function bindTimelines(): () => void {
  const onKey = () => (keyboardArrival = true);
  const onOther = () => (keyboardArrival = false);
  window.addEventListener("keydown", onKey, true);
  window.addEventListener("wheel", onOther, { capture: true, passive: true });
  window.addEventListener("pointerdown", onOther, true);
  const unsubscribe = useWalkStore.subscribe((state, prev) => {
    if (state.settledStop === prev.settledStop) return;
    if (prev.settledStop) exit(prev.settledStop);
    if (state.settledStop) enter(state.settledStop);
  });
  return () => {
    unsubscribe();
    window.removeEventListener("keydown", onKey, true);
    window.removeEventListener("wheel", onOther, true);
    window.removeEventListener("pointerdown", onOther, true);
  };
}
