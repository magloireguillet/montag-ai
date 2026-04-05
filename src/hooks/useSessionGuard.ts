"use client";

import { useEffect } from "react";
import { useConversationContext } from "@/components/providers/ConversationWrapper";

export function useSessionGuard() {
  const { endSession } = useConversationContext();

  useEffect(() => {
    const handleUnload = () => {
      endSession();
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [endSession]);
}
