"use client";

import { useEffect } from "react";
import { skills } from "@/content/skills";
import { useMedia } from "@/lib/useMedia";
import { BEDS, MAX_SKILLS, hashName, plantKind, skillsByBed, trimBed } from "@/lib/skillsGarden";
import { useWalkStore } from "@/lib/walk/store";
import { Plant, plantHeight } from "./Plant";

/**
 * Stop 3 set piece: a low wicker fence with an open gate at the tortoise (viewBox x=700), five
 * plant beds + a Learning bed in front of it, hand-lettered signs, a dripping watering can and a
 * slow bee. Every plant comes from `skills.ts`. The art is aria-hidden: StopSkills renders the one
 * accessible list, and this layer only mirrors hover/tap into the walk store (`activeSkill`).
 * Animation is CSS transform/opacity (see `.skills-*`, `.plant-*` in globals.css).
 */
const NARROW = "(max-width: 639px)";
const MAX_PER_BED_NARROW = 3;
const GROUND = 792; // bed baseline
const FENCE_BASE = 652; // behind the path ribbon
const SPACING = 26;

function Fence({ from, to }: { from: number; to: number }) {
  const posts: number[] = [];
  for (let x = from; x <= to; x += 26) posts.push(x);
  return (
    <g stroke="var(--forest)" strokeWidth="2.5" strokeLinejoin="round" fill="var(--honey-soft)">
      {posts.map((x, i) => (
        <path key={x} d={`M${x} ${FENCE_BASE} V${FENCE_BASE - 38 - (i % 3) * 2} Q${x + 6} ${FENCE_BASE - 46 - (i % 3) * 2} ${x + 12} ${FENCE_BASE - 38 - (i % 3) * 2} V${FENCE_BASE}Z`} />
      ))}
      <rect x={from - 4} y={FENCE_BASE - 28} width={to - from + 20} height="7" rx="3" fill="var(--paper-dim)" />
      <rect x={from - 4} y={FENCE_BASE - 12} width={to - from + 20} height="7" rx="3" fill="var(--paper-dim)" />
    </g>
  );
}

function Sign({ x, label }: { x: number; label: string }) {
  return (
    <g transform={`translate(${x} ${GROUND + 18})`} stroke="var(--forest)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M-32 -6 V16 M32 -6 V16" fill="none" />
      <rect x="-56" y="-16" width="112" height="28" rx="6" fill="var(--honey-soft)" />
      <text textAnchor="middle" y="4" fill="var(--forest)" stroke="none" fontSize="19" style={{ fontFamily: "var(--font-hand)" }}>
        {label}
      </text>
    </g>
  );
}

export function SkillsSet() {
  const narrow = useMedia(NARROW);
  const active = useWalkStore((s) => s.activeSkill);
  const byBed = skillsByBed();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && skills.length > MAX_SKILLS) {
      console.warn(`[skills] ${skills.length} skills exceeds the garden limit of ${MAX_SKILLS}; beds will look crowded.`);
    }
  }, []);

  const set = useWalkStore.getState().setActiveSkill;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 900"
      style={{
        position: "absolute",
        left: "calc(var(--s) * -700px)",
        bottom: 0,
        width: "calc(var(--s) * 1000px)",
        height: "calc(var(--s) * 900px)",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      {/* wicker fence with an open gate where the tortoise walks through */}
      <Fence from={160} to={626} />
      <Fence from={778} to={1300} />
      <g stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <rect x="632" y={FENCE_BASE - 58} width="14" height="64" rx="4" fill="var(--honey)" />
        <rect x="754" y={FENCE_BASE - 58} width="14" height="64" rx="4" fill="var(--honey)" />
        <path d={`M646 ${FENCE_BASE - 40} L600 ${FENCE_BASE - 34} V${FENCE_BASE - 6} L646 ${FENCE_BASE - 8}Z`} fill="var(--paper-dim)" strokeWidth="2.5" />
        <path d={`M754 ${FENCE_BASE - 40} L800 ${FENCE_BASE - 34} V${FENCE_BASE - 6} L754 ${FENCE_BASE - 8}Z`} fill="var(--paper-dim)" strokeWidth="2.5" />
      </g>

      {BEDS.map((bed) => {
        const list = trimBed(byBed[bed.id], narrow ? MAX_PER_BED_NARROW : Infinity);
        const step = list.length > 1 ? Math.min(SPACING, 120 / (list.length - 1)) : 0;
        return (
          <g key={bed.id} data-bed={bed.id}>
            <ellipse cx={bed.x} cy={GROUND + 4} rx="82" ry="14" fill="color-mix(in srgb, var(--coral) 28%, var(--ink))" stroke="var(--forest)" strokeWidth="2.5" />
            <ellipse cx={bed.x} cy={GROUND} rx="70" ry="9" fill="color-mix(in srgb, var(--coral) 18%, var(--ink))" />
            {list.map((skill, i) => {
              const px = bed.x + (i - (list.length - 1) / 2) * step;
              const kind = plantKind(skill);
              const learning = !!skill.learning;
              const ph = plantHeight(kind, skill.level, learning);
              const isActive = active === skill.name;
              return (
                <g key={skill.name} transform={`translate(${px.toFixed(1)} ${GROUND})`} data-skill={skill.name} data-active={isActive ? "" : undefined}>
                  <ellipse className="plant-halo" cx="0" cy={-ph / 2} rx="28" ry={ph / 2 + 10} fill="var(--honey)" />
                  <Plant kind={kind} level={skill.level} learning={learning} seed={hashName(skill.name)} index={BEDS.indexOf(bed) * 5 + i} />
                  <rect
                    className="plant-hit"
                    x="-16"
                    y={-ph - 4}
                    width="32"
                    height={ph + 14}
                    fill="transparent"
                    style={{ pointerEvents: "all", cursor: "pointer" }}
                    onPointerEnter={(e) => e.pointerType === "mouse" && set({ name: skill.name, group: skill.group })}
                    onPointerLeave={(e) => e.pointerType === "mouse" && set(null)}
                    onClick={(e) => {
                      // mouse hover already handled; touch/pen taps toggle
                      if ((e.nativeEvent as PointerEvent).pointerType === "mouse") return;
                      set(useWalkStore.getState().activeSkill === skill.name ? null : { name: skill.name, group: skill.group });
                    }}
                  />
                </g>
              );
            })}
            <Sign x={bed.x} label={bed.label} />
          </g>
        );
      })}

      {/* watering can by the Learning bed: a drop every few seconds */}
      <g transform={`translate(${BEDS[5].x + 112} ${GROUND - 22})`} stroke="var(--forest)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        <g transform="rotate(-14)">
          <path d="M-14 -22 C-24 -34 -4 -40 8 -30" fill="none" />
          <path d="M-18 -18 H12 L10 16 H-16Z" fill="var(--mist-deep)" />
          <path d="M-18 -4 L-44 -22 L-40 -28 L-16 -12Z" fill="var(--mist-deep)" />
          <rect x="-48" y="-32" width="12" height="9" rx="3" fill="var(--coral)" transform="rotate(30 -44 -26)" />
        </g>
        {[0, 1, 2].map((i) => (
          <circle key={i} className="skills-drip" cx="-46" cy="-8" r="3" fill="var(--mist)" strokeWidth="1.5" style={{ animationDelay: `${i * 1.3}s` }} />
        ))}
      </g>

      {/* a bee on a slow loop above the Tools / Practices beds */}
      <g className="skills-bee">
        <g className="skills-bee-wings">
          <ellipse cx="-3" cy="-9" rx="5" ry="3.4" fill="var(--paper)" stroke="var(--forest)" strokeWidth="1.5" />
          <ellipse cx="4" cy="-9" rx="5" ry="3.4" fill="var(--paper)" stroke="var(--forest)" strokeWidth="1.5" />
        </g>
        <ellipse cx="0" cy="0" rx="9" ry="6" fill="var(--honey)" stroke="var(--forest)" strokeWidth="2" />
        <path d="M-2 -5 V5 M3 -5 V5" stroke="var(--forest)" strokeWidth="2.2" />
      </g>
    </svg>
  );
}
