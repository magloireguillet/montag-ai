"use client";

import { useState, useEffect } from "react";
import { useConversationControls } from "@elevenlabs/react";
import { useSessionStore } from "@/store/session.store";

const WARNING_THRESHOLD = 480; // 8 minutes
const MAX_DURATION = 600; // 10 minutes

export function useCallDurationLimit() {
  const callStartTime = useSessionStore((s) => s.callStartTime);
  const controls = useConversationControls();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!callStartTime) {
      setElapsedSeconds(0);
      return;
    }

    const tick = () => {
      const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
      setElapsedSeconds(elapsed);

      if (elapsed >= MAX_DURATION) {
        controls.endSession();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [callStartTime, controls]);

  return {
    elapsedSeconds,
    isWarning: elapsedSeconds >= WARNING_THRESHOLD && elapsedSeconds < MAX_DURATION,
    isExpired: elapsedSeconds >= MAX_DURATION,
  };
}
