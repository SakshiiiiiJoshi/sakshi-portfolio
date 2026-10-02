export type SkillGroup = "frontend" | "backend" | "data" | "tools" | "practices";

export interface Skill {
  name: string;
  group: SkillGroup;
  level: 1 | 2 | 3 | 4 | 5;
  note?: string;
  learning?: boolean;
}

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
