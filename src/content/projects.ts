export type StoneColor = "moss" | "sage" | "honey" | "coral";

export interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  role: string;
  year: string;
  stack: string[];
  problem: string;
  approach: string;
  outcome: string;
  highlights?: string[];
  links: { live?: string; repo?: string; writeup?: string };
  image?: string;
  stoneColor: StoneColor;
}

export const projects: Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    oneLiner: "A short punchy summary of the first project.",
    role: "Solo developer",
    year: "2025",
    stack: ["Next.js", "TypeScript", "Postgres"],
    problem: "Who had what pain?",
    approach: "Key design and engineering decisions, and why.",
    outcome: "Cut checkout time 38%, 12k monthly users.",
    links: { live: "https://example.com", repo: "https://github.com/example/one" },
    stoneColor: "moss",
  },
  {
    slug: "project-two",
    title: "Project Two",
    oneLiner: "A short punchy summary of the second project.",
    role: "Frontend lead",
    year: "2024",
    stack: ["React", "GSAP", "Node.js"],
    problem: "Who had what pain?",
    approach: "Key design and engineering decisions, and why.",
    outcome: "A measurable result goes here.",
    links: { repo: "https://github.com/example/two" },
    stoneColor: "sage",
  },
  {
    slug: "project-three",
    title: "Project Three",
    oneLiner: "A short punchy summary of the third project.",
    role: "Full-stack developer",
    year: "2023",
    stack: ["TypeScript", "Prisma", "Redis"],
    problem: "Who had what pain?",
    approach: "Key design and engineering decisions, and why.",
    outcome: "A measurable result goes here.",
    links: { writeup: "https://example.com/writeup" },
    stoneColor: "honey",
  },
];
