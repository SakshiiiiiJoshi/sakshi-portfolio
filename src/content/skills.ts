export type SkillGroup = "frontend" | "backend" | "data" | "tools" | "practices";

export interface Skill {
  name: string;
  group: SkillGroup;
  level: 1 | 2 | 3 | 4 | 5;
  note?: string;
  learning?: boolean;
}

/** Level words for the static view (1–5), so level never relies on plant height alone. */
export const levelWords: Record<Skill["level"], string> = {
  1: "Learning",
  2: "Getting comfortable",
  3: "Solid",
  4: "Strong",
  5: "Daily driver",
};

export const groupLabels: Record<SkillGroup, string> = {
  frontend: "Frontend",
  backend: "Backend",
  data: "Data",
  tools: "Tools",
  practices: "Practices",
};

export const skills: Skill[] = [
  { name: "JavaScript", group: "frontend", level: 5, note: "Daily driver" },
  { name: "React", group: "frontend", level: 5 },
  { name: "Next.js", group: "frontend", level: 5 },
  { name: "HTML & CSS", group: "frontend", level: 4 },
  { name: "Figma / UI-UX", group: "frontend", level: 4, note: "Love designing before coding" },
  { name: "Node.js / Express", group: "backend", level: 4 },
  { name: "REST APIs", group: "backend", level: 4 },
  { name: "Java", group: "backend", level: 3 },
  { name: "SQL / PostgreSQL", group: "data", level: 4 },
  { name: "MongoDB", group: "data", level: 3 },
  { name: "Git", group: "tools", level: 5 },
  { name: "TypeScript", group: "tools", level: 2, learning: true },
];

/** Stop 3 — Skills Garden copy (02-content-bible.md §4). */
export const skillsCopy = {
  title: "What grows well",
  intro: "Plants are skills. Taller means I use it daily; sprouts are what I'm still learning.",
};
