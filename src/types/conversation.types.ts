export type OrbState =
  | "initial"
  | "connecting"
  | "listening"
  | "speaking"
  | "mic_denied"
  | "disconnected"
  | "failed"
  | "timeout";

export interface TranscriptLine {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: number;
}

export type SessionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";
