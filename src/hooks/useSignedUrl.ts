import { useState, useCallback } from "react";

interface SignedUrlState {
  url: string | null;
  expiresAt: number | null;
  loading: boolean;
  error: string | null;
}

const EXPIRY_DURATION = 14 * 60 * 1000; // 14 min (buffer before 15min server expiry)

export function useSignedUrl() {
  const [state, setState] = useState<SignedUrlState>({
    url: null,
    expiresAt: null,
    loading: false,
    error: null,
  });

  const fetch_ = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await fetch("/api/signed-url", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { signedUrl } = await res.json();

      setState({
        url: signedUrl,
        expiresAt: Date.now() + EXPIRY_DURATION,
        loading: false,
        error: null,
      });

      return signedUrl as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setState((s) => ({ ...s, loading: false, error: msg }));
      return null;
    }
  }, []);

  const getValidUrl = useCallback(async () => {
    if (state.url && state.expiresAt && Date.now() < state.expiresAt) {
      return state.url;
    }
    return fetch_();
  }, [state.url, state.expiresAt, fetch_]);

  return { ...state, fetchUrl: fetch_, getValidUrl };
}
