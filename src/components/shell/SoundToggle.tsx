"use client";

import { useEffect } from "react";
import { hud } from "@/content/site";
import { attachAudio } from "@/lib/audio";
import { useWalkStore } from "@/lib/walk/store";

/** Off by default. Owns the audio engine's lifetime; lives in the HUD. */
export function SoundToggle() {
  const on = useWalkStore((s) => s.soundOn);
  const setOn = useWalkStore((s) => s.setSoundOn);

  useEffect(() => attachAudio(), []);

  return (
    <button
      type="button"
      className="hud-btn sound-toggle"
      aria-pressed={on}
      aria-label={hud.soundLabel}
      title={on ? hud.soundOn : hud.soundOff}
      onClick={() => setOn(!on)}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
        {on ? <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /> : <path d="M16 9.5l5 5M21 9.5l-5 5" />}
      </svg>
    </button>
  );
}
