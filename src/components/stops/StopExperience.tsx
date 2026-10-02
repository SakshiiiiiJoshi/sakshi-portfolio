"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/a11y/reducedMotion";
import { useMedia } from "@/lib/useMedia";
import { useWalkStore } from "@/lib/walk/store";
import { formatDuration, formatMonth, trailRoles } from "@/lib/walk/trail";
import { experienceCopy } from "@/content/experience";
import { captions } from "@/content/captions";
import { Caption } from "./shared/Caption";
import { Tag } from "./shared/Tag";
import { SHEET_MQ, SheetBar } from "./shared/Sheet";

const NARROW = "(max-width: 639px)";
const ANNOUNCE_MS = 250;

// The lantern goes into the satchel once per page load.
let lanternGiven = false;

const goToRole = (i: number) => window.dispatchEvent(new CustomEvent("walk:goto-role", { detail: i }));

export function StopExperience({ onLantern }: { onLantern: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const narrow = useMedia(NARROW);
  const roles = trailRoles();
  const m = roles.length;
  const index = useWalkStore((s) => s.roleIndex);
  const cardOpen = useWalkStore((s) => s.cardOpen);
  const on = index >= 0 && index < m;
  const show = on && cardOpen;
  const role = on ? roles[index] : null;
  const [announce, setAnnounce] = useState("");

  // Lantern on first arrival.
  useEffect(() => {
    if (on && !lanternGiven) {
      lanternGiven = true;
      onLantern();
    }
  }, [on, onLantern]);

  // Throttle the live-region text to settle events, not mid-scrub.
  useEffect(() => {
    const t = setTimeout(
      () => setAnnounce(role ? `Role ${index + 1} of ${m}: ${role.role} at ${role.company}. ${role.summary}` : ""),
      ANNOUNCE_MS,
    );
    return () => clearTimeout(t);
  }, [index, m, role]);

  // Mobile: the card is a bottom sheet, so lift the scene.
  useEffect(() => {
    const world = rootRef.current?.closest<HTMLElement>(".world");
    if (!world) return;
    if (show) world.setAttribute("data-sheet", "");
    else world.removeAttribute("data-sheet");
    return () => world.removeAttribute("data-sheet");
  }, [show]);

  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    const reduced = prefersReducedMotion();
    gsap.to(root, { autoAlpha: show ? 1 : 0, duration: reduced ? 0.15 : show ? 0.4 : 0.3, ease: "power2.out", overwrite: true });
    if (!reduced) gsap.fromTo(card, { y: show ? 24 : 0 }, { y: show ? 0 : -24, duration: 0.5, ease: "power2.out", overwrite: true });
  }, [show]);

  useEffect(() => {
    const close = () => useWalkStore.getState().setCardOpen(false);
    window.addEventListener("walk:close-card", close);
    return () => window.removeEventListener("walk:close-card", close);
  }, []);

  // Fixed-height card never shifts layout; overflowing text scrolls the card, not the walk.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const check = () => {
      if (card.scrollHeight > card.clientHeight + 1) card.setAttribute("data-scroll-region", "");
      else if (!window.matchMedia(SHEET_MQ).matches) card.removeAttribute("data-scroll-region"); // sheets stay a scroll region
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(card);
    return () => ro.disconnect();
  }, [index, narrow]);

  const shown = role ?? roles[Math.min(Math.max(index, 0), m - 1)];
  const isNow = shown?.end === "Present";
  const duration = shown ? formatDuration(shown.start, shown.end) : null;

  return (
    <>
      <div ref={rootRef} className="experience" data-stop="experience">
        {shown && (
          <section ref={cardRef} className="experience-card paper-card sheet" data-card data-now={isNow ? "" : undefined} aria-labelledby="experience-title">
            <SheetBar id="experience" title="Experience" />
            <svg className="experience-rope" viewBox="0 0 70 24" aria-hidden="true" fill="none" stroke="var(--forest)" strokeWidth="3" strokeLinecap="round">
              <path d="M8 22 Q35 -2 62 22" />
              <circle cx="35" cy="6" r="4" fill="var(--honey)" />
            </svg>
            <div className="experience-main">
              <Caption>{captions.experience}</Caption>
              <h2 id="experience-title" tabIndex={-1}>{experienceCopy.title}</h2>
              {/* key remounts the body: 200 ms crossfade on role change */}
              <div key={index} className="experience-body">
                <h3 className="experience-title">{shown.company}</h3>
                <p className="experience-role">{shown.role}</p>
                <p className="experience-meta mono">
                  {formatMonth(shown.start)} – {isNow ? experienceCopy.now : formatMonth(shown.end)}
                  {duration ? ` · ${duration}` : ""}
                </p>
                <p className="experience-summary">{shown.summary}</p>
                {shown.wins.length > 0 && (
                  <ul className="experience-wins">
                    {shown.wins.slice(0, 3).map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
                {shown.stack && shown.stack.length > 0 && (
                  <div className="experience-stack" aria-label="Stack">
                    {shown.stack.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="experience-dots" aria-hidden="true">
              {roles.map((r, i) => (
                <button key={`${r.company}-${r.start}`} type="button" tabIndex={-1} aria-current={i === index} title={r.company} onClick={() => goToRole(i)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* accessible description: every role in full, newest first (as a résumé reads), plus focusable sign buttons */}
      <section className="sr-only" aria-label="Experience">
        <div aria-live="polite" aria-atomic="true">
          {announce}
        </div>
        <ol>
          {[...roles].reverse().map((r, rev) => {
            const i = m - 1 - rev;
            const d = formatDuration(r.start, r.end);
            return (
              <li key={`${r.company}-${r.start}`}>
                <button type="button" onClick={() => goToRole(i)}>
                  {`Role ${i + 1} of ${m}: ${r.role} at ${r.company}`}
                </button>
                <h3>{r.company}</h3>
                <p>
                  {r.role}, {formatMonth(r.start)} to {r.end === "Present" ? "present" : formatMonth(r.end)}
                  {d ? ` (${d})` : ""}. {r.summary}
                </p>
                <ul>
                  {r.wins.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                {r.stack && <p>Stack: {r.stack.join(", ")}</p>}
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
