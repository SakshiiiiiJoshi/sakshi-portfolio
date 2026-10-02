"use client";

import { hud } from "@/content/site";
import { toggleMode } from "@/lib/walk/mode";
import { useWalkStore } from "@/lib/walk/store";

/** First focusable element. Toggles between the walk and the static view. */
export function SkipLink() {
  const mode = useWalkStore((s) => s.mode);
  return (
    <button
      type="button"
      onClick={() => toggleMode()}
      className="skip-link fixed top-3 left-3 z-50 -translate-y-20 rounded-full px-4 py-2 text-sm font-bold focus:translate-y-0"
      style={{ background: "var(--paper)", color: "var(--ink)", boxShadow: "var(--shadow-2)" }}
    >
      {mode === "walk" ? hud.skip : hud.back}
    </button>
  );
}
