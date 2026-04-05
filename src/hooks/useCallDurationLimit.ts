"use client";

import { useState, useEffect, useRef } from "react";
import { useConversationContext } from "@/components/providers/ConversationWrapper";
import { useSessionStore } from "@/store/session.store";

const WARNING_THRESHOLD = 480; // 8 minutes
const MAX_DURATION = 600; // 10 minutes

export function useCallDurationLimit() {
  const callStartTime = useSessionStore((s) => s.callStartTime);
  const { endSession } = useConversationContext();
  const [flags, setFlags] = useState({ isWarning: false, isExpired: false });
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!callStartTime) {
      elapsedRef.current = 0;
      setFlags({ isWarning: false, isExpired: false });
      return;
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
      elapsedRef.current = elapsed;

      const isWarning = elapsed >= WARNING_THRESHOLD && elapsed < MAX_DURATION;
      const isExpired = elapsed >= MAX_DURATION;

      setFlags((prev) => {
        if (prev.isWarning === isWarning && prev.isExpired === isExpired) return prev;
        return { isWarning, isExpired };
      });

      if (isExpired) {
        endSession();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [callStartTime, endSession]);

  return {
    elapsedSeconds: elapsedRef.current,
    isWarning: flags.isWarning,
    isExpired: flags.isExpired,
  };
}
