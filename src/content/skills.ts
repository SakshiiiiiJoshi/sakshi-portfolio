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
  { name: "TypeScript", group: "frontend", level: 5 },
  { name: "React", group: "frontend", level: 5 },
  { name: "Next.js", group: "frontend", level: 4 },
  { name: "Tailwind", group: "frontend", level: 5 },
  { name: "GSAP", group: "frontend", level: 3 },
  { name: "Node.js", group: "backend", level: 4 },
  { name: "REST + GraphQL", group: "backend", level: 4 },
  { name: "PostgreSQL", group: "data", level: 4 },
  { name: "Prisma", group: "data", level: 3 },
  { name: "Git", group: "tools", level: 5 },
  { name: "Docker", group: "tools", level: 3 },
  { name: "Code review", group: "practices", level: 4 },
  { name: "Accessibility", group: "practices", level: 4 },
  { name: "Rust", group: "tools", level: 1, learning: true },
];

/** Stop 3 — Skills Garden copy (02-content-bible.md §4). */
export const skillsCopy = {
  title: "What grows well",
  intro: "Plants are skills. Taller means I use it daily; sprouts are what I'm learning.",
};
