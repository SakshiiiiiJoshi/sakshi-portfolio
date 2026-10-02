"use client";

import { useSyncExternalStore } from "react";

// Quality tiers + runtime FPS downgrade (04 §12). The starting tier comes from device hints; if the
// average fps over 2 s falls below 45 we step down one stage at a time:
//   1 drop layer drop-shadows -> 2 halve particles -> 3 drop grain.
// We never step back up within a session (avoids flapping).
export type QualityTier = "high" | "medium" | "low";

export interface Perf {
  tier: QualityTier;
  /** 0 = nothing dropped yet, 3 = everything dropped. */
  stage: 0 | 1 | 2 | 3;
  shadows: boolean;
  grain: boolean;
  /** Multiplier applied to every particle count (1, or 0.5 once stage >= 2). */
  particleScale: number;
}

const FPS_FLOOR = 45;
const WINDOW_MS = 2000;
const WARMUP_MS = 2000;

function detectStartTier(): QualityTier {
  if (typeof window === "undefined") return "high";
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "low";
  const cores = navigator.hardwareConcurrency || 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const dpr = window.devicePixelRatio || 1;
  if (cores <= 2 || mem <= 2) return "low";
  if (cores <= 4 || mem <= 4 || (dpr > 2.5 && cores <= 8)) return "medium";
  return "high";
}

const make = (tier: QualityTier, stage: Perf["stage"]): Perf => ({
  tier,
  stage,
  shadows: stage < 1,
  grain: stage < 3,
  particleScale: stage >= 2 ? 0.5 : 1,
});

const SERVER: Perf = make("high", 0);
let perf: Perf = SERVER;
let started = false;
let warned = false;
const listeners = new Set<() => void>();

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  perf = make(detectStartTier(), 0);
}

function set(next: Perf) {
  perf = next;
  listeners.forEach((l) => l());
}

export function getPerf(): Perf {
  ensureStarted();
  return perf;
}

export function subscribePerf(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** React hook: re-renders only when the tier or a downgrade stage changes. */
export function usePerf(): Perf {
  return useSyncExternalStore(subscribePerf, getPerf, () => SERVER);
}

/** Particle count for a type's per-tier maximum, after any runtime downgrade. */
export function countFor(max: Record<QualityTier, number>, p: Perf): number {
  return Math.max(0, Math.round(max[p.tier] * p.particleScale));
}

/** Steps down one stage. No-op at the last stage. Never steps back up. */
export function downgrade(reason = "fps") {
  ensureStarted();
  if (perf.stage >= 3) return;
  const stage = (perf.stage + 1) as Perf["stage"];
  if (process.env.NODE_ENV !== "production" && !warned) {
    warned = true;
    console.info(`[perf] ${reason}: quality downgrade started (stage ${stage}); it will not upgrade again this session.`);
  }
  set(make(perf.tier, stage));
}

/** Dev/lab only: jump to a tier and stage (can go "up" on purpose). */
export function forcePerf(tier: QualityTier, stage: Perf["stage"] = 0) {
  ensureStarted();
  set(make(tier, stage));
}

/** Mirrors the current perf onto the world root as data attributes the CSS keys off. */
export function bindPerfToRoot(root: HTMLElement): () => void {
  const apply = () => {
    const p = getPerf();
    root.dataset.tier = p.tier;
    if (p.shadows) delete root.dataset.noShadows;
    else root.dataset.noShadows = "";
    if (p.grain) delete root.dataset.noGrain;
    else root.dataset.noGrain = "";
  };
  apply();
  return subscribePerf(apply);
}

/**
 * Feeds the ticker's frame deltas; downgrades when the 2 s average drops under 45 fps. Ignores the
 * first 2 s (startup jank), hidden-tab gaps and any frame over 250 ms.
 */
export function createFpsMonitor() {
  let acc = 0;
  let frames = 0;
  let age = 0;
  return {
    sample(dtMs: number) {
      if (document.hidden || dtMs > 250) {
        acc = 0;
        frames = 0;
        return;
      }
      if (age < WARMUP_MS) {
        age += dtMs;
        return;
      }
      acc += dtMs;
      frames++;
      if (acc >= WINDOW_MS) {
        if ((frames * 1000) / acc < FPS_FLOOR) downgrade();
        acc = 0;
        frames = 0;
      }
    },
  };
}
