"use client";

import { ConversationProvider } from "@elevenlabs/react";
import { ELEVENLABS_CONFIG } from "@/lib/elevenlabs.config";
import { formatCisuAlert } from "@/lib/cisu/formatter";
import { getAlertCompleteness } from "@/lib/cisu/validators";
import { useCisuStore } from "@/store/cisu.store";
import { useSessionStore } from "@/store/session.store";
import { useSessionGuard } from "@/hooks/useSessionGuard";

function SessionGuard({ children }: { children: React.ReactNode }) {
  useSessionGuard();
  return <>{children}</>;
}

export function ConversationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ConversationProvider
      serverLocation={ELEVENLABS_CONFIG.serverLocation}
      overrides={ELEVENLABS_CONFIG.overrides}
      onMessage={(message) => {
        if (message.source === "user" || message.source === "ai") {
          useSessionStore.getState().addTranscript({
            role: message.source === "user" ? "user" : "agent",
            text: typeof message.message === "string" ? message.message : "",
          });
        }
      }}
      onStatusChange={({ status }) => {
        if (status === "connected") {
          useSessionStore.getState().startCall();
        } else if (status === "disconnected") {
          useSessionStore.getState().setStatus("disconnected");
        }
      }}
      onError={(message) => {
        console.error("[Montag] Conversation error:", message);
        useSessionStore.getState().setStatus("error");
      }}
      clientTools={{
        generer_fiche_cisu: async (parameters: Record<string, unknown>) => {
          try {
            const partial = formatCisuAlert(parameters);
            useCisuStore.getState().updateAlert(partial);
            const alert = useCisuStore.getState().currentAlert;
            const { percentage, missingFields } = getAlertCompleteness(alert);
            console.info("[Montag] CISU alert updated:", { percentage, partial });
            const missing = missingFields.length > 0
              ? ` Champs manquants: ${missingFields.join(", ")}.`
              : "";
            return `Fiche CISU mise a jour (${percentage}% complete).${missing}`;
          } catch (err) {
            console.error("[Montag] generer_fiche_cisu failed:", err, parameters);
            return "Erreur lors de la creation de la fiche. Veuillez reessayer.";
          }
        },
      }}
    >
      <SessionGuard>{children}</SessionGuard>
    </ConversationProvider>
  );
}
