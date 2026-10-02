import { useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/a11y/reducedMotion";
import { site } from "@/content/site";

/**
 * Easter eggs (content bible §11). None of them ever block content, and none fire while the visitor is
 * typing in a field. Triggers:
 *   - click/tap the tortoise  -> hide, then peek      (wired in Stage via `onTortoiseClick`)
 *   - key T                   -> happy spin           (`onSpin`)
 *   - Konami code             -> fireflies swarm and briefly spell the first letter of the name
 *   - at load                 -> a console greeting
 */

export function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const FLIES = 20;

let greeted = false;
export function sayHello(email: string = site.email) {
  if (greeted) return;
  greeted = true;
  console.log(`🐢 Hi, curious dev. Want to talk? ${email}`);
}

/** Sample up to `count` points that fall inside a glyph, centred on (0,0), spanning ~`height` px. */
function glyphPoints(letter: string, count: number, height: number): { x: number; y: number }[] {
  const W = 140;
  const H = 160;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const ring = () =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return { x: Math.cos(a) * height * 0.35, y: Math.sin(a) * height * 0.35 };
    });
  if (!ctx) return ring();
  ctx.font = "700 140px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, W / 2, H / 2);
  const data = ctx.getImageData(0, 0, W, H).data;
  const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < H; y += 7) {
    for (let x = 0; x < W; x += 7) {
      if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x: x - W / 2, y: y - H / 2 });
    }
  }
  if (pts.length === 0) return ring();
  const k = height / H;
  const picked = Array.from({ length: Math.min(count, pts.length) }, (_, i) => pts[Math.floor((i * pts.length) / Math.min(count, pts.length))]);
  while (picked.length < count) picked.push(picked[picked.length % Math.max(picked.length, 1)]);
  return picked.map((p) => ({ x: p.x * k, y: p.y * k }));
}

let swarming = false;

/** Fireflies drift in, form the first letter of the name, then drift off. Self-cleaning; one at a time. */
export function swarmFireflies(letter: string = site.displayName.charAt(0).toUpperCase()) {
  if (swarming || typeof document === "undefined") return;
  swarming = true;
  const reduced = prefersReducedMotion();
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, { position: "fixed", inset: "0", zIndex: "60", pointerEvents: "none", overflow: "hidden" });
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = vw / 2;
  const cy = vh * 0.4;
  const targets = glyphPoints(letter, FLIES, Math.min(vh * 0.34, 260));
  const flies = targets.map(() => {
    const el = document.createElement("span");
    Object.assign(el.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "8px",
      height: "8px",
      marginLeft: "-4px",
      marginTop: "-4px",
      borderRadius: "50%",
      background: "var(--honey, #F2B84B)",
      boxShadow: "0 0 10px 3px color-mix(in srgb, var(--honey, #F2B84B) 70%, transparent)",
      opacity: "0",
    });
    layer.appendChild(el);
    return el;
  });
  document.body.appendChild(layer);

  const tl = gsap.timeline({
    onComplete: () => {
      layer.remove();
      swarming = false;
    },
  });
  if (reduced) {
    flies.forEach((el, i) => gsap.set(el, { x: cx + targets[i].x, y: cy + targets[i].y }));
    tl.to(flies, { opacity: 1, duration: 0.3 }).to(flies, { opacity: 0, duration: 0.4 }, 1.8);
    return;
  }
  flies.forEach((el, i) => {
    const edge = i % 2 ? vw + 20 : -20;
    gsap.set(el, { x: edge, y: Math.random() * vh });
    const wander = { x: Math.random() * vw, y: vh * (0.2 + Math.random() * 0.6) };
    tl.to(el, { opacity: 1, duration: 0.3 }, i * 0.03)
      .to(el, { x: wander.x, y: wander.y, duration: 1.3, ease: "sine.inOut" }, i * 0.03)
      .to(el, { x: cx + targets[i].x, y: cy + targets[i].y, duration: 1, ease: "power2.inOut" }, 1.4)
      .to(el, { y: `+=${(i % 2 ? 1 : -1) * 4}`, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 3 }, 2.4)
      .to(el, { x: i % 2 ? vw + 40 : -40, y: `-=${40 + Math.random() * 120}`, opacity: 0, duration: 1.2, ease: "power1.in" }, 4);
  });
}

export function useEasterEggs({ onSpin }: { onSpin: () => void }) {
  useEffect(() => {
    sayHello();
    let buffer: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === "t" && !e.shiftKey) onSpin();
      buffer = [...buffer, k].slice(-KONAMI.length);
      if (buffer.length === KONAMI.length && buffer.every((v, i) => v === KONAMI[i])) {
        buffer = [];
        swarmFireflies();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onSpin]);
}
