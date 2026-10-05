export interface Role {
  company: string;
  role: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM | "Present"
  location?: string;
  summary: string;
  wins: string[];
  stack?: string[];
}

export const experience: Role[] = [
  {
    company: "Freelance",
    role: "Frontend Developer",
    start: "2024-06",
    end: "Present",
    summary: "Building and designing full-stack web apps for clients and personal projects.",
    wins: [
      "Designed and shipped polished UIs with Next.js + Figma",
      "Integrated REST APIs and SQL/MongoDB backends end-to-end",
    ],
    stack: ["Next.js", "React", "Node.js", "SQL", "MongoDB"],
  },
  {
    company: "B.E. IT Engineering",
    role: "Student (3rd Year)",
    start: "2022-08",
    end: "Present",
    location: "Mumbai, India",
    summary: "Studying IT engineering while building real projects on the side.",
    wins: [
      "Built full-stack projects in React, Node.js and SQL",
      "Learned Java, data structures and system design in-depth",
    ],
  },
];

export const experienceCopy = {
  title: "The road so far",
  now: "Now",
};
