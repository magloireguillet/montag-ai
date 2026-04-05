"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { Conversation } from "@elevenlabs/client";
import { ELEVENLABS_CONFIG } from "@/lib/elevenlabs.config";
import { formatCisuAlert } from "@/lib/cisu/formatter";
import { getAlertCompleteness } from "@/lib/cisu/validators";
import { useCisuStore } from "@/store/cisu.store";
import { useSessionStore } from "@/store/session.store";

type Status = "disconnected" | "connecting" | "connected";

interface ConversationContextValue {
  status: Status;
  isSpeaking: boolean;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  getInputVolume: () => number;
  getOutputVolume: () => number;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

export function useConversationContext() {
  const ctx = useContext(ConversationContext);
  if (!ctx) throw new Error("useConversationContext must be used within ConversationWrapper");
  return ctx;
}

export function ConversationWrapper({ children }: { children: React.ReactNode }) {
  const conversationRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(null);
  const connectingRef = useRef(false);
  const [status, setStatus] = useState<Status>("disconnected");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startSession = useCallback(async () => {
    if (conversationRef.current || connectingRef.current) return;
    connectingRef.current = true;
    setStatus("connecting");

    try {
      const res = await fetch("/api/signed-url", { method: "POST" });
      const { signedUrl } = await res.json();

      const session = await Conversation.startSession({
        signedUrl,
        overrides: ELEVENLABS_CONFIG.overrides,
        onConnect: () => {
          setStatus("connected");
          useSessionStore.getState().startCall();
        },
        onDisconnect: () => {
          setStatus("disconnected");
          conversationRef.current = null;
          useSessionStore.getState().setStatus("disconnected");
        },
        onError: (message: string) => {
          console.error("[Montag] Error:", message);
          useSessionStore.getState().setStatus("error");
        },
        onMessage: (message) => {
          if (message.source === "user" || message.source === "ai") {
            useSessionStore.getState().addTranscript({
              role: message.source === "user" ? "user" : "agent",
              text: typeof message.message === "string" ? message.message : "",
            });
          }
        },
        onModeChange: ({ mode }: { mode: string }) => {
          setIsSpeaking(mode === "speaking");
        },
        onStatusChange: ({ status: s }: { status: string }) => {
          if (s === "connected") setStatus("connected");
          else if (s === "disconnected") setStatus("disconnected");
          else if (s === "connecting") setStatus("connecting");
        },
        clientTools: {
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
        },
      });

      // If cleanup fired while we were awaiting, tear down immediately
      if (!connectingRef.current) {
        await session.endSession();
        return;
      }

      conversationRef.current = session;
    } catch (err) {
      console.error("[Montag] Failed to start session:", err);
      setStatus("disconnected");
    } finally {
      connectingRef.current = false;
    }
  }, []);

  const endSession = useCallback(async () => {
    const session = conversationRef.current;
    conversationRef.current = null;
    setStatus("disconnected");
    useSessionStore.getState().endCall();
    await session?.endSession();
  }, []);

  const getInputVolume = useCallback(() => {
    return conversationRef.current?.getInputVolume() ?? 0;
  }, []);

  const getOutputVolume = useCallback(() => {
    return conversationRef.current?.getOutputVolume() ?? 0;
  }, []);

  useEffect(() => {
    return () => {
      if (connectingRef.current) {
        // Signal to in-flight startSession to tear down after await
        connectingRef.current = false;
      } else {
        conversationRef.current?.endSession();
        conversationRef.current = null;
      }
    };
  }, []);

  return (
    <ConversationContext.Provider
      value={{ status, isSpeaking, startSession, endSession, getInputVolume, getOutputVolume }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
