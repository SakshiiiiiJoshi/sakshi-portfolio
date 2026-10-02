import { site } from "./site";

/** Stop 7 — Contact copy (02-content-bible.md §8). */
export const contactCopy = {
  title: "Let's build something.",
  body: `${site.availability}. If you have a problem worth solving, I'd love to hear about it.`,
  replyTime: "I usually reply within 24 hours.",
  bubble: "Thanks for walking with me.",
  say: "Say hello",
  copy: "Copy email",
  copied: "Copied",
  resume: "Download résumé",
  /** Update when the real résumé replaces public/resume.pdf. */
  resumeSize: "PDF · 1 KB",
  github: "GitHub",
  linkedin: "LinkedIn",
  walkBack: "Walk back to the start",
  skip: "Skip to static view",
  footer: (year: number) => `Hand-drawn with SVG, GSAP, and patience. © ${year} ${site.name}.`,
};

export type CtaType = "email" | "resume" | "github" | "linkedin" | "copy";

/** Analytics hook point: P18 wires a vendor to this DOM event. */
export function emitCta(type: CtaType) {
  window.dispatchEvent(new CustomEvent("portfolio:cta", { detail: { type } }));
}

/** The address is assembled at click time so it never appears in the markup. */
export function emailParts(): { user: string; host: string } {
  const [user, host] = site.email.split("@");
  return { user, host };
}
