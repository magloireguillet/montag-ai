"use client";

import { memo } from "react";
import { useConversationControls, useConversationStatus } from "@elevenlabs/react";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import { useMicPermission } from "@/hooks/useMicPermission";

export const StartButton = memo(function StartButton() {
  const controls = useConversationControls();
  const { status } = useConversationStatus();
  const { fetchUrl, loading: urlLoading } = useSignedUrl();
  const { permission, requestMic } = useMicPermission();

  const isActive = status === "connected";
  const isConnecting = status === "connecting" || urlLoading;

  async function handleClick() {
    if (isActive) {
      controls.endSession();
      return;
    }

    if (permission === "denied") return;

    if (permission !== "granted") {
      const granted = await requestMic();
      if (!granted) return;
    }

    const signedUrl = await fetchUrl();
    if (!signedUrl) return;

    controls.startSession({ signedUrl });
  }

  if (permission === "denied") {
    return (
      <div className="text-center p-4">
        <div className="text-red-400 text-sm mb-2">Microphone requis</div>
        <p className="text-gray-500 text-xs">
          Reinitialiser les permissions dans les parametres du navigateur
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={`
        px-8 py-4 rounded-full text-lg font-medium transition-all duration-300
        ${isActive
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
        }
        ${isConnecting ? "opacity-50 cursor-wait" : "cursor-pointer"}
      `}
    >
      {isConnecting
        ? "Connexion..."
        : isActive
          ? "Terminer l'appel"
          : "Appuyer pour commencer"
      }
    </button>
  );
});
