"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/store/session.store";
import { useCisuStore } from "@/store/cisu.store";
import { formatCisuAlert } from "@/lib/cisu/formatter";
import { getAlertCompleteness } from "@/lib/cisu/validators";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!;

export function ElevenLabsWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    // Load the ElevenLabs widget script
    const script = document.createElement("script");
    script.src = "https://elevenlabs.io/convai-widget/index.js";
    script.async = true;
    document.head.appendChild(script);

    // Listen for widget events
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      const { type, payload } = event.data;

      if (type === "elevenlabs:message") {
        const msg = payload;
        if (msg.source === "user" || msg.source === "ai") {
          useSessionStore.getState().addTranscript({
            role: msg.source === "user" ? "user" : "agent",
            text: typeof msg.message === "string" ? msg.message : "",
          });
        }
      }

      if (type === "elevenlabs:status") {
        if (payload === "connected") {
          useSessionStore.getState().startCall();
        } else if (payload === "disconnected") {
          useSessionStore.getState().setStatus("disconnected");
        }
      }

      if (type === "elevenlabs:client_tool_call") {
        if (payload.tool_name === "generer_fiche_cisu") {
          try {
            const partial = formatCisuAlert(payload.parameters);
            useCisuStore.getState().updateAlert(partial);
            const alert = useCisuStore.getState().currentAlert;
            const { percentage } = getAlertCompleteness(alert);
            console.info("[Montag] CISU alert updated:", { percentage, partial });
          } catch (err) {
            console.error("[Montag] generer_fiche_cisu failed:", err);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div ref={widgetRef} className="fixed bottom-4 right-4 z-50">
      <div
        dangerouslySetInnerHTML={{
          __html: `<elevenlabs-convai agent-id="${AGENT_ID}"></elevenlabs-convai>`,
        }}
      />
    </div>
  );
}
