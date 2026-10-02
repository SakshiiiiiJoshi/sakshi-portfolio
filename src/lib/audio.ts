"use client";

import { gsap } from "@/lib/gsap";
import { useWalkStore } from "@/lib/walk/store";
import { liveMotion } from "@/lib/walk/useWorldTransform";

// Optional ambient sound (03 §9). Strictly opt-in: nothing is fetched or played until the toggle is
// on AND the visitor has made a gesture. Files are listed in /audio/manifest.json, so a missing or
// empty manifest makes the whole module a silent no-op (no 404s, no console errors).
const PREF_KEY = "tortoise:sound";
const BASE = "/audio/";
const MASTER = 0.35;
const RAMP = 0.5; // seconds; the spec caps ramps at 0.6
const TICK_MS = 80;

/** [rise start, rise end, fall start, fall end] in progress units. */
type Window = readonly [number, number, number, number];
const LOOPS = [
  { file: "wind-meadow.mp3", win: [0, 0, 0.34, 0.44] as Window, level: 0.9 },
  { file: "stream.mp3", win: [0.34, 0.44, 0.54, 0.62] as Window, level: 0.8 },
  { file: "crickets-dusk.mp3", win: [0.54, 0.62, 0.86, 0.94] as Window, level: 0.8 },
  { file: "night-pond.mp3", win: [0.86, 0.94, 1, 1] as Window, level: 0.9 },
];
const STEP_FILE = "step.mp3";

export function readSoundPref(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === "1";
  } catch {
    return false;
  }
}
export function writeSoundPref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? "1" : "0");
  } catch {
    /* storage blocked: the preference just won't persist */
  }
}

function trapezoid(p: number, [a, b, c, d]: Window): number {
  if (p < a) return 0;
  if (p < b) return (p - a) / (b - a);
  if (p <= c) return 1;
  if (p < d) return (d - p) / (d - c);
  return 0;
}

interface ActiveLoop {
  gain: GainNode;
  win: Window;
  level: number;
  last: number;
}

function createEngine() {
  let enabled = false;
  let gestured = false;
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let starting = false;
  let stepBuffer: AudioBuffer | null = null;
  let nextStep = 0;
  let lastTick = 0;
  let ticking = false;
  const loops: ActiveLoop[] = [];

  const focused = () => !document.hidden && document.hasFocus();

  function ramp(param: AudioParam, to: number) {
    if (!ctx) return;
    const now = ctx.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(to, now + RAMP);
  }

  function applyMaster() {
    if (master) ramp(master.gain, enabled && focused() ? MASTER : 0);
  }

  function tick(timeSec: number) {
    const nowMs = timeSec * 1000;
    if (!ctx || !enabled || nowMs - lastTick < TICK_MS) return;
    lastTick = nowMs;
    const p = liveMotion.p;
    for (const l of loops) {
      const g = trapezoid(p, l.win) * l.level;
      if (Math.abs(g - l.last) > 0.01) {
        l.last = g;
        ramp(l.gain.gain, g);
      }
    }
    if (stepBuffer && master && liveMotion.moving && ctx.currentTime >= nextStep) {
      const speed = Math.min(liveMotion.vel / 0.9, 1);
      const src = ctx.createBufferSource();
      src.buffer = stepBuffer;
      const g = ctx.createGain();
      g.gain.value = 0.6;
      src.connect(g).connect(master);
      src.start();
      nextStep = ctx.currentTime + 0.62 - speed * 0.34; // 0.62 s apart when slow, 0.28 s at full tilt
    }
  }

  function startTicker() {
    if (ticking) return;
    ticking = true;
    gsap.ticker.add(tick);
  }
  function stopTicker() {
    if (!ticking) return;
    ticking = false;
    gsap.ticker.remove(tick);
  }

  async function fetchBuffer(c: AudioContext, file: string): Promise<AudioBuffer | null> {
    try {
      const res = await fetch(BASE + file);
      if (!res.ok) return null;
      return await c.decodeAudioData(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  async function start() {
    if (!enabled || !gestured || starting) return;
    if (ctx) {
      void ctx.resume();
      applyMaster();
      startTicker();
      return;
    }
    starting = true;
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      let files: string[] = [];
      try {
        const res = await fetch(`${BASE}manifest.json`);
        if (res.ok) files = ((await res.json()) as { files?: string[] }).files ?? [];
      } catch {
        /* no manifest: stay silent */
      }
      if (!files.length) return;
      const c = new Ctor();
      const m = c.createGain();
      m.gain.value = 0;
      m.connect(c.destination);
      ctx = c;
      master = m;
      await Promise.all(
        LOOPS.filter((l) => files.includes(l.file)).map(async (l) => {
          const buf = await fetchBuffer(c, l.file);
          if (!buf) return;
          const src = c.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const gain = c.createGain();
          gain.gain.value = 0;
          src.connect(gain).connect(m);
          src.start();
          loops.push({ gain, win: l.win, level: l.level, last: 0 });
        }),
      );
      if (files.includes(STEP_FILE)) stepBuffer = await fetchBuffer(c, STEP_FILE);
      if (enabled) {
        void c.resume();
        applyMaster();
        startTicker();
      }
    } catch {
      /* audio is optional: never surface errors */
    } finally {
      starting = false;
    }
  }

  function setEnabled(on: boolean) {
    enabled = on;
    if (on) {
      void start();
    } else {
      applyMaster();
      stopTicker();
      const c = ctx;
      window.setTimeout(() => {
        if (!enabled && c && c.state === "running") void c.suspend();
      }, RAMP * 1000 + 100);
    }
  }

  const onGesture = () => {
    if (gestured) return;
    gestured = true;
    removeGestureListeners();
    void start();
  };
  const GESTURES = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
  function removeGestureListeners() {
    for (const g of GESTURES) window.removeEventListener(g, onGesture, true);
  }
  for (const g of GESTURES) window.addEventListener(g, onGesture, { capture: true, passive: true });

  const onFocusChange = () => {
    applyMaster();
    if (focused() && enabled) void start();
  };
  window.addEventListener("blur", onFocusChange);
  window.addEventListener("focus", onFocusChange);
  document.addEventListener("visibilitychange", onFocusChange);

  function dispose() {
    stopTicker();
    removeGestureListeners();
    window.removeEventListener("blur", onFocusChange);
    window.removeEventListener("focus", onFocusChange);
    document.removeEventListener("visibilitychange", onFocusChange);
    if (ctx) void ctx.close();
    ctx = null;
    master = null;
  }

  return { setEnabled, dispose };
}

/**
 * Hydrates the saved preference into the store, then keeps the engine and the preference in step
 * with `soundOn`. Returns a cleanup. Call once, from the client (see SoundToggle).
 */
export function attachAudio(): () => void {
  const engine = createEngine();
  const store = useWalkStore;
  const unsub = store.subscribe((s, prev) => {
    if (s.soundOn === prev.soundOn) return;
    writeSoundPref(s.soundOn);
    engine.setEnabled(s.soundOn);
  });
  if (readSoundPref()) store.getState().setSoundOn(true); // still waits for a gesture before any sound
  return () => {
    unsub();
    engine.dispose();
  };
}
