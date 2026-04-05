"use client";

import { useState, useEffect, useCallback } from "react";

type MicPermission = "prompt" | "granted" | "denied" | "unsupported";

export function useMicPermission() {
  const [permission, setPermission] = useState<MicPermission>("prompt");

  useEffect(() => {
    if (!navigator.permissions) {
      setPermission("unsupported");
      return;
    }

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((result) => {
        setPermission(result.state as MicPermission);
        result.onchange = () => setPermission(result.state as MicPermission);
      })
      .catch(() => setPermission("unsupported"));
  }, []);

  const requestMic = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermission("granted");
      return true;
    } catch {
      setPermission("denied");
      return false;
    }
  }, []);

  return { permission, requestMic };
}
