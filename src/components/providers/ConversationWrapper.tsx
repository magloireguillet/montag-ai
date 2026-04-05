"use client";

import { ConversationProvider } from "@elevenlabs/react";
import { formatCisuAlert } from "@/lib/cisu/formatter";
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
          const partial = formatCisuAlert(parameters);
          useCisuStore.getState().updateAlert(partial);
          return "Fiche CISU mise a jour avec succes.";
        },
      }}
    >
      <SessionGuard>{children}</SessionGuard>
    </ConversationProvider>
  );
}
