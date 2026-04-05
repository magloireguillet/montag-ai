"use client";

import { useEffect, useRef, useCallback } from "react";
import { useConversationStatus, useConversationControls } from "@elevenlabs/react";
import { useSignedUrl } from "./useSignedUrl";

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1s, 2s, 4s

export function useConnectionResilience() {
  const { status } = useConversationStatus();
  const controls = useConversationControls();
  const { getValidUrl } = useSignedUrl();
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const attemptReconnect = useCallback(async () => {
    if (retriesRef.current >= MAX_RETRIES) return false;

    const delay = BASE_DELAY * Math.pow(2, retriesRef.current);
    retriesRef.current++;

    await new Promise((r) => (timerRef.current = setTimeout(r, delay)));

    const url = await getValidUrl();
    if (!url) return false;

    try {
      controls.startSession({ signedUrl: url });
      retriesRef.current = 0;
      return true;
    } catch {
      return attemptReconnect();
    }
  }, [controls, getValidUrl]);

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
    resetRetries: () => {
      retriesRef.current = 0;
    },
  };
}
