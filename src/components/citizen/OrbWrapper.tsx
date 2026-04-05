"use client";

import { memo } from "react";
import dynamic from "next/dynamic";
import type { AgentState } from "@/components/ui/orb";

const Orb = dynamic(
  () => import("@/components/ui/orb").then((m) => m.Orb),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-48 h-48 rounded-full bg-gray-800/50 animate-pulse" />
      </div>
    ),
  }
);

interface OrbWrapperProps {
  agentState: AgentState;
  getInputVolume?: () => number;
  getOutputVolume?: () => number;
}

export const OrbWrapper = memo(function OrbWrapper({
  agentState,
  getInputVolume,
  getOutputVolume,
}: OrbWrapperProps) {
  return (
    <div className="w-full max-w-[500px] max-h-[500px] aspect-square mx-auto">
      <Orb
        colors={["#e74c3c", "#f39c12"]}
        agentState={agentState}
        getInputVolume={getInputVolume}
        getOutputVolume={getOutputVolume}
      />
    </div>
  );
});
