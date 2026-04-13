"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import type { FortuneMode, ResponseDepth } from "@/lib/constants";
import type { FortuneCreateResponse, UsageResponse } from "@/types/fortune";
import type { BirthFormData } from "@/hooks/useBirthForm";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode: FortuneMode;
  depth: ResponseDepth;
  pending?: boolean;
  isError?: boolean;
};

type TarotCardPosition = "過去" | "現在" | "未来";
type TarotCardForApi = {
  name: string;
  position: TarotCardPosition;
};

type SubmitFortuneArgs = {
  concern: string;
  cards?: TarotCardForApi[];
  clearInput?: boolean;
  streamResponse?: boolean;
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type { ChatMessage, TarotCardForApi };
const debugOpenAI = process.env.NEXT_PUBLIC_OPENAI_DEBUG === "1";

export function useFortuneChat({
  accessToken,
  mode,
  depth,
  birthData,
  isUnlimited,
  currentCost,
  remaining,
  setIsBirthFormOpen,
  setUsage
}: {
  accessToken: string | null;
  mode: FortuneMode;
  depth: ResponseDepth;
  birthData: BirthFormData;
  isUnlimited: boolean;
  currentCost: number;
  remaining: number;
  setIsBirthFormOpen: (open: boolean) => void;
  setUsage: React.Dispatch<React.SetStateAction<UsageResponse | null>>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // messagesをrefで保持してonSubmitのstale closure問題を回避
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 新しいメッセージが追加されたら末尾にスクロール
  useEffect(() => {
    const element = listRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [messages]);

  const streamAssistantMessage = useCallback(
    async ({
      pendingId,
      text,
      responseMode,
      responseDepth
    }: {
      pendingId: string;
      text: string;
      responseMode: FortuneMode;
      responseDepth: ResponseDepth;
    }) => {
      const units = Array.from(text);
      const total = units.length;
      const maxFrames = 120;
      const chunkSize = Math.max(1, Math.ceil(total / maxFrames));

      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId ? { ...m, pending: false, content: "", mode: responseMode, depth: responseDepth } : m
        )
      );

      let cursor = 0;
      while (cursor < total) {
        cursor = Math.min(total, cursor + chunkSize);
        const next = units.slice(0, cursor).join("");
        setMessages((prev) =>
          prev.map((m) => (m.id === pendingId ? { ...m, content: next, mode: responseMode, depth: responseDepth } : m))
        );
        await sleep(22);
      }
    },
    []
  );

  const submitFortune = useCallback(
    async ({ concern, cards, clearInput = true, streamResponse = false }: SubmitFortuneArgs): Promise<boolean> => {
      const normalizedConcern = concern.trim();
      if (!normalizedConcern || submitting) return false;

      if (!accessToken) {
        setGlobalError("ログインが必要です。");
        return false;
      }

      if (mode !== "タロット" && !birthData.selfBirthDate) {
        setGlobalError("自分の生年月日は必須です。入力してから送信してください。");
        setIsBirthFormOpen(true);
        return false;
      }

      if (mode === "タロット" && (!cards || cards.length !== 3)) {
        setGlobalError("タロットは3枚のカード選択が必要です。");
        return false;
      }

      if (!isUnlimited && remaining < currentCost) {
        setGlobalError(`残り回数が不足しています。${depth}は${currentCost}回分消費します。`);
        return false;
      }

      setSubmitting(true);
      setGlobalError(null);
      if (clearInput) setInput("");
      setIsBirthFormOpen(false);

      const userMessage: ChatMessage = { id: createId("user"), role: "user", content: normalizedConcern, mode, depth };
      const pendingId = createId("assistant");
      const pendingMessage: ChatMessage = {
        id: pendingId,
        role: "assistant",
        content: "鑑定中です...",
        mode,
        depth,
        pending: true
      };

      const historyForApi = [...messagesRef.current, userMessage]
        .filter((m) => !m.pending)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, userMessage, pendingMessage]);

      try {
        const debugRequestId = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
        headers["x-debug-request-id"] = debugRequestId;

        const requestBody = {
            mode,
            depth,
            concern: normalizedConcern,
            cards: cards?.length ? cards : undefined,
            selfBirthDate: birthData.selfBirthDate || undefined,
            selfBirthTime: birthData.selfBirthTime || undefined,
            selfBirthPlace: birthData.selfBirthPlace || undefined,
            partnerBirthDate: birthData.partnerBirthDate || undefined,
            partnerBirthTime: birthData.partnerBirthTime || undefined,
            partnerBirthPlace: birthData.partnerBirthPlace || undefined,
            gender: birthData.gender || undefined,
            history: historyForApi
          };
        if (debugOpenAI) {
          console.log("[useFortuneChat] request payload", {
            debugRequestId,
            mode: requestBody.mode,
            depth: requestBody.depth,
            concernLength: requestBody.concern.length,
            concernPreview: requestBody.concern.slice(0, 20),
            historyCount: requestBody.history?.length ?? 0,
            cardsCount: requestBody.cards?.length ?? 0,
            hasSelfBirthDate: Boolean(requestBody.selfBirthDate),
            hasPartnerBirthDate: Boolean(requestBody.partnerBirthDate)
          });
        }

        const res = await fetch("/api/fortune", {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody)
        });

        const body = (await res.json().catch(() => null)) as FortuneCreateResponse | null;

        if (!res.ok) {
          if (body?.code === "FREE_LIMIT_REACHED") {
            setUsage((prev) => (prev ? { ...prev, usedCount: prev.freeLimit, remaining: 0, unlimited: false } : null));
            setMessages((prev) =>
              prev.map((m) =>
                m.id === pendingId ? { ...m, pending: false, isError: true, content: "無料回数の上限に達しました。" } : m
              )
            );
            return false;
          }

          const errorMessage = body?.error ?? "鑑定の生成に失敗しました。時間をおいて再度お試しください。";
          setGlobalError(errorMessage);
          setMessages((prev) =>
            prev.map((m) => (m.id === pendingId ? { ...m, pending: false, isError: true, content: errorMessage } : m))
          );
          return false;
        }

        if (!body?.response) {
          const errorMessage = "鑑定結果の取得に失敗しました。時間をおいて再度お試しください。";
          setGlobalError(errorMessage);
          setMessages((prev) =>
            prev.map((m) => (m.id === pendingId ? { ...m, pending: false, isError: true, content: errorMessage } : m))
          );
          return false;
        }

        setUsage((prev) =>
          prev
            ? {
                ...prev,
                usedCount: body.usedCount,
                freeLimit: body.freeLimit,
                remaining: body.remaining,
                role: body.role ?? prev.role,
                plan: body.plan ?? prev.plan,
                unlimited: body.unlimited ?? prev.unlimited,
                deepCost: body.deepCost ?? prev.deepCost,
                accessLabel: body.accessLabel ?? prev.accessLabel
              }
            : null
        );

        if (streamResponse) {
          await streamAssistantMessage({
            pendingId,
            text: body.response,
            responseMode: body.mode,
            responseDepth: body.depth
          });
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === pendingId ? { ...m, pending: false, content: body.response, mode: body.mode, depth: body.depth } : m
            )
          );
        }

        return true;
      } catch {
        const errorMessage = "通信エラーが発生しました。時間をおいて再度お試しください。";
        setGlobalError(errorMessage);
        setMessages((prev) =>
          prev.map((m) => (m.id === pendingId ? { ...m, pending: false, isError: true, content: errorMessage } : m))
        );
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [
      submitting,
      accessToken,
      mode,
      birthData,
      isUnlimited,
      remaining,
      currentCost,
      depth,
      setIsBirthFormOpen,
      setUsage,
      streamAssistantMessage
    ]
  );

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await submitFortune({ concern: input, clearInput: true, streamResponse: false });
    },
    [input, submitFortune]
  );

  const submitTarotFortune = useCallback(
    async ({ concern, cards }: { concern: string; cards: TarotCardForApi[] }) =>
      submitFortune({ concern, cards, clearInput: true, streamResponse: true }),
    [submitFortune]
  );

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return {
    messages,
    input,
    setInput,
    submitting,
    globalError,
    setGlobalError,
    onSubmit,
    submitTarotFortune,
    onComposerKeyDown,
    listRef,
    inputRef
  };
}
