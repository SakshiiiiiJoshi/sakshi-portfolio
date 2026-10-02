import { create } from "zustand";
import type { SkillGroup } from "@/content/skills";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import { writeStoredMode, type ViewMode } from "@/lib/a11y/modeStorage";
import type { StopId } from "./constants";

export interface WalkState {
  progress: number;
  target: number;
  velocity: number;
  activeStop: StopId;
  settledStop: StopId | null;
  direction: 1 | -1;
  mode: ViewMode;
  /** False until the client has resolved the starting mode (stored choice / reduced motion). */
  modeReady: boolean;
  soundOn: boolean;
  hasInteracted: boolean;
  /** Skills Garden: the plant being hovered / focused / tapped, and its group (tints the shell). */
  activeSkill: string | null;
  hoverGroup: SkillGroup | null;
  /** Stepping Stones: -1 near bank, 0..N stones (N = "More"), N+1 far bank; and whether the card is shown. */
  stoneIndex: number;
  stoneCount: number;
  cardOpen: boolean;
  /** Experience Trail: -1 off the climb, else the active signpost (0 = oldest). */
  roleIndex: number;
  roleCount: number;
  setRoleIndex: (index: number) => void;
  setStoneIndex: (index: number) => void;
  setCardOpen: (open: boolean) => void;
  setProgress: (progress: number) => void;
  setTarget: (target: number) => void;
  setVelocity: (velocity: number) => void;
  setActiveStop: (stop: StopId) => void;
  setSettledStop: (stop: StopId | null) => void;
  setDirection: (direction: 1 | -1) => void;
  setMode: (mode: ViewMode) => void;
  /** Sets the starting mode without persisting it (only explicit choices are stored). */
  initMode: (mode: ViewMode) => void;
  setSoundOn: (soundOn: boolean) => void;
  setHasInteracted: (hasInteracted: boolean) => void;
  setActiveSkill: (skill: { name: string; group: SkillGroup } | null) => void;
}

export const useWalkStore = create<WalkState>((set) => ({
  progress: 0,
  target: 0,
  velocity: 0,
  activeStop: "hello",
  settledStop: null,
  direction: 1,
  mode: "walk",
  modeReady: false,
  soundOn: false,
  hasInteracted: false,
  activeSkill: null,
  hoverGroup: null,
  stoneIndex: -1,
  stoneCount: projects.length,
  cardOpen: true,
  roleIndex: -1,
  roleCount: experience.length,
  setRoleIndex: (roleIndex) => set({ roleIndex, cardOpen: true }),
  // a new stone always reopens the card
  setStoneIndex: (stoneIndex) => set({ stoneIndex, cardOpen: true }),
  setCardOpen: (cardOpen) => set({ cardOpen }),
  setProgress: (progress) => set({ progress }),
  setTarget: (target) => set({ target }),
  setVelocity: (velocity) => set({ velocity }),
  setActiveStop: (activeStop) => set({ activeStop }),
  setSettledStop: (settledStop) => set({ settledStop }),
  setDirection: (direction) => set({ direction }),
  setMode: (mode) => {
    writeStoredMode(mode);
    set({ mode, modeReady: true });
  },
  initMode: (mode) => set({ mode, modeReady: true }),
  setSoundOn: (soundOn) => set({ soundOn }),
  setHasInteracted: (hasInteracted) => set({ hasInteracted }),
  setActiveSkill: (skill) => set({ activeSkill: skill?.name ?? null, hoverGroup: skill?.group ?? null }),
}));
