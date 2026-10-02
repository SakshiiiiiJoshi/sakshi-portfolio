"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { rng, tuftPath } from "@/lib/walk/art";
import { DESIGN_W, WORLD_W, anchorFraction } from "@/lib/walk/constants";
import { pathYAt } from "@/lib/walk/path";
import { useWalkStore } from "@/lib/walk/store";
import { formatMonth, signAnchor, trailRoles } from "@/lib/walk/trail";

/**
 * Stop 5 set piece: wooden signposts up the climb, oldest at the bottom. Sign x comes from
 * `signAnchor` (camera-aware), y from the path table at the live `--anchor-x`, so signs stand on the
 * ground at any viewport; the effect re-seats them on resize without React state. The art is
 * aria-hidden: StopExperience renders the accessible list; mouse/touch clicks just glide the walk
 * to that sign. Motion is CSS (`.trail-*` in globals.css); `data-up` raises a sign.
 */
const X0 = -1400; // svg viewBox origin (set-local units; x = 0 is the tortoise at the stop)
const VB_W = 3200;
const PINES = [-1150, -640, -120, 420, 900, 1400];

function Pine({ x, s, tint }: { x: number; s: number; tint: string }) {
  return (
    <g data-ax={x} data-lean="0" data-sink="6">
      <g transform={`scale(${s})`}>
        <rect x="-7" y="-46" width="14" height="48" rx="3" fill="var(--plum)" stroke="var(--forest)" strokeWidth="2.5" />
        <path d="M0 -190 L46 -92 H22 L56 -34 H-56 L-22 -92 H-46 Z" fill="var(--moss)" stroke="var(--forest)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M0 -190 L30 -118 L10 -112 L30 -62 L12 -60 L2 -150Z" fill={tint} opacity="0.6" />
      </g>
    </g>
  );
}

export function ExperienceSet() {
  const roles = trailRoles();
  const m = roles.length;
  const svgRef = useRef<SVGSVGElement>(null);
  const roleIndex = useWalkStore((s) => s.roleIndex);
  const activeStop = useWalkStore((s) => s.activeStop);
  const passed = roleIndex < 0 && (activeStop === "experience" || activeStop === "fun" || activeStop === "contact");

  // Seat everything on the ground for the live anchor x (and again on resize).
  useEffect(() => {
    const svg = svgRef.current;
    const world = svg?.closest<HTMLElement>(".world");
    if (!svg || !world) return;
    const seat = () => {
      const raw = parseFloat(getComputedStyle(world).getPropertyValue("--anchor-x"));
      const anchorX = Number.isFinite(raw) ? raw : anchorFraction(DESIGN_W) * DESIGN_W;
      svg.querySelectorAll<SVGGElement>("[data-sign]").forEach((g) => {
        const i = Number(g.dataset.sign);
        const { x, y } = signAnchor(i, m, anchorX);
        g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${g.dataset.lean})`);
      });
      svg.querySelectorAll<SVGGElement>("[data-ax]").forEach((g) => {
        const x = Number(g.dataset.ax);
        const y = pathYAt(0.66 * WORLD_W + anchorX + x) + Number(g.dataset.sink ?? 0);
        g.setAttribute("transform", `translate(${x} ${y.toFixed(1)}) rotate(${g.dataset.lean ?? 0})`);
      });
    };
    seat();
    const ro = new ResizeObserver(seat);
    ro.observe(world);
    return () => ro.disconnect();
  }, [m]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      viewBox={`${X0} 0 ${VB_W} 900`}
      style={{
        position: "absolute",
        left: `calc(var(--s) * ${X0}px)`,
        bottom: 0,
        width: `calc(var(--s) * ${VB_W}px)`,
        height: "calc(var(--s) * 900px)",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      {PINES.map((x, i) => (
        <Pine key={x} x={x} s={0.9 + (i % 3) * 0.18} tint="var(--honey)" />
      ))}

      {roles.map((role, i) => {
        const r = rng(9100 + i);
        const lean = (r() - 0.5) * 7;
        const flip = r() > 0.5 ? 1 : -1;
        const newest = i === m - 1;
        const up = roleIndex >= i - 1 || passed;
        const range = `${formatMonth(role.start)} – ${role.end === "Present" ? "Now" : formatMonth(role.end)}`;
        return (
          <g key={`${role.company}-${role.start}`} data-sign={i} data-lean={lean.toFixed(2)} transform={`translate(${200 + i * 220} 700) rotate(${lean.toFixed(2)})`}>
            <ellipse className="shadow-ellipse" style={{ "--base": 0.16 } as CSSProperties} cx="-80" cy="2" rx="110" ry="9" fill="var(--forest)" />
            <g className="trail-sign" data-up={up ? "" : undefined} data-now={newest ? "" : undefined} data-active={roleIndex === i ? "" : undefined} onClick={() => window.dispatchEvent(new CustomEvent("walk:goto-role", { detail: i }))} style={{ pointerEvents: "auto", cursor: "pointer" }}>
              <path d={tuftPath(5, 26, 40 + i)} transform="translate(-14 4)" fill="var(--moss)" stroke="var(--forest)" strokeWidth="2" />
              <rect x="-7" y="-150" width="14" height="152" rx="4" fill="#9A6B3F" stroke="var(--forest)" strokeWidth="2.5" />
              {newest && <circle className="trail-glow" cx="0" cy="-118" r="86" fill="var(--honey)" opacity="0.28" />}
              <g transform={`translate(0 -118) scale(${flip} 1)`}>
                <rect x="-96" y="-30" width="192" height="56" rx="8" fill="var(--paper)" stroke="var(--forest)" strokeWidth="2.5" />
                <path d="M-88 -22 H88" stroke="var(--honey)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              </g>
              <text x="0" y="-122" textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize="17" fontWeight="700" fill="var(--ink)">
                {role.company.length > 17 ? `${role.company.slice(0, 16)}…` : role.company}
              </text>
              <text x="0" y="-102" textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize="13" fill="var(--forest)">
                {range}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
