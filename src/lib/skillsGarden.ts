import { skills, type Skill, type SkillGroup } from "@/content/skills";

export type BedId = SkillGroup | "learning";
export type PlantKind = "sunflower" | "mushroom" | "tulip" | "fern" | "daisy";

/** The garden's hard cap; more than this and the beds get crowded (dev warning only). */
export const MAX_SKILLS = 25;

export const KIND_BY_GROUP: Record<SkillGroup, PlantKind> = {
  frontend: "sunflower",
  backend: "mushroom",
  data: "tulip",
  tools: "fern",
  practices: "daisy",
};

/** Left-to-right bed order; x is the bed centre in SkillsSet's 1000-wide scene (tortoise at x=700). */
export const BEDS: ReadonlyArray<{ id: BedId; label: string; x: number }> = [
  { id: "frontend", label: "Frontend patch", x: 250 },
  { id: "backend", label: "Backend patch", x: 400 },
  { id: "data", label: "Data patch", x: 550 },
  { id: "tools", label: "Tools patch", x: 850 },
  { id: "practices", label: "Practices patch", x: 1000 },
  { id: "learning", label: "Learning", x: 1150 },
];

export const GROUP_COLOR: Record<BedId, string> = {
  frontend: "var(--honey)",
  backend: "var(--coral)",
  data: "var(--plum)",
  tools: "var(--moss)",
  practices: "var(--mist-deep)",
  learning: "var(--sage)",
};

const LEVEL_WORDS = ["beginner", "basic", "intermediate", "advanced", "expert"] as const;

export function levelWord(skill: Skill): string {
  return skill.learning ? "learning" : LEVEL_WORDS[skill.level - 1];
}

export function bedOf(skill: Skill): BedId {
  return skill.learning ? "learning" : skill.group;
}

export function plantKind(skill: Skill): PlantKind {
  return KIND_BY_GROUP[skill.group];
}

/** Skills per bed, in `skills.ts` order. */
export function skillsByBed(): Record<BedId, Skill[]> {
  const out: Record<BedId, Skill[]> = { frontend: [], backend: [], data: [], tools: [], practices: [], learning: [] };
  for (const s of skills) out[bedOf(s)].push(s);
  return out;
}

/** Keeps the `max` tallest plants of a bed (stable order otherwise). */
export function trimBed(list: Skill[], max: number): Skill[] {
  if (list.length <= max) return list;
  const keep = new Set([...list].sort((a, b) => b.level - a.level).slice(0, max));
  return list.filter((s) => keep.has(s));
}

/** Small deterministic PRNG so each plant looks hand-made but identical on every render. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashName(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619);
  return h >>> 0;
}
