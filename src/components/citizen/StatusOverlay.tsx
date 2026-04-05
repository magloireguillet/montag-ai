"use client";

import { useRef, useEffect } from "react";
import { useConversationContext } from "@/components/providers/ConversationWrapper";
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

function useOrbState(isWarning: boolean): OrbState {
  const { status, isSpeaking } = useConversationContext();
  const { permission } = useMicPermission();
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    if (status === "connected") hasConnectedRef.current = true;
  }, [status]);

  if (permission === "denied") return "mic_denied";
  if (status === "connecting") return "connecting";
  if (status === "connected") {
    if (isWarning) return "timeout";
    return isSpeaking ? "speaking" : "listening";
  }
  return "initial";
}

interface StatusOverlayProps {
  isWarning?: boolean;
}

export function StatusOverlay({ isWarning = false }: StatusOverlayProps) {
  const orbState = useOrbState(isWarning);
  const { label, color } = STATE_CONFIG[orbState];

  return (
    <div className="absolute bottom-8 left-0 right-0 text-center">
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  );
}
