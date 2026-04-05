import { create } from "zustand";
import type { TranscriptLine, SessionStatus } from "@/types/conversation.types";

interface SessionState {
  status: SessionStatus;
  callStartTime: number | null;
  transcriptLines: TranscriptLine[];

  setStatus: (status: SessionStatus) => void;
  startCall: () => void;
  endCall: () => void;
  addTranscript: (line: Omit<TranscriptLine, "id" | "timestamp">) => void;
  clearTranscript: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  status: "idle",
  callStartTime: null,
  transcriptLines: [],

  setStatus: (status) => set({ status }),

  startCall: () =>
    set({
      status: "connected",
      callStartTime: Date.now(),
      transcriptLines: [],
    }),

  endCall: () =>
    set({
      status: "idle",
      callStartTime: null,
    }),

  addTranscript: (line) =>
    set((state) => ({
      transcriptLines: [
        ...state.transcriptLines,
        {
          ...line,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        },
      ],
    })),

  clearTranscript: () => set({ transcriptLines: [] }),
}));
