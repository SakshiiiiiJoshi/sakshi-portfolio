import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";

// Registered once, client-only. Import this module from client components only.
if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin, Observer, useGSAP);
}

export { gsap, MotionPathPlugin, Observer, useGSAP };
