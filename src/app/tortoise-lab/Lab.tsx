"use client";

import { useRef, useState } from "react";
import { Tortoise, type TortoiseHandle } from "@/components/tortoise/Tortoise";
import { TORTOISE_STATES, type TortoiseState } from "@/components/tortoise/poses";

const btn =
  "rounded-full border-2 border-current px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-70";

export function Lab() {
  const [state, setState] = useState<TortoiseState>("idle");
  const [speed, setSpeed] = useState(1);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [items, setItems] = useState(0);
  const [night, setNight] = useState(false);
  const hopper = useRef<TortoiseHandle>(null);

  return (
    <main
      // The site shell locks body scroll, so the lab scrolls inside its own fixed container.
      className="fixed inset-0 overflow-y-auto p-6"
      style={{
        background: night ? "var(--night)" : "var(--paper)",
        color: night ? "var(--paper)" : "var(--ink)",
      }}
    >
      <h1 className="font-display text-3xl font-bold">Tortoise lab</h1>
      <p className="mt-1 text-sm opacity-70">state: {state} · speed {speed.toFixed(1)}× · items {items}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TORTOISE_STATES.map((s) => (
          <button key={s} className={btn} aria-pressed={state === s} style={state === s ? { background: "var(--honey)", color: "var(--ink)" } : undefined} onClick={() => setState(s)}>
            {s}
          </button>
        ))}
        <button className={btn} onClick={() => hopper.current?.hop()}>hop</button>
        <button className={btn} onClick={() => setFacing((f) => (f === 1 ? -1 : 1))}>
          facing {facing === 1 ? "→" : "←"}
        </button>
        <button className={btn} onClick={() => setNight((n) => !n)}>{night ? "day" : "night"}</button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
        <label className="flex items-center gap-2">
          speed
          <input type="range" min={0.6} max={1.8} step={0.1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>
        <span className="flex items-center gap-2">
          backpack
          <button className={btn} onClick={() => setItems((i) => Math.max(0, i - 1))} aria-label="fewer items">−</button>
          {items}
          <button className={btn} onClick={() => setItems((i) => Math.min(6, i + 1))} aria-label="more items">+</button>
        </span>
      </div>

      <div className="mt-10 flex flex-wrap items-end gap-12">
        <div style={{ width: 120 }}>
          <Tortoise ref={hopper} state={state} speed={speed} facing={facing} items={items} onClick={() => setState("hide")} />
          <p className="mt-2 text-xs opacity-60">120 px (click shell → hide)</p>
        </div>
        <div style={{ width: 400, maxWidth: "100%" }}>
          <Tortoise state={state} speed={speed} facing={facing} items={items} />
          <p className="mt-2 text-xs opacity-60">400 px</p>
        </div>
      </div>
    </main>
  );
}
