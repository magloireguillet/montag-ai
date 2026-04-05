"use client";

import { useConversationStatus, useConversationMode } from "@elevenlabs/react";
import { OrbWrapper } from "./OrbWrapper";
import { StartButton } from "./StartButton";
import { StatusOverlay } from "./StatusOverlay";

function useAgentState(): "listening" | "thinking" | "speaking" | null {
  const { status } = useConversationStatus();
  const { mode } = useConversationMode();

  if (status !== "connected") return null;
  return mode === "speaking" ? "speaking" : "listening";
}

export function CitizenPanel() {
  const agentState = useAgentState();

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-gray-950 overflow-hidden">
      <div className="flex-1 flex items-center justify-center w-full">
        <OrbWrapper agentState={agentState} />
      </div>
      <div className="pb-12">
        <StartButton />
      </div>
      <StatusOverlay />
    </div>
  );
}
