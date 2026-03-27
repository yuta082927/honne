"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UsageResponse } from "@/types/fortune";

export function useUsage(accessToken: string | null) {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const lastLinkedKeyRef = useRef<string | null>(null);

  const fetchUsage = useCallback(async (token?: string | null) => {
    setLoadingUsage(true);
    try {
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/usage", { cache: "no-store", headers });
      const body = (await res.json().catch(() => null)) as UsageResponse | null;

      if (!res.ok || !body || typeof body.remaining !== "number") {
        throw new Error("failed to fetch usage");
      }
      setUsage(body);
    } catch {
      setUsage(null);
    } finally {
      setLoadingUsage(false);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setLoadingUsage(false);
      setUsage(null);
      return;
    }
    void fetchUsage(accessToken);
  }, [fetchUsage, accessToken]);

  // ログイン後に匿名セッションのデータをユーザーに紐付ける
  useEffect(() => {
    if (!usage?.sessionId || !accessToken) return;

    const key = `${usage.sessionId}:${accessToken.slice(0, 16)}`;
    if (lastLinkedKeyRef.current === key) return;
    lastLinkedKeyRef.current = key;

    void fetch("/api/me/link-anonymous", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ sessionId: usage.sessionId })
    });
  }, [usage?.sessionId, accessToken]);

  return { usage, loadingUsage, setUsage };
}
