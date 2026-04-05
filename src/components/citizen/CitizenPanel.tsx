"use client";

import { useConversationStatus, useConversationMode, useConversationControls } from "@elevenlabs/react";
import type { AgentState } from "@/components/ui/orb";
import { OrbWrapper } from "./OrbWrapper";
import { StartButton } from "./StartButton";
import { StatusOverlay } from "./StatusOverlay";
import { useCallDurationLimit } from "@/hooks/useCallDurationLimit";
import { useConnectionResilience } from "@/hooks/useConnectionResilience";

function useAgentState(): AgentState {
  const { status } = useConversationStatus();
  const { mode } = useConversationMode();

  if (status !== "connected") return null;
  return mode === "speaking" ? "talking" : "listening";
}

export function CitizenPanel() {
  const agentState = useAgentState();
  const controls = useConversationControls();
  const { isWarning } = useCallDurationLimit();
  useConnectionResilience();

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-gray-950 overflow-hidden">
      <div className="flex-1 flex items-center justify-center w-full">
        <OrbWrapper
          agentState={agentState}
          getInputVolume={controls.getInputVolume}
          getOutputVolume={controls.getOutputVolume}
        />
      </div>
      <div className="pb-12">
        <StartButton />
      </div>
      <StatusOverlay isWarning={isWarning} />
    </div>
  );
}
