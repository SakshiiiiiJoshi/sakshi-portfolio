"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/a11y/reducedMotion";
import { useMedia } from "@/lib/useMedia";
import { arrivedByKeyboard, register } from "@/lib/walk/timeline";
import { toggleMode } from "@/lib/walk/mode";
import { contactCopy, emailParts, emitCta, type CtaType } from "@/content/contact";
import { captions } from "@/content/captions";
import { site } from "@/content/site";
import type { TortoiseState } from "@/components/tortoise/poses";
import type { TortoiseHandle } from "@/components/tortoise/Tortoise";
import { Bubble } from "./shared/Bubble";
import { Button } from "./shared/Button";
import { Caption } from "./shared/Caption";
import { Tag } from "./shared/Tag";
import { SheetBar } from "./shared/Sheet";

const NARROW = "(max-width: 639px)";
const SLEEP_MS = 20_000;
const COPIED_MS = 2000;
/** Re-entry plays at this fraction of the first-visit durations. */
const REPLAY = 0.6;
const WAKE_EVENTS = ["keydown", "wheel", "pointerdown", "touchstart"] as const;

// The journey-complete sparkle plays once per page load.
let sparkled = false;

export function StopContact({
  onTortoise,
  onLetter,
  tortoise,
}: {
  /** Pose the Contact stop wants the tortoise in (null = let the walk engine decide). */
  onTortoise: (pose: TortoiseState | null) => void;
  /** Called on arrival: the letter goes into the satchel (item six). */
  onLetter: () => void;
  tortoise: RefObject<TortoiseHandle | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const narrow = useMedia(NARROW);
  const [active, setActive] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addr, setAddr] = useState("");
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const zzzRef = useRef<HTMLDivElement>(null);

  const revealAddr = () => {
    const { user, host } = emailParts();
    setAddr(`${user}@${host}`);
  };

  const cta = (type: CtaType) => () => emitCta(type);

  const sayHello = () => {
    emitCta("email");
    const { user, host } = emailParts();
    window.location.href = `mailto:${user}@${host}`;
  };

  const copyEmail = async () => {
    emitCta("copy");
    const { user, host } = emailParts();
    try {
      await navigator.clipboard.writeText(`${user}@${host}`);
    } catch {
      revealAddr(); // no clipboard access: the address is shown so it can be copied by hand
      return;
    }
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  const walkBack = () => window.dispatchEvent(new CustomEvent("walk:goto", { detail: { id: "hello", duration: 5 } }));
  const skipToStatic = () => toggleMode("static");

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  useGSAP(
    (_ctx, contextSafe) => {
      const root = rootRef.current;
      if (!root || !contextSafe) return;
      const card = root.querySelector<HTMLElement>("[data-card]");
      const caption = root.querySelector<HTMLElement>("[data-caption]");
      const bubble = root.querySelector<HTMLElement>("[data-bubble]");
      const moon = root.querySelector<HTMLElement>("[data-moonlight]");
      const kids = root.querySelectorAll<HTMLElement>("[data-kid]");
      const title = root.querySelector<HTMLElement>("#contact-title");
      const isReduced = prefersReducedMotion();

      let tl: gsap.core.Timeline | null = null;
      let sleepTimer: ReturnType<typeof setTimeout> | undefined;
      let wakeTimer: ReturnType<typeof setTimeout> | undefined;
      let asleep = false;
      let listening = false;
      let settledAt = false;

      const clearTimers = () => {
        clearTimeout(sleepTimer);
        clearTimeout(wakeTimer);
      };

      const armSleep = () => {
        clearTimeout(sleepTimer);
        if (isReduced) return; // sleep is an animated pose; reduced motion keeps the single wave
        sleepTimer = setTimeout(() => {
          asleep = true;
          const slide = document.querySelector<HTMLElement>("[data-tortoise-slide]");
          const z = zzzRef.current;
          if (slide && z) {
            const r = slide.getBoundingClientRect();
            z.style.left = `${r.right - r.width * 0.25}px`;
            z.style.top = `${r.top - 4}px`;
          }
          setSleeping(true);
          onTortoise("sleep");
        }, SLEEP_MS);
      };

      // Any input wakes the tortoise (peek, then back to the wave) and restarts the 20 s clock.
      const onInput = () => {
        if (!settledAt) return;
        if (!asleep) {
          armSleep();
          return;
        }
        asleep = false;
        setSleeping(false);
        onTortoise("peek");
        clearTimeout(wakeTimer);
        wakeTimer = setTimeout(() => {
          onTortoise("wave");
          armSleep();
        }, 900);
      };
      const listen = () => {
        if (listening) return;
        listening = true;
        WAKE_EVENTS.forEach((e) => window.addEventListener(e, onInput, true));
      };
      const unlisten = () => {
        if (!listening) return;
        listening = false;
        WAKE_EVENTS.forEach((e) => window.removeEventListener(e, onInput, true));
      };

      gsap.set(root, { autoAlpha: 0 });

      const enter = contextSafe(() => {
        tl?.kill();
        clearTimers();
        gsap.killTweensOf(root);
        const k = sparkled ? REPLAY : 1;
        setActive(true);
        onLetter();
        settledAt = true;
        listen();

        if (isReduced) {
          gsap.set([card, caption, moon, bubble, ...kids], { autoAlpha: 1, y: 0 });
          gsap.to(root, { autoAlpha: 1, duration: 0.15, overwrite: true });
          onTortoise("idle");
          tortoise.current?.waveOnce();
        } else {
          gsap.set(root, { autoAlpha: 1 });
          gsap.set(card, { autoAlpha: 0, y: 24 });
          gsap.set(kids, { autoAlpha: 0, y: 10 });
          gsap.set([caption, bubble], { autoAlpha: 0 });
          const cardAt = 0.7 * k;
          tl = gsap.timeline();
          tl.to(moon, { autoAlpha: 1, duration: 0.8 * k, ease: "power1.out" }, 0)
            .to(caption, { autoAlpha: 1, duration: 0.6 * k }, 0)
            .call(() => onTortoise("peek"), undefined, 0.1)
            .call(() => onTortoise("wave"), undefined, 0.5 * k)
            .to(card, { autoAlpha: 1, y: 0, duration: 0.7 * k, ease: "power2.out" }, cardAt)
            .to(kids, { autoAlpha: 1, y: 0, duration: 0.5 * k, stagger: 0.075 * k, ease: "power2.out" }, cardAt + 0.2 * k)
            .to(bubble, { autoAlpha: 1, duration: 0.5 * k }, cardAt + 1.4 * k);
          if (!sparkled) tl.call(() => tortoise.current?.sparkle(), undefined, cardAt + 1.2);
          armSleep();
        }
        sparkled = true;

        if (arrivedByKeyboard()) title?.focus({ preventScroll: true });
      });

      const exit = contextSafe(() => {
        tl?.kill();
        clearTimers();
        unlisten();
        asleep = false;
        settledAt = false;
        setSleeping(false);
        setActive(false);
        onTortoise(null);
        gsap.to(root, {
          autoAlpha: 0,
          y: isReduced ? 0 : 24,
          duration: isReduced ? 0.15 : 0.35,
          ease: "power2.in",
          overwrite: true,
        });
        gsap.set(root, { y: 0, delay: 0.4 });
      });

      const unregister = register("contact", { enter, exit });
      return () => {
        unregister();
        tl?.kill();
        clearTimers();
        unlisten();
        onTortoise(null);
      };
    },
    { scope: rootRef, dependencies: [] },
  );

  // Mobile: the card is a bottom sheet, so lift the scene.
  useEffect(() => {
    const world = rootRef.current?.closest<HTMLElement>(".world");
    if (!world) return;
    if (active && narrow) world.setAttribute("data-sheet", "");
    else world.removeAttribute("data-sheet");
    return () => world.removeAttribute("data-sheet");
  }, [active, narrow]);

  const year = new Date().getFullYear();

  return (
    <div ref={rootRef} className="contact" data-stop="contact">
      <div className="contact-moonlight" data-moonlight aria-hidden="true" />

      <section className="contact-card paper-card sheet" data-variant="night" data-card aria-labelledby="contact-title">
        <SheetBar id="contact" title="Say hello" />
        <div data-caption>
          <Caption className="text-honey-soft">{captions.contact}</Caption>
        </div>
        <h2 id="contact-title" tabIndex={-1} className="!text-paper">
          {contactCopy.title}
        </h2>
        <p className="contact-body" data-kid>
          {contactCopy.body}
        </p>
        <div className="contact-chip-row" data-kid>
          <Tag variant="night">
            <span className="contact-dot" aria-hidden="true" />
            {site.availability}
          </Tag>
          <p className="contact-reply hand">{contactCopy.replyTime}</p>
        </div>

        <div className="contact-actions-wrap" data-kid>
          <div className="contact-actions" onMouseEnter={revealAddr} onPointerDown={revealAddr} onFocus={revealAddr}>
            <Button variant="night-primary" onClick={sayHello} aria-label={`Email ${site.name}`}>
              {contactCopy.say}
            </Button>
            <Button variant="night-secondary" onClick={copyEmail}>
              {contactCopy.copy}
            </Button>
            {/* visible confirmation; the status role announces it to screen readers */}
            <span className="contact-copied" role="status">
              {copied ? contactCopy.copied : ""}
            </span>
          </div>
          <p className="contact-addr" aria-hidden="true">
            {addr}
          </p>
        </div>

        <div className="contact-actions" data-kid>
          <Button variant="night-secondary" href={site.resumePdf} download onClick={cta("resume")}>
            {contactCopy.resume}
            <span className="ml-2 font-mono text-[0.8em] font-medium opacity-85">{contactCopy.resumeSize}</span>
          </Button>
          <Button variant="night-secondary" href={site.github} onClick={cta("github")}>
            {contactCopy.github}
          </Button>
          <Button variant="night-secondary" href={site.linkedin} onClick={cta("linkedin")}>
            {contactCopy.linkedin}
          </Button>
        </div>

        <div className="contact-foot" data-kid>
          <span>{contactCopy.footer(year)}</span>
          <span>
            <button type="button" onClick={walkBack}>
              {contactCopy.walkBack}
            </button>
            {" · "}
            <button type="button" onClick={skipToStatic}>
              {contactCopy.skip}
            </button>
          </span>
        </div>
      </section>

      <div className="contact-bubble" data-bubble>
        <Bubble tail="left" variant="night">
          {contactCopy.bubble}
        </Bubble>
      </div>

      {/* decorative "z z z" while the tortoise sleeps */}
      <div ref={zzzRef} className="contact-zzz" data-on={sleeping ? "" : undefined} style={{ opacity: sleeping ? undefined : 0 }} aria-hidden="true">
        z z z
      </div>
    </div>
  );
}
