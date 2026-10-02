"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useEasterEggs } from "@/lib/easter";
import { World } from "@/components/world/World";
import { StopHello } from "@/components/stops/StopHello";
import { StopAbout } from "@/components/stops/StopAbout";
import { StopSkills } from "@/components/stops/StopSkills";
import type { TortoiseState } from "@/components/tortoise/poses";
import type { TortoiseHandle } from "@/components/tortoise/Tortoise";
import { StopProjects } from "@/components/stops/StopProjects";
import { StopExperience } from "@/components/stops/StopExperience";
import { StopFun } from "@/components/stops/StopFun";
import { StopContact } from "@/components/stops/StopContact";
import { bindTimelines } from "@/lib/walk/timeline";
import { useWalk } from "@/lib/walk/useWalk";
import { useWalkStore } from "@/lib/walk/store";
import { DebugOverlay } from "./DebugOverlay";
import { Hud } from "./Hud";
import { LiveRegion } from "./LiveRegion";

/** Fixed full-viewport event-capture element. Mounts the world (and later stops + HUD). */
export function Stage({ reducedMotion, onReady }: { reducedMotion: boolean; /** Fired once the world has painted its first frame (the poster can leave). */ onReady?: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const debugRef = useRef<HTMLPreElement>(null);
  const [hiding, setHiding] = useState(false);
  // pose requested by the active stop (Hello: intro choreography, then `peek`); a flick-`hide` wins
  const [stopPose, setStopPose] = useState<TortoiseState | null>(null);

  // backpack: the leaf arrives at About and stays
  const [leaf, setLeaf] = useState(false);
  // …and the seed packet joins it at the Skills Garden
  const [seeds, setSeeds] = useState(false);
  // …and the folded map at the stream
  const [map, setMap] = useState(false);
  // …and the lantern on the climb
  const [lantern, setLantern] = useState(false);
  // …and the marshmallow stick at the campfire
  const [stick, setStick] = useState(false);
  // …and the letter at the pond: the journey is complete
  const [letter, setLetter] = useState(false);
  const tortoiseHandle = useRef<TortoiseHandle>(null);
  useEffect(() => bindTimelines(), []);

  // Easter eggs: tapping the tortoise tucks it in, then it peeks back out.
  const [eggPose, setEggPose] = useState<TortoiseState | null>(null);
  const eggTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const timers = eggTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);
  const onTortoiseClick = useCallback(() => {
    eggTimers.current.forEach(clearTimeout);
    setEggPose("hide");
    eggTimers.current = [setTimeout(() => setEggPose("peek"), 1100), setTimeout(() => setEggPose(null), 2300)];
  }, []);
  // `T`: a happy spin with a hop (skipped under reduced motion).
  const onSpin = useCallback(() => {
    const slide = document.querySelector<HTMLElement>("[data-tortoise-slide]");
    if (!slide || reducedMotion || gsap.isTweening(slide)) return;
    tortoiseHandle.current?.hop();
    gsap.fromTo(slide, { rotation: 0 }, { rotation: 360, duration: 0.8, ease: "power2.inOut", onComplete: () => void gsap.set(slide, { rotation: 0 }) });
  }, [reducedMotion]);
  useEasterEggs({ onSpin });

  // Reduced motion: stops change with a brief discrete crossfade (a paper veil), no travel animation.
  const activeStop = useWalkStore((s) => s.activeStop);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => onReady?.());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // first paint only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useWalk({ stageRef, progressRef, debugRef, reducedMotion, onFlick: setHiding });

  return (
    <div ref={stageRef} className="stage" tabIndex={-1} role="region" aria-label="Interactive story walk" data-rm={reducedMotion || undefined}>
      <Hud progressRef={progressRef} />
      <World progressRef={progressRef} tortoiseOverride={hiding ? "hide" : (eggPose ?? stopPose)} items={letter ? 6 : stick ? 5 : lantern ? 4 : map ? 3 : seeds ? 2 : leaf ? 1 : 0} tortoiseHandle={tortoiseHandle} onTortoiseClick={onTortoiseClick}>
        <StopHello progressRef={progressRef} onTortoise={setStopPose} />
        <StopAbout onTortoise={setStopPose} onLeaf={() => setLeaf(true)} />
        <StopSkills onTortoise={setStopPose} onSeeds={() => setSeeds(true)} />
        <StopProjects tortoise={tortoiseHandle} onMap={() => setMap(true)} />
        <StopExperience onLantern={() => setLantern(true)} />
        <StopFun onTortoise={setStopPose} onStick={() => setStick(true)} />
        <StopContact onTortoise={setStopPose} onLetter={() => setLetter(true)} tortoise={tortoiseHandle} />
      </World>
      {reducedMotion && <div key={activeStop} className="rm-veil" aria-hidden="true" />}
      <LiveRegion />
      <DebugOverlay ref={debugRef} />
    </div>
  );
}
