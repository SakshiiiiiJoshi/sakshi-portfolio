"use client";

import { useEffect, useState } from "react";
import { hud } from "@/content/site";
import { STOPS } from "@/lib/walk/constants";
import { arrivedByKeyboard } from "@/lib/walk/timeline";
import { useWalkStore } from "@/lib/walk/store";

const THROTTLE_MS = 200;
/** Stops whose own timelines don't move focus to the heading. */
const FOCUS_HERE = new Set(["projects", "experience"]);

/** Polite announcement once per settle ("Stop 3 of 7: Skills Garden"); silent while walking. */
export function LiveRegion() {
  const [text, setText] = useState("");

  useEffect(() => {
    let timer: number | undefined;
    const unsubscribe = useWalkStore.subscribe((state, prev) => {
      if (state.settledStop === prev.settledStop) return;
      window.clearTimeout(timer);
      const id = state.settledStop;
      if (!id) return;
      timer = window.setTimeout(() => {
        const n = STOPS.findIndex((s) => s.id === id) + 1;
        setText(hud.announce(n, STOPS.length, STOPS[n - 1].title));
        if (FOCUS_HERE.has(id) && arrivedByKeyboard()) {
          document.querySelector<HTMLElement>(`[data-stop="${id}"] [id$="-title"]`)?.focus({ preventScroll: true });
        }
      }, THROTTLE_MS);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {text}
    </div>
  );
}

