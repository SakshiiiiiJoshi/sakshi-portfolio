"use client";

import type { ReactNode } from "react";
import { useWalkStore } from "@/lib/walk/store";

/**
 * Wraps the server-rendered semantic content. In walk mode the walk's own overlays are the announced
 * copy, so this one is clipped (CSS) and removed from the a11y tree + tab order. In static mode, and
 * before JS resolves the mode (or with JS off), it is the visible, announced page.
 */
export function StaticRoot({ children }: { children: ReactNode }) {
  const hidden = useWalkStore((s) => s.modeReady && s.mode === "walk");
  return (
    <div className="static-root" aria-hidden={hidden || undefined} inert={hidden || undefined}>
      {children}
    </div>
  );
}
