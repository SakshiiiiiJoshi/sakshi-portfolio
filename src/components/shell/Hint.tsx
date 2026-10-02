"use client";

import { useEffect, useState } from "react";
import { hud } from "@/content/site";
import { useMedia } from "@/lib/useMedia";
import { useWalkStore } from "@/lib/walk/store";

const IDLE_MS = 8000;
const INPUTS = ["wheel", "keydown", "pointerdown", "touchstart"] as const;

/** Bottom-left nudge: fades after the first input; returns after 8 s idle, at Hello only. */
export function Hint() {
  const wide = useMedia("(min-width: 640px)");
  const coarse = useMedia("(pointer: coarse)");
  const atHello = useWalkStore((s) => s.activeStop === "hello");
  const [show, setShow] = useState(true);

  useEffect(() => {
    let timer: number | undefined;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setShow(true), IDLE_MS);
    };
    const onInput = () => {
      setShow(false);
      arm();
    };
    INPUTS.forEach((t) => window.addEventListener(t, onInput, { capture: true, passive: true }));
    return () => {
      window.clearTimeout(timer);
      INPUTS.forEach((t) => window.removeEventListener(t, onInput, true));
    };
  }, []);

  if (!wide) return null;
  return (
    <p className="hud-hint chip" data-visible={show && atHello ? "" : undefined} aria-hidden="true">
      {coarse ? hud.hintMobile : hud.hintDesktop}
    </p>
  );
}
