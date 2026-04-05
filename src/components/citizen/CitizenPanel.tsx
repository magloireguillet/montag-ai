"use client";

import type { AgentState } from "@/components/ui/orb";
import { useConversationContext } from "@/components/providers/ConversationWrapper";
import { OrbWrapper } from "./OrbWrapper";
import { StartButton } from "./StartButton";
import { StatusOverlay } from "./StatusOverlay";
import { useCallDurationLimit } from "@/hooks/useCallDurationLimit";

export function CitizenPanel() {
  const conversation = useConversationContext();
  const { isWarning } = useCallDurationLimit();

  const agentState: AgentState =
    conversation.status === "connected"
      ? conversation.isSpeaking
        ? "talking"
        : "listening"
      : null;

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-gray-950 overflow-hidden">
      <div className="flex-1 flex items-center justify-center w-full">
        <OrbWrapper
          agentState={agentState}
          getInputVolume={conversation.getInputVolume}
          getOutputVolume={conversation.getOutputVolume}
        />
      </div>
      <div className="pb-12">
        <StartButton />
      </div>
      <StatusOverlay isWarning={isWarning} />
    </div>
  );
}
