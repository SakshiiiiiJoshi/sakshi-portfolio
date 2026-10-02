import { gsap } from "gsap";

export const TORTOISE_STATES = ['idle', 'walk', 'peek', 'hide', 'wave', 'sleep'] as const;
export type TortoiseState = (typeof TORTOISE_STATES)[number];

/** Absolute viewBox pivots (GSAP `svgOrigin`). Keep in sync with the header in TortoiseSvg.tsx. */
export const PIVOTS = {
  body: "190 255",
  shell: "192 220",
  legBR: "108 214",
  legBL: "142 214",
  legFR: "272 214",
  legFL: "232 214",
  tail: "80 212",
  neck: "290 190",
  head: "335 180",
  eyelid: "372 164",
} as const;

export const ITEM_IDS = ['item-leaf', 'item-seeds', 'item-map', 'item-lantern', 'item-stick', 'item-letter'] as const;
const ITEM_PIVOTS = ["104 128", "115 126", "126 126", "137 128", "146 128", "152 140"];

export interface TortoiseRefs {
  svg: SVGSVGElement;
  body: SVGGElement;
  shell: SVGGElement[]; // shell-base, shell-pattern, backpack — move as one
  legs: { fr: SVGElement; fl: SVGElement; br: SVGElement; bl: SVGElement };
  tail: SVGElement;
  neck: SVGElement;
  head: SVGElement;
  eyelid: SVGElement;
  items: SVGElement[];
}

export interface Pose {
  /** Stops the pose and everything it spawned (no leaked tweens). */
  kill(): void;
  /** Walk only: 0.6–1.8× base cycle speed. */
  setSpeed?(multiplier: number): void;
}

export function getRefs(svg: SVGSVGElement): TortoiseRefs {
  const q = <T extends SVGElement>(id: string) => svg.querySelector<T>(`#${id}`)!;
  return {
    svg,
    body: q<SVGGElement>("body"),
    shell: ["shell-base", "shell-pattern", "backpack"].map((id) => q<SVGGElement>(id)),
    legs: { fr: q("leg-fr"), fl: q("leg-fl"), br: q("leg-br"), bl: q("leg-bl") },
    tail: q("tail"),
    neck: q("neck"),
    head: q("head"),
    eyelid: q("eyelid"),
    items: ITEM_IDS.map((id) => q(id)),
  };
}

const animated = (r: TortoiseRefs) => [
  r.body, ...r.shell, r.legs.fr, r.legs.fl, r.legs.br, r.legs.bl, r.tail, r.neck, r.head,
];

/** One-time baseline: eyelids open, backpack items hidden. */
export function initRig(r: TortoiseRefs) {
  gsap.set(r.eyelid, { scaleY: 0, svgOrigin: PIVOTS.eyelid });
  r.items.forEach((el, i) => gsap.set(el, { scale: 0, svgOrigin: ITEM_PIVOTS[i] }));
}

/** Tweens every animated part back to rest (the ~200 ms cross-fade between poses). */
export function relax(r: TortoiseRefs, duration = 0.2, onComplete?: () => void) {
  const rest = { x: 0, y: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1 };
  return gsap.timeline({ onComplete })
    .to(animated(r), { ...rest, duration, ease: "sine.out", overwrite: "auto" }, 0)
    .to(r.eyelid, { scaleY: 0, duration, ease: "sine.out", overwrite: "auto" }, 0);
}

const poseOf = (tl: gsap.core.Timeline, extra?: () => void, setSpeed?: Pose["setSpeed"]): Pose => ({
  kill() {
    tl.kill();
    extra?.();
  },
  setSpeed,
});

const blinkTween = (r: TortoiseRefs) =>
  gsap.timeline()
    .to(r.eyelid, { scaleY: 1, duration: 0.08, ease: "power1.in", svgOrigin: PIVOTS.eyelid })
    .to(r.eyelid, { scaleY: 0, duration: 0.14, ease: "power1.out" });

export function idle(r: TortoiseRefs): Pose {
  const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut", duration: 3.5 } })
    .to(r.shell, { scale: 1.015, svgOrigin: PIVOTS.shell }, 0)
    .to(r.head, { rotation: 3, svgOrigin: PIVOTS.head }, 0);
  let blink: gsap.core.Timeline | undefined;
  let timer: gsap.core.Tween | undefined;
  const schedule = () => {
    timer = gsap.delayedCall(3 + Math.random() * 2, () => {
      blink = blinkTween(r);
      schedule();
    });
  };
  schedule();
  return poseOf(tl, () => {
    timer?.kill();
    blink?.kill();
  });
}

export function walk(r: TortoiseRefs): Pose {
  const swing = (els: SVGElement[], origins: string[], from: number) => {
    els.forEach((el, i) => gsap.set(el, { rotation: from, svgOrigin: origins[i] }));
    return els;
  };
  const A = 18;
  // diagonal pairs: front-left + back-right vs front-right + back-left
  const pairA = swing([r.legs.fl, r.legs.br], [PIVOTS.legFL, PIVOTS.legBR], -A);
  const pairB = swing([r.legs.fr, r.legs.bl], [PIVOTS.legFR, PIVOTS.legBL], A);
  const upper = [...r.shell, r.neck, r.head];
  const tl = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } })
    .to(pairA, { rotation: A, duration: 0.45 }, 0)
    .to(pairB, { rotation: -A, duration: 0.45 }, 0)
    .to(pairA, { rotation: -A, duration: 0.45 }, 0.45)
    .to(pairB, { rotation: A, duration: 0.45 }, 0.45)
    // two bobs per cycle (a step each time a pair lands)
    .to(upper, { y: -2, duration: 0.225, repeat: 3, yoyo: true }, 0)
    .to(r.head, { rotation: 1, svgOrigin: PIVOTS.head, duration: 0.45, repeat: 1, yoyo: true }, 0);
  return poseOf(tl, undefined, (m) => {
    tl.timeScale(gsap.utils.clamp(0.6, 1.8, m));
  });
}

export function peek(r: TortoiseRefs): Pose {
  const tl = gsap.timeline()
    .to(r.neck, { scaleX: 1.12, svgOrigin: PIVOTS.neck, duration: 0.45, ease: "back.out(1.4)" }, 0)
    .to(r.head, { x: 7, rotation: -6, svgOrigin: PIVOTS.head, duration: 0.45, ease: "back.out(1.4)" }, 0);
  return poseOf(tl);
}

export function hide(r: TortoiseRefs): Pose {
  const inward = "190 215";
  const parts = [r.legs.fr, r.legs.fl, r.legs.br, r.legs.bl, r.tail];
  const tl = gsap.timeline({ defaults: { ease: "power2.in" } })
    .to(r.eyelid, { scaleY: 1, duration: 0.15, svgOrigin: PIVOTS.eyelid }, 0)
    .to([r.head, r.neck], { scale: 0.2, svgOrigin: "300 190", duration: 0.4 }, 0.05)
    .to(parts, { scale: 0.2, svgOrigin: inward, duration: 0.4 }, 0.05)
    .to([r.head, r.neck, ...parts], { opacity: 0, duration: 0.15 }, 0.3)
    .to(r.shell, { rotation: 3, svgOrigin: PIVOTS.shell, duration: 0.1, ease: "sine.inOut" }, 0.45)
    .to(r.shell, { rotation: -3, duration: 0.14, ease: "sine.inOut", repeat: 3, yoyo: true }, 0.55)
    .to(r.shell, { rotation: 0, duration: 0.12, ease: "sine.out" });
  return poseOf(tl);
}

/** Reverse of `hide`: parts grow back out of the shell. */
export function unhide(r: TortoiseRefs): Pose {
  const parts = [r.legs.fr, r.legs.fl, r.legs.br, r.legs.bl, r.tail];
  const tl = gsap.timeline({ defaults: { ease: "back.out(1.6)" } })
    .to([r.head, r.neck, ...parts], { opacity: 1, scale: 1, duration: 0.4 }, 0)
    .to(r.eyelid, { scaleY: 0, duration: 0.15, ease: "power1.out" }, 0.25);
  return poseOf(tl);
}

export function wave(r: TortoiseRefs): Pose {
  gsap.set(r.legs.fr, { rotation: 0, svgOrigin: PIVOTS.legFR });
  const tl = gsap.timeline()
    .to(r.legs.fr, { rotation: -65, duration: 0.35, ease: "power2.out" })
    .to(r.legs.fr, { rotation: -40, duration: 0.3, ease: "sine.inOut", repeat: -1, yoyo: true });
  return poseOf(tl);
}

export function sleep(r: TortoiseRefs): Pose {
  const tl = gsap.timeline()
    .to(r.eyelid, { scaleY: 1, duration: 0.4, svgOrigin: PIVOTS.eyelid }, 0)
    .to([r.head], { y: 8, duration: 0.6, ease: "sine.inOut" }, 0)
    .to(r.shell, { scale: 1.02, svgOrigin: PIVOTS.shell, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true }, 0.6);
  return poseOf(tl);
}

/**
 * One-shot jump on the whole body (squash → stretch → land). Not a persistent state. With `arc: false`
 * the caller moves the tortoise itself (Stepping Stones) and only the squash/stretch plays here.
 */
export function hop(r: TortoiseRefs, { arc = true, timeScale = 1 }: { arc?: boolean; timeScale?: number } = {}): gsap.core.Timeline {
  return gsap.timeline()
    .to(r.body, { scaleY: 0.92, scaleX: 1.04, svgOrigin: PIVOTS.body, duration: 0.12, ease: "power1.out" })
    .to(r.body, { scaleY: 1.06, scaleX: 0.97, ...(arc ? { y: -34 } : {}), duration: 0.2, ease: "power2.out" })
    .to(r.body, { scaleY: 0.94, scaleX: 1.03, ...(arc ? { y: 0 } : {}), duration: 0.14, ease: "power2.in" })
    .to(r.body, { scaleY: 1, scaleX: 1, duration: 0.14, ease: "elastic.out(1, 0.5)" })
    .timeScale(timeScale);
}

export const POSES: Record<TortoiseState, (r: TortoiseRefs) => Pose> = {
  idle, walk, peek, hide, wave, sleep,
};
