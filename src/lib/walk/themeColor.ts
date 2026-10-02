import type { StopId } from "./constants";

/** Sky-top colour at each stop (mirrors SKY_TOP in timeOfDay.ts) for the browser chrome. */
const THEME: Record<StopId, string> = {
  hello: "#F3D9C4",
  about: "#DCEBE4",
  skills: "#CFE5E0",
  projects: "#BFDDE0",
  experience: "#F2B84B",
  fun: "#E8875B",
  contact: "#2E3B5F",
};

/** Called only when the walk settles on a stop (never per frame). */
export function setThemeColor(stop: StopId | null) {
  if (!stop) return;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = THEME[stop];
}
