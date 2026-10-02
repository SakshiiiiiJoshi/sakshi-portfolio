"use client";

import { useCallback, useRef, useState, type ReactNode, type Ref, type RefObject } from "react";
import { Tortoise, type TortoiseHandle } from "@/components/tortoise/Tortoise";
import type { TortoiseState } from "@/components/tortoise/poses";
import { useWorldTransform, type FrameSample, type MotionState } from "@/lib/walk/useWorldTransform";
import { Sky } from "./layers/Sky";
import { FarHills } from "./layers/FarHills";
import { MidHills } from "./layers/MidHills";
import { Trees } from "./layers/Trees";
import { PathLayer } from "./layers/PathLayer";
import { Foreground } from "./layers/Foreground";
import { Fx } from "./layers/Fx";
import { Grain } from "./layers/Grain";
import { SetsLayer } from "./SetsLayer";

export const WORLD_LAYER_IDS = ["sky", "far", "mid", "trees", "path", "foreground", "fx", "grain"] as const;
export type WorldLayerId = (typeof WORLD_LAYER_IDS)[number];

export interface WorldProps {
  /** Walk progress 0..1. Written by the input engine (or the lab slider); read on the GSAP ticker. */
  progressRef: RefObject<number>;
  hiddenLayers?: ReadonlySet<WorldLayerId>;
  /** Discrete tortoise state that wins over walk/idle (e.g. "hide" on a fast flick). */
  tortoiseOverride?: TortoiseState | null;
  /** Backpack items shown on the satchel (leaf, seeds, …). */
  items?: number;
  /** Handle to the tortoise (one-shot `hop()` squash/stretch for Stepping Stones). */
  tortoiseHandle?: Ref<TortoiseHandle>;
  /** Called every frame; keep it cheap and never set React state from it. */
  onFrame?: (s: FrameSample) => void;
  /** Click/tap on the tortoise (easter egg). */
  onTortoiseClick?: () => void;
  /** HTML overlays (stop cards, hints). Rendered last inside `.world`, so they inherit `--s` / `--anchor-x`. */
  children?: ReactNode;
}

const hide = (set: ReadonlySet<WorldLayerId> | undefined, id: WorldLayerId) => (set?.has(id) ? "true" : undefined);

export function World({ progressRef, hiddenLayers, tortoiseOverride, items = 0, tortoiseHandle, onFrame, onTortoiseClick, children }: WorldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tortoiseRef = useRef<HTMLDivElement>(null);
  // Low-frequency only: changes on idle<->walk, direction flips and 0.2x speed steps.
  const [motion, setMotion] = useState<MotionState>({ moving: false, facing: 1, speed: 1 });
  const onMotion = useCallback((m: MotionState) => setMotion(m), []);

  useWorldTransform({ rootRef, tortoiseRef, progressRef, onMotion, onFrame });

  return (
    <div ref={rootRef} className="world">
      <div data-world-group="sky" data-hidden={hide(hiddenLayers, "sky")}><Sky /></div>
      {/* bottom-anchored 1440x900 design stage; layers position themselves inside it */}
      <div className="world-stage">
        <div data-world-group="far" data-hidden={hide(hiddenLayers, "far")}><FarHills /></div>
        <div data-world-group="mid" data-hidden={hide(hiddenLayers, "mid")}><MidHills /></div>
        <div data-world-group="trees" data-hidden={hide(hiddenLayers, "trees")}><Trees /></div>
        <div data-world-group="path" data-hidden={hide(hiddenLayers, "path")}>
          <PathLayer />
          <SetsLayer progressRef={progressRef} />
        </div>
        <div ref={tortoiseRef} className="world-tortoise">
          {/* slide wrapper: lets a stop animate the tortoise (e.g. Hello's door exit) without touching the transform owned by useWorldTransform */}
          {/* hop wrapper: Stepping Stones offsets the tortoise from its anchor (transform written by useWorldTransform) */}
          <div data-tortoise-hop>
            <div data-tortoise-slide>
              <Tortoise ref={tortoiseHandle} state={tortoiseOverride ?? (motion.moving ? "walk" : "idle")} speed={motion.speed} facing={motion.facing} items={items} onClick={onTortoiseClick} />
            </div>
          </div>
        </div>
        <div data-world-group="foreground" data-hidden={hide(hiddenLayers, "foreground")}><Foreground /></div>
      </div>
      <div className="world-tint" aria-hidden="true" />
      <div className="world-vignette" aria-hidden="true" />
      <div data-world-group="fx" data-hidden={hide(hiddenLayers, "fx")}><Fx /></div>
      <div data-world-group="grain" data-hidden={hide(hiddenLayers, "grain")}><Grain /></div>
      {children}
    </div>
  );
}
