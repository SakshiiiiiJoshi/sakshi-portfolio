import { useWalkStore } from "./store";

/** Heading to land on after a mode switch (never leave focus on an unmounted control). */
function focusMainHeading(mode: "walk" | "static") {
  const hash = window.location.hash.slice(1);
  const id = mode === "static" ? (hash && document.getElementById(`s-${hash}-title`) ? `s-${hash}-title` : "s-hello-title") : "hello-title";
  const attempt = (tries: number) => {
    const el = document.getElementById(id);
    if (el) el.focus({ preventScroll: true });
    else if (tries > 0) requestAnimationFrame(() => attempt(tries - 1));
  };
  requestAnimationFrame(() => attempt(10));
}

/** Single entry point for the S key, the skip/back buttons and the in-page CTAs. */
export function toggleMode(to?: "walk" | "static") {
  const { mode, setMode } = useWalkStore.getState();
  const next = to ?? (mode === "walk" ? "static" : "walk");
  if (next === mode) return;
  document.documentElement.setAttribute("data-switched", "");
  setMode(next);
  focusMainHeading(next);
}
