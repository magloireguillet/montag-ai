"use client";

import { useEffect } from "react";
import { useConversationControls } from "@elevenlabs/react";

/**
 * Ensures the ElevenLabs session is properly cleaned up on unmount
 * and page unload (prevents mic/WS leak).
 */
export function useSessionGuard() {
  const controls = useConversationControls();

  useEffect(() => {
    const handleUnload = () => {
      controls.endSession();
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      controls.endSession();
    };
  }, [controls]);
}
