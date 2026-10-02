import type { StopId } from "@/lib/walk/constants";
import { site } from "./site";

export const captions: Record<StopId, string> = {
  hello: `Dawn. ${site.tortoiseName} wakes and sees you.`,
  about: "Morning. The meadow is quiet, the path is long.",
  skills: "Late morning. Something is growing here.",
  projects: "Noon. A stream cuts across the path.",
  experience: "Golden hour. The path climbs.",
  fun: "Dusk. The fire crackles. Story time.",
  contact: "Night. Fireflies. One last thing to say.",
};
