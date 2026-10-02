"use client";

import { useEffect, useRef } from "react";
import { rng } from "@/lib/walk/art";
import { DESIGN_W, WORLD_W, anchorFraction } from "@/lib/walk/constants";
import { pathYAt } from "@/lib/walk/path";
import { useWalkStore } from "@/lib/walk/store";

/**
 * Stop 7 set piece: a moonlit pond beside the path end, a wooden dock with a mailbox, the far "deploy
 * tower" lighthouse and reeds. Everything is aria-hidden (StopContact holds the accessible copy).
 * Animation is CSS transform/opacity only (`.contact-*` in globals.css), gated on `data-lit`, and
 * paused while the tab is hidden. The pond's ripple is ONE displacement filter on ONE small element
 * (the moon reflection), static; the shimmer itself is transform-driven. Drop `#contact-ripple` if fps dips.
 */
const X0 = -600; // svg viewBox origin (set-local units; x = 0 is the tortoise at the stop)
const VB_W = 2400;
const POND_X = 880;
const POND_RX = 640;
const POND_RY = 58;
const DOCK_X = 300;
const BOX_X = 560;
const TOWER_X = 1360;

function Reed({ x, h, lean }: { x: number; h: number; lean: number }) {
  return (
    <g transform={`translate(${x} 0) rotate(${lean})`}>
      <path d={`M0 0 Q${lean * 0.6} ${-h * 0.5} ${lean} ${-h}`} stroke="var(--forest)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="-4" y={-h - 12} width="8" height="24" rx="4" fill="#6E4726" stroke="var(--forest)" strokeWidth="2" transform={`translate(${lean} 0)`} />
    </g>
  );
}

export function ContactSet() {
  const svgRef = useRef<SVGSVGElement>(null);
  const lit = useWalkStore((s) => s.settledStop === "contact");

  // Seat everything on the ground for the live anchor x (and again on resize).
  useEffect(() => {
    const svg = svgRef.current;
    const world = svg?.closest<HTMLElement>(".world");
    if (!svg || !world) return;
    const seat = () => {
      const raw = parseFloat(getComputedStyle(world).getPropertyValue("--anchor-x"));
      const anchorX = Number.isFinite(raw) ? raw : anchorFraction(DESIGN_W) * DESIGN_W;
      svg.querySelectorAll<SVGGElement>("[data-ax]").forEach((g) => {
        const x = Number(g.dataset.ax);
        const y = pathYAt(1 * WORLD_W + anchorX + x) + Number(g.dataset.sink ?? 0);
        g.setAttribute("transform", `translate(${x} ${y.toFixed(1)})`);
      });
    };
    seat();
    const ro = new ResizeObserver(seat);
    ro.observe(world);
    return () => ro.disconnect();
  }, []);

  // Hidden tab: pause every animation (CSS honours data-paused).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const sync = () => (document.hidden ? svg.setAttribute("data-paused", "") : svg.removeAttribute("data-paused"));
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const r = rng(7100);
  const stars = Array.from({ length: 7 }, () => ({ x: (r() - 0.5) * POND_RX * 1.5, y: (r() - 0.5) * POND_RY * 0.9, w: 30 + r() * 60 }));

  return (
    <svg
      ref={svgRef}
      className="contact-set"
      data-lit={lit ? "" : undefined}
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
      <defs>
        <radialGradient id="contact-halo-grad">
          <stop offset="0" stopColor="var(--paper)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--mist)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="contact-beam-grad">
          <stop offset="0" stopColor="var(--honey)" stopOpacity="0.7" />
          <stop offset="1" stopColor="var(--honey)" stopOpacity="0" />
        </radialGradient>
        <clipPath id="contact-pond-clip">
          <ellipse cx="0" cy="0" rx={POND_RX} ry={POND_RY} />
        </clipPath>
        {/* the only filter in the scene: a gentle ripple on the moon reflection */}
        <filter id="contact-ripple" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.012 0.12" numOctaves="1" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* the pond */}
      <g data-ax={POND_X} data-sink="26">
        <ellipse cx="0" cy="6" rx={POND_RX + 14} ry={POND_RY + 8} fill="#6E4726" opacity="0.5" />
        <ellipse cx="0" cy="0" rx={POND_RX} ry={POND_RY} fill="var(--plum)" stroke="var(--forest)" strokeWidth="3" />
        <g clipPath="url(#contact-pond-clip)">
          <ellipse cx="0" cy="0" rx={POND_RX} ry={POND_RY} fill="var(--night)" opacity="0.55" />
          {/* mirrored, desaturated reflection of the nearest tree */}
          <g transform="translate(-300 -4) scale(1 -0.55)" opacity="0.28" className="contact-shimmer">
            <rect x="-8" y="-52" width="16" height="54" rx="3" fill="var(--forest)" />
            <path d="M0 -196 L48 -96 H24 L58 -36 H-58 L-24 -96 H-48 Z" fill="var(--forest)" />
          </g>
          {/* moon reflection: halo, disc and the one filtered element */}
          <circle className="contact-halo" cx="40" cy="2" r="120" fill="url(#contact-halo-grad)" />
          <g filter="url(#contact-ripple)" className="contact-shimmer">
            <ellipse cx="40" cy="2" rx="30" ry="22" fill="var(--paper)" opacity="0.55" />
          </g>
          {stars.map((s, i) => (
            <rect
              key={i}
              className="contact-glint"
              x={s.x}
              y={s.y}
              width={s.w}
              height="2.5"
              rx="1.25"
              fill="var(--paper)"
              opacity="0.35"
              style={{ animationDelay: `${(-i * 0.9).toFixed(1)}s`, animationDuration: `${(5 + i * 0.7).toFixed(1)}s` }}
            />
          ))}
        </g>
        <ellipse cx="0" cy="0" rx={POND_RX} ry={POND_RY} fill="none" stroke="var(--mist)" strokeOpacity="0.4" strokeWidth="2" />
      </g>

      {/* wooden dock running into the pond, with a mailbox */}
      <g data-ax={DOCK_X} data-sink="8">
        <rect x="0" y="-12" width="420" height="16" rx="3" fill="#9A6B3F" stroke="var(--forest)" strokeWidth="2.5" />
        {[40, 120, 200, 280, 360].map((x) => (
          <path key={x} d={`M${x} -12 V4`} stroke="var(--forest)" strokeWidth="2" opacity="0.5" />
        ))}
        {[24, 396].map((x) => (
          <rect key={x} x={x - 6} y="4" width="12" height="46" rx="3" fill="#6E4726" stroke="var(--forest)" strokeWidth="2.5" />
        ))}
      </g>
      <g data-ax={BOX_X} data-sink="-4">
        <rect x="-5" y="-96" width="10" height="86" rx="3" fill="#6E4726" stroke="var(--forest)" strokeWidth="2.5" />
        <path d="M-34 -96 V-128 Q-34 -150 0 -150 Q34 -150 34 -128 V-96Z" fill="var(--coral)" stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" />
        <rect x="-18" y="-128" width="28" height="4" rx="2" fill="var(--forest)" opacity="0.55" />
        <g transform="translate(34 -128)">
          <g className="contact-flag">
            <rect x="0" y="-36" width="4" height="40" fill="var(--forest)" />
            <path d="M4 -36 H26 V-22 H4Z" fill="var(--honey)" stroke="var(--forest)" strokeWidth="2" strokeLinejoin="round" />
          </g>
        </g>
      </g>

      {/* the far "deploy tower": a lighthouse glowing on the bank */}
      <g data-ax={TOWER_X} data-sink="-6">
        <circle className="contact-beacon" cx="0" cy="-296" r="150" fill="url(#contact-beam-grad)" />
        <path d="M-30 0 L-18 -250 H18 L30 0Z" fill="var(--paper)" stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" />
        <path d="M-27 -60 L-25 -100 H25 L27 -60Z M-23 -150 L-21 -190 H21 L23 -150Z" fill="var(--coral)" opacity="0.9" />
        <rect x="-24" y="-282" width="48" height="32" rx="4" fill="var(--honey)" stroke="var(--forest)" strokeWidth="3" />
        <path d="M-34 -282 L0 -318 L34 -282Z" fill="var(--forest)" stroke="var(--forest)" strokeWidth="3" strokeLinejoin="round" />
        <rect x="-36" y="-254" width="72" height="8" rx="3" fill="var(--forest)" />
      </g>

      {/* bank reeds */}
      <g data-ax="170" data-sink="4">
        <Reed x={0} h={120} lean={-8} />
        <Reed x={22} h={90} lean={6} />
        <Reed x={-20} h={76} lean={-14} />
      </g>
      <g data-ax="1500" data-sink="10">
        <Reed x={0} h={130} lean={8} />
        <Reed x={26} h={96} lean={-6} />
        <Reed x={-24} h={82} lean={12} />
      </g>
    </svg>
  );
}
