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
  imageAlt?: string;
  stoneColor: StoneColor;
}

export const projectsCopy = {
  title: "Things I've built",
  intro: "Each stone is a project. Step on one to read the story.",
  moreTitle: "More on GitHub",
  moreBody: "The rest of the pond: smaller experiments, half-finished ideas and things I tinker with.",
  moreCta: "Visit my GitHub",
};

export const projects: Project[] = [
  {
    slug: "founderequity",
    title: "FounderEquity",
    oneLiner: "A platform for founder equity management.",
    role: "Full-Stack Developer",
    year: "2024",
    stack: ["Next.js", "React", "Node.js"],
    problem: "Founders need a clear way to manage equity.",
    approach: "Built a responsive web app with a clean UI.",
    outcome: "Successfully deployed and live.",
    links: { live: "https://founderequity.vercel.app" },
    stoneColor: "moss",
  },
  {
    slug: "quickbite",
    title: "QuickBite",
    oneLiner: "Canteen Management System.",
    role: "Developer",
    year: "2024",
    stack: ["JavaScript", "React", "Node.js"],
    problem: "Canteens face issues with long queues and order management.",
    approach: "Developed a digital ordering system.",
    outcome: "Streamlined order processing.",
    links: { repo: "https://github.com/SakshiiiiiJoshi/QuickBite-Canteen-Management-System" },
    stoneColor: "sage",
  },
  {
    slug: "weather-analyzer",
    title: "Weather Analyzer",
    oneLiner: "A real-time weather analysis tool.",
    role: "Developer",
    year: "2024",
    stack: ["React", "API Integration"],
    problem: "Users needed quick access to accurate weather data.",
    approach: "Integrated reliable weather APIs with a simple dashboard.",
    outcome: "Live application providing instant weather insights.",
    links: { live: "https://weather-analyzer-ywyj.onrender.com" },
    stoneColor: "honey",
  },
];
