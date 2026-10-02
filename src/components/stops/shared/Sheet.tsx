"use client";

import { useEffect, useRef, useState } from "react";
import { useMedia } from "@/lib/useMedia";
import { useWalkStore } from "@/lib/walk/store";
import type { StopId } from "@/lib/walk/constants";

/**
 * Bottom-sheet mode: phones (<640) and portrait tablets (≤1023), where a right-hand card would
 * crowd the tortoise. Keep in sync with the `.sheet` block at the end of globals.css.
 */
export const SHEET_MQ = "(max-width: 639px), (max-width: 1023px) and (orientation: portrait)";

export function useSheetMode() {
  return useMedia(SHEET_MQ);
}

/**
 * First child of every stop card that doubles as a bottom sheet (`<section className="… sheet">`).
 * Renders the (visual-only) drag handle plus a collapse/expand button; in sheet mode it
 *  - turns the card into the one internal scroll region (`data-scroll-region`, so the walk's
 *    Observer ignores touches on it and a sheet never changes `progress`),
 *  - collapses the card to a one-line title peek so the scene stays visible (`data-collapsed`),
 *  - tells the world to shift up while the sheet is open (`data-sheet-open` / `data-sheet-peek`).
 * Collapsing is a button, not drag-to-resize, to avoid gesture conflicts with the walk.
 */
export function SheetBar({ id, title }: { id: StopId; title: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  const sheet = useSheetMode();
  const active = useWalkStore((s) => s.activeStop === id);
  const [collapsed, setCollapsed] = useState(false);

  // Arriving at the stop always shows the full sheet (adjusting state during render, not in an effect).
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (active) setCollapsed(false);
  }

  useEffect(() => {
    const card = barRef.current?.closest<HTMLElement>("[data-card]");
    const world = barRef.current?.closest<HTMLElement>(".world");
    if (!card) return;
    if (!sheet) {
      card.removeAttribute("data-collapsed");
      card.removeAttribute("data-scroll-region");
      return;
    }
    card.setAttribute("data-scroll-region", "");
    if (collapsed) card.setAttribute("data-collapsed", "");
    else card.removeAttribute("data-collapsed");
    if (world && active) {
      world.setAttribute(collapsed ? "data-sheet-peek" : "data-sheet-open", "");
      world.removeAttribute(collapsed ? "data-sheet-open" : "data-sheet-peek");
    }
    return () => {
      card.removeAttribute("data-collapsed");
      card.removeAttribute("data-scroll-region");
      world?.removeAttribute("data-sheet-open");
      world?.removeAttribute("data-sheet-peek");
    };
  }, [sheet, collapsed, active]);

  if (!sheet) return null;
  return (
    <div ref={barRef} className="sheet-bar">
      <span className="sheet-handle" aria-hidden="true" />
      <span className="sheet-peek-title" aria-hidden="true">
        {title}
      </span>
      <button
        type="button"
        className="sheet-toggle"
        aria-expanded={!collapsed}
        aria-label={collapsed ? `Show ${title} card` : `Collapse ${title} card to see the scene`}
        onClick={() => setCollapsed((c) => !c)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={collapsed ? "M6 15 L12 9 L18 15" : "M6 9 L12 15 L18 9"} />
        </svg>
      </button>
    </div>
  );
}
