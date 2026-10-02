"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { World, WORLD_LAYER_IDS, type WorldLayerId } from "@/components/world/World";
import { gsap } from "@/lib/gsap";
import type { FrameSample } from "@/lib/walk/useWorldTransform";
import { forcePerf, getPerf, type QualityTier } from "@/lib/perf/tier";

export function Lab() {
  // Per-frame values live in refs and DOM writes; only the layer toggles are React state.
  const progressRef = useRef(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const readoutRef = useRef<HTMLPreElement>(null);
  const lastWrite = useRef(0);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [hidden, setHidden] = useState<ReadonlySet<WorldLayerId>>(new Set());
  const [playing, setPlaying] = useState(false);

  const onFrame = useCallback((s: FrameSample) => {
    const now = performance.now();
    if (now - lastWrite.current < 100) return; // 10 Hz readout
    lastWrite.current = now;
    if (readoutRef.current) {
      readoutRef.current.textContent =
        `p ${s.p.toFixed(4)}\nx ${s.x.toFixed(0)}\ny ${s.y.toFixed(1)}\nangle ${s.angle.toFixed(1)}°\nfps ${s.fps.toFixed(0)}\ntier ${getPerf().tier} / stage ${getPerf().stage}`;
    }
  }, []);

  const stop = useCallback(() => {
    tween.current?.kill();
    tween.current = null;
    setPlaying(false);
  }, []);

  const play = () => {
    stop();
    progressRef.current = 0;
    setPlaying(true);
    tween.current = gsap.to(progressRef, {
      current: 1,
      duration: 20,
      ease: "none",
      onUpdate: () => {
        if (sliderRef.current) sliderRef.current.value = String(progressRef.current);
      },
      onComplete: () => setPlaying(false),
    });
  };

  useEffect(() => () => void tween.current?.kill(), []);

  const toggle = (id: WorldLayerId) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <World progressRef={progressRef} hiddenLayers={hidden} onFrame={onFrame} />
      <div
        className="fixed bottom-3 left-3 right-3 z-10 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl p-3 text-sm sm:right-auto sm:max-w-3xl"
        style={{ background: "color-mix(in srgb, var(--paper) 92%, transparent)", color: "var(--ink)", boxShadow: "var(--shadow-2)" }}
      >
        <label className="flex min-w-60 flex-1 items-center gap-2">
          progress
          <input
            ref={sliderRef}
            className="w-full"
            type="range"
            min={0}
            max={1}
            step={0.0005}
            defaultValue={0}
            onInput={(e) => {
              stop();
              progressRef.current = Number(e.currentTarget.value);
            }}
          />
        </label>
        <button className="rounded-full border-2 border-current px-3 py-1 font-semibold" onClick={playing ? stop : play}>
          {playing ? "stop" : "auto-scrub 20 s"}
        </button>
        <pre ref={readoutRef} className="mono min-w-28 whitespace-pre" />
        <label className="flex items-center gap-1">
          force tier
          <select defaultValue="" onChange={(e) => e.target.value && forcePerf(e.target.value as QualityTier, 0)}>
            <option value="">(auto)</option>
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {WORLD_LAYER_IDS.map((id) => (
            <label key={id} className="flex items-center gap-1">
              <input type="checkbox" checked={!hidden.has(id)} onChange={() => toggle(id)} />
              {id}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
