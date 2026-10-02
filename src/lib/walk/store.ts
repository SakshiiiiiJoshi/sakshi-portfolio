import { create } from "zustand";
import type { StopId } from "./constants";

export interface WalkState {
  progress: number;
  target: number;
  velocity: number;
  activeStop: StopId;
  settledStop: StopId | null;
  direction: 1 | -1;
  mode: "walk" | "static";
  soundOn: boolean;
  hasInteracted: boolean;
  setProgress: (progress: number) => void;
  setTarget: (target: number) => void;
  setVelocity: (velocity: number) => void;
  setActiveStop: (stop: StopId) => void;
  setSettledStop: (stop: StopId | null) => void;
  setDirection: (direction: 1 | -1) => void;
  setMode: (mode: "walk" | "static") => void;
  setSoundOn: (soundOn: boolean) => void;
  setHasInteracted: (hasInteracted: boolean) => void;
}

export const useWalkStore = create<WalkState>((set) => ({
  progress: 0,
  target: 0,
  velocity: 0,
  activeStop: "hello",
  settledStop: null,
  direction: 1,
  mode: "walk",
  soundOn: false,
  hasInteracted: false,
  setProgress: (progress) => set({ progress }),
  setTarget: (target) => set({ target }),
  setVelocity: (velocity) => set({ velocity }),
  setActiveStop: (activeStop) => set({ activeStop }),
  setSettledStop: (settledStop) => set({ settledStop }),
  setDirection: (direction) => set({ direction }),
  setMode: (mode) => set({ mode }),
  setSoundOn: (soundOn) => set({ soundOn }),
  setHasInteracted: (hasInteracted) => set({ hasInteracted }),
}));
