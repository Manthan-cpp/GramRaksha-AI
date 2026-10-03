import { create } from "zustand";

export const useIntroStore = create<{
  phase: "idle" | "black" | "reveal-logo" | "expand-website" | "done";
  setPhase: (phase: "idle" | "black" | "reveal-logo" | "expand-website" | "done") => void;
  hasPlayed: boolean;
  setHasPlayed: (played: boolean) => void;
}>((set) => ({
  phase: "idle",
  setPhase: (phase) => set({ phase }),
  hasPlayed: false,
  setHasPlayed: (played) => set({ hasPlayed: played }),
}));
