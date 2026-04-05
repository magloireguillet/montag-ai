"use client";

import dynamic from "next/dynamic";

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
  agentState: "listening" | "thinking" | "speaking" | null;
}

export function OrbWrapper({ agentState }: OrbWrapperProps) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Orb
        colors={["#e74c3c", "#f39c12"]}
        agentState={agentState}
      />
    </div>
  );
}
