export const STOPS = [
  { id: "hello", title: "Hello", progress: 0.0, timeOfDay: "dawn" },
  { id: "about", title: "About", progress: 0.14, timeOfDay: "morning" },
  { id: "skills", title: "Skills Garden", progress: 0.3, timeOfDay: "late morning" },
  { id: "projects", title: "Stepping Stones", progress: 0.48, timeOfDay: "noon" },
  { id: "experience", title: "Experience Trail", progress: 0.66, timeOfDay: "golden hour" },
  { id: "fun", title: "Fun Facts Campfire", progress: 0.83, timeOfDay: "dusk" },
  { id: "contact", title: "Contact Pond", progress: 1.0, timeOfDay: "night" },
] as const;

export type Stop = (typeof STOPS)[number];
export type StopId = Stop["id"];

export const WHEEL_K = 0.00035;
export const TOUCH_K = 0.0016;
export const SNAP_WINDOW = 0.025;
export const SNAP_DELAY = 350; // ms
export const MAX_VELOCITY = 0.9; // progress units per second
