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
    company: "Company Now",
    role: "Software Developer",
    start: "2024-01",
    end: "Present",
    summary: "One-line scope of the current role.",
    wins: ["Shipped X that did Y", "Mentored N engineers"],
    stack: ["TypeScript", "React"],
  },
  {
    company: "Company Previous",
    role: "Software Developer",
    start: "2022-06",
    end: "2023-12",
    summary: "One-line scope of the previous role.",
    wins: ["Built X, which improved Y by Z%", "Led the migration to W"],
  },
  {
    company: "Company First",
    role: "Intern",
    start: "2021-06",
    end: "2022-05",
    summary: "One-line scope of the first role.",
    wins: ["Delivered X in N weeks", "Wrote the first test suite for Y"],
  },
];

export const experienceCopy = {
  title: "The road so far",
  now: "Now",
};
