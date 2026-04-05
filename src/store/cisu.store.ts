import { create } from "zustand";
import type { CisuAlert } from "@/types/cisu.types";

interface CisuState {
  currentAlert: CisuAlert | null;
  alertHistory: CisuAlert[];

  updateAlert: (partial: Partial<CisuAlert>) => void;
  finalizeAlert: () => void;
  reset: () => void;
}

export const useCisuStore = create<CisuState>((set, get) => ({
  currentAlert: null,
  alertHistory: [],

  updateAlert: (partial) =>
    set((state) => {
      const existing = state.currentAlert;
      const now = new Date().toISOString();

      if (existing) {
        return {
          currentAlert: { ...existing, ...partial, updatedAt: now },
        };
      }

      return {
        currentAlert: {
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          nature: "",
          severity: "unknown",
          urgency: "unknown",
          location: {
            address: "",
            city: "",
            postalCode: "",
          },
          victims: {
            count: 0,
            injured: 0,
            trapped: 0,
            description: "",
          },
          callerDescription: "",
          recommendedForces: [],
          ...partial,
        } as CisuAlert,
      };
    }),

  finalizeAlert: () => {
    const { currentAlert } = get();
    if (!currentAlert) return;
    set((state) => ({
      alertHistory: [...state.alertHistory, currentAlert],
      currentAlert: null,
    }));
  },

  reset: () => set({ currentAlert: null, alertHistory: [] }),
}));
