"use client";

import { useConversationStatus, useConversationMode } from "@elevenlabs/react";
import { useMicPermission } from "@/hooks/useMicPermission";
import type { OrbState } from "@/types/conversation.types";

const STATE_CONFIG: Record<OrbState, { label: string; color: string }> = {
  initial: { label: "Appuyer pour commencer", color: "text-gray-400" },
  connecting: { label: "Connexion en cours...", color: "text-yellow-400" },
  listening: { label: "Montag vous ecoute", color: "text-green-400" },
  speaking: { label: "Montag repond...", color: "text-blue-400" },
  mic_denied: { label: "Microphone requis", color: "text-red-400" },
  disconnected: { label: "Reconnexion...", color: "text-orange-400" },
  failed: { label: "Connexion impossible", color: "text-red-500" },
  timeout: { label: "Transfert imminent...", color: "text-orange-500" },
};

function useOrbState(): OrbState {
  const { status } = useConversationStatus();
  const { mode } = useConversationMode();
  const { permission } = useMicPermission();

  if (permission === "denied") return "mic_denied";
  if (status === "disconnected") return "disconnected";
  if (status === "connecting") return "connecting";
  if (status === "error") return "failed";
  if (status === "connected") {
    return mode === "speaking" ? "speaking" : "listening";
  }
  return "initial";
}

export function StatusOverlay() {
  const orbState = useOrbState();
  const { label, color } = STATE_CONFIG[orbState];

  return (
    <div className="absolute bottom-8 left-0 right-0 text-center">
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  );
}
