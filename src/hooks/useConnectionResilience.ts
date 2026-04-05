"use client";

import { useEffect, useRef, useCallback } from "react";
import { useConversationContext } from "@/components/providers/ConversationWrapper";

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

export function useConnectionResilience() {
  const { status, startSession } = useConversationContext();
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const attemptReconnect = useCallback(async () => {
    if (retriesRef.current >= MAX_RETRIES) return false;

    const delay = BASE_DELAY * Math.pow(2, retriesRef.current);
    retriesRef.current++;

    await new Promise((r) => (timerRef.current = setTimeout(r, delay)));

    try {
      await startSession();
      retriesRef.current = 0;
      return true;
    } catch {
      return attemptReconnect();
    }
  }, [startSession]);

  useEffect(() => {
    if (status === "connected") {
      retriesRef.current = 0;
    }
  }, [status]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    status,
    retriesExhausted: retriesRef.current >= MAX_RETRIES,
    attemptReconnect,
  };
}
