export interface Site {
  name: string;
  displayName: string;
  role: string;
  location: string;
  yearsExperience: number;
  availability: string;
  tagline: string;
  tortoiseName: string;
  email: string;
  github: string;
  linkedin: string;
  twitterX: string;
  resumePdf: string;
  siteUrl: string;
  primaryStack: string[];
  whatYouBuild: string;
}

// Sample values — replace with real facts (02-content-bible.md §0) before launch.
export const site: Site = {
  name: "Sakshi Sample",
  displayName: "Sakshi",
  role: "Full-Stack Software Developer",
  location: "Pune, India",
  yearsExperience: 3,
  availability: "Open to full-time roles",
  tagline: "Slow is smooth, smooth is fast.",
  tortoiseName: "Pebble",
  email: "you@example.com",
  github: "https://github.com/example",
  linkedin: "https://www.linkedin.com/in/example",
  twitterX: "",
  resumePdf: "/resume.pdf",
  siteUrl: "https://example.com",
  primaryStack: ["TypeScript", "React", "Node.js", "PostgreSQL"],
  whatYouBuild: "fast, friendly web products",
};
