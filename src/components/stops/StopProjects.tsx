"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/a11y/reducedMotion";
import { useMedia } from "@/lib/useMedia";
import { useWalkStore } from "@/lib/walk/store";
import { hopTarget, ride } from "@/lib/walk/stones";
import { projects, projectsCopy, type Project } from "@/content/projects";
import { captions } from "@/content/captions";
import { site } from "@/content/site";
import type { TortoiseHandle } from "@/components/tortoise/Tortoise";
import { Button } from "./shared/Button";
import { Caption } from "./shared/Caption";
import { Tag } from "./shared/Tag";
import { SHEET_MQ, SheetBar } from "./shared/Sheet";

const NARROW = "(max-width: 639px)";
const HOP_S = 0.5;
const HOP_LIFT = 46; // design units

// The folded map goes into the satchel once per page load.
let mapGiven = false;

const goToStone = (i: number) => window.dispatchEvent(new CustomEvent("walk:goto-stone", { detail: i }));

const BLOCKS = [
  { key: "problem", label: "Problem" },
  { key: "approach", label: "What I did" },
  { key: "outcome", label: "Result" },
] as const;

function Links({ project }: { project: Project }) {
  const { live, repo, writeup } = project.links;
  if (!live && !repo && !writeup) return null;
  return (
    <div className="projects-links">
      {live && <Button href={live}>Live</Button>}
      {repo && <Button variant="secondary" href={repo}>Code</Button>}
      {writeup && <Button variant="secondary" href={writeup}>Write-up</Button>}
    </div>
  );
}

function ProjectBody({ project, narrow }: { project: Project; narrow: boolean }) {
  const [tab, setTab] = useState<(typeof BLOCKS)[number]["key"]>("problem");
  return (
    <>
      <h3 className="projects-title">{project.title}</h3>
      <p className="projects-meta mono">
        {project.role} · {project.year}
      </p>
      <p className="projects-liner">{project.oneLiner}</p>

      {narrow ? (
        <div className="projects-tabs">
          <div
            role="tablist"
            aria-label="Case study"
            onKeyDown={(e) => {
              const i = BLOCKS.findIndex((b) => b.key === tab);
              const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              const j = e.key === "Home" ? 0 : e.key === "End" ? BLOCKS.length - 1 : (i + step + BLOCKS.length) % BLOCKS.length;
              if (!step && e.key !== "Home" && e.key !== "End") return;
              e.preventDefault();
              e.stopPropagation();
              setTab(BLOCKS[j].key);
              document.getElementById(`case-tab-${BLOCKS[j].key}`)?.focus();
            }}
          >
            {BLOCKS.map((b) => (
              <button
                key={b.key}
                id={`case-tab-${b.key}`}
                role="tab"
                type="button"
                aria-selected={tab === b.key}
                aria-controls="case-panel"
                tabIndex={tab === b.key ? 0 : -1}
                onClick={() => setTab(b.key)}
              >
                {b.label}
              </button>
            ))}
          </div>
          <p id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${tab}`}>
            {project[tab]}
          </p>
        </div>
      ) : (
        <dl className="projects-blocks">
          {BLOCKS.map((b) => (
            <div key={b.key}>
              <dt>{b.label}</dt>
              <dd>{project[b.key]}</dd>
            </div>
          ))}
        </dl>
      )}

      {project.stack.length > 0 && (
        <div className="projects-stack" aria-label="Stack">
          {project.stack.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}

      {project.image && !narrow && (
        <figure className="projects-polaroid">
          <Image src={project.image} alt={project.imageAlt ?? `Screenshot of ${project.title}`} width={320} height={200} loading="lazy" />
        </figure>
      )}

      <Links project={project} />
    </>
  );
}

function MoreBody() {
  return (
    <>
      <h3 className="projects-title">{projectsCopy.moreTitle}</h3>
      <p className="projects-liner">{projectsCopy.moreBody}</p>
      <div className="projects-links">
        <Button href={site.github}>{projectsCopy.moreCta}</Button>
      </div>
    </>
  );
}

export function StopProjects({ tortoise, onMap }: { tortoise: RefObject<TortoiseHandle | null>; onMap: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const narrow = useMedia(NARROW);
  const index = useWalkStore((s) => s.stoneIndex);
  const cardOpen = useWalkStore((s) => s.cardOpen);
  const n = projects.length;
  const onStone = index >= 0 && index <= n;
  const show = onStone && cardOpen;
  const project = index >= 0 && index < n ? projects[index] : null;

  // The tortoise hops whenever the stone index changes: x linear, y a sine arc, squash/stretch on the body.
  useEffect(() => {
    const store = useWalkStore;
    let prev = store.getState().stoneIndex;
    let tl: gsap.core.Timeline | null = null;
    const unsub = store.subscribe((s) => {
      if (s.stoneIndex === prev) return;
      prev = s.stoneIndex;
      tl?.kill();
      if (prefersReducedMotion()) {
        ride.active = false;
        return;
      }
      const to = hopTarget(s.stoneIndex, s.stoneCount);
      ride.active = true;
      tl = gsap.timeline({
        onComplete: () => {
          ride.active = false;
        },
      });
      tl.to(ride, { x: to.x, y: to.y, duration: HOP_S, ease: "none" }, 0)
        .to(ride, { lift: HOP_LIFT, duration: HOP_S / 2, ease: "sine.out" }, 0)
        .to(ride, { lift: 0, duration: HOP_S / 2, ease: "sine.in" }, HOP_S / 2);
      tortoise.current?.hop({ arc: false, timeScale: 1.2 });
    });
    return () => {
      unsub();
      tl?.kill();
      ride.active = false;
    };
  }, [tortoise]);

  // Stones drop in on entering the stream; the folded map joins the satchel on the first arrival.
  useEffect(() => {
    const set = document.querySelector<HTMLElement>('[data-set="projects"]');
    if (set) {
      if (onStone || index > n) set.setAttribute("data-in", "");
      else set.removeAttribute("data-in");
    }
    if (onStone && !mapGiven) {
      mapGiven = true;
      onMap();
    }
  }, [index, n, onStone, onMap]);

  // Mobile: the card is a bottom sheet, so lift the scene to keep the stones in view.
  useEffect(() => {
    const world = rootRef.current?.closest<HTMLElement>(".world");
    if (!world) return;
    if (show) world.setAttribute("data-sheet", "");
    else world.removeAttribute("data-sheet");
    return () => world.removeAttribute("data-sheet");
  }, [show]);

  // Show / hide the card (Esc hides it but leaves the tortoise on its stone).
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

  // A fixed-height card never shifts layout; when text overflows it scrolls itself, not the walk.
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

  const announce = !onStone ? "" : project ? `Project ${index + 1} of ${n}: ${project.title}. ${project.oneLiner}` : projectsCopy.moreTitle;

  return (
    <>
      <div ref={rootRef} className="projects" data-stop="projects">
        <section ref={cardRef} className="projects-card paper-card sheet" data-card aria-labelledby="projects-title">
          <SheetBar id="projects" title="Stepping Stones" />
          <div className="projects-head">
            <Caption>{captions.projects}</Caption>
            <h2 id="projects-title" tabIndex={-1}>{projectsCopy.title}</h2>
            <p className="projects-intro">{projectsCopy.intro}</p>
            <p className="projects-count mono" aria-hidden="true">
              {index >= 0 ? `${Math.min(index + 1, n + 1)} / ${n + 1}` : ""}
            </p>
          </div>
          {/* key remounts the body, so the swap is a 200 ms crossfade and tab state resets */}
          <div key={Math.min(Math.max(index, 0), n)} className="projects-body">
            {project ? <ProjectBody project={project} narrow={narrow} /> : <MoreBody />}
          </div>
        </section>
      </div>

      {/* the one accessible description of the stones: every project in full, plus focusable stone buttons */}
      <section className="sr-only" aria-label="Projects">
        <div aria-live="polite" aria-atomic="true">
          {announce}
        </div>
        <ol>
          {projects.map((p, i) => (
            <li key={p.slug}>
              <button type="button" onClick={() => goToStone(i)}>
                {`Project ${i + 1} of ${n}: ${p.title}`}
              </button>
              <h3>{p.title}</h3>
              <p>
                {p.role}, {p.year}. {p.oneLiner}
              </p>
              <p>Problem: {p.problem}</p>
              <p>What I did: {p.approach}</p>
              <p>Result: {p.outcome}</p>
              <p>Stack: {p.stack.join(", ")}</p>
              {p.links.live && <a href={p.links.live} target="_blank" rel="noopener noreferrer">{p.title}, live site</a>}
              {p.links.repo && <a href={p.links.repo} target="_blank" rel="noopener noreferrer">{p.title}, code</a>}
              {p.links.writeup && <a href={p.links.writeup} target="_blank" rel="noopener noreferrer">{p.title}, write-up</a>}
            </li>
          ))}
          <li>
            <button type="button" onClick={() => goToStone(n)}>
              {projectsCopy.moreTitle}
            </button>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              {projectsCopy.moreCta}
            </a>
          </li>
        </ol>
      </section>
    </>
  );
}
