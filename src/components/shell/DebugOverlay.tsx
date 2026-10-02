"use client";

import { forwardRef, useEffect, useState } from "react";

/** Backtick toggles. Text is written imperatively by the walk engine (no React per frame). Dev only. */
export const DebugOverlay = forwardRef<HTMLPreElement>(function DebugOverlay(_, ref) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "`") setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (process.env.NODE_ENV === "production") return null;
  return (
    <pre
      ref={ref}
      aria-hidden="true"
      className="mono pointer-events-none fixed top-3 right-3 z-50 rounded-xl p-3 text-xs"
      style={{ display: open ? "block" : "none", background: "color-mix(in srgb, var(--paper) 92%, transparent)", color: "var(--ink)", boxShadow: "var(--shadow-2)" }}
    />
  );
});
