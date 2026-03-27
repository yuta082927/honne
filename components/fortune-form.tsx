"use client";

import Link from "next/link";
import { DEPTH_COST, FORTUNE_MODES, GENDER_OPTIONS, type FortuneMode, type ResponseDepth } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useBirthForm } from "@/hooks/useBirthForm";
import { useFortuneChat, type TarotCardForApi } from "@/hooks/useFortuneChat";
import { useUsage } from "@/hooks/useUsage";
import { FortuneResponseCard } from "@/components/fortune-response-card";
import { PremiumCta } from "@/components/premium-cta";
import { RegisterCta } from "@/components/register-cta";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

function buildUsageBadge(usage: ReturnType<typeof useUsage>["usage"], loading: boolean): string {
  if (loading) return "確認中...";
  if (!usage) return "利用状況を確認できません";
  if (usage.unlimited) return usage.accessLabel ?? "無制限利用中";
  if (usage.plan === "premium") return `プレミアム: あと${usage.remaining}回`;
  return `今日の無料鑑定：あと${usage.remaining}回`;
}

type MajorArcanaCard = {
  id: number;
  name: string;
  symbol: string;
};

type DeckCard = MajorArcanaCard & { deckKey: string };
type TarotFlowStage = "idle" | "dealing" | "selecting" | "revealing";

const TAROT_POSITIONS: TarotCardForApi["position"][] = ["過去", "現在", "未来"];

const MAJOR_ARCANA: MajorArcanaCard[] = [
  { id: 0, name: "愚者", symbol: "🌀" },
  { id: 1, name: "魔術師", symbol: "⚡" },
  { id: 2, name: "女教皇", symbol: "🌙" },
  { id: 3, name: "女帝", symbol: "🌿" },
  { id: 4, name: "皇帝", symbol: "👑" },
  { id: 5, name: "法王", symbol: "🔑" },
  { id: 6, name: "恋人", symbol: "💞" },
  { id: 7, name: "戦車", symbol: "⚔️" },
  { id: 8, name: "力", symbol: "🦁" },
  { id: 9, name: "隠者", symbol: "🕯️" },
  { id: 10, name: "運命の輪", symbol: "☯️" },
  { id: 11, name: "正義", symbol: "⚖️" },
  { id: 12, name: "吊るされた男", symbol: "🔮" },
  { id: 13, name: "死神", symbol: "🌑" },
  { id: 14, name: "節制", symbol: "✨" },
  { id: 15, name: "悪魔", symbol: "🔥" },
  { id: 16, name: "塔", symbol: "⚡" },
  { id: 17, name: "星", symbol: "⭐" },
  { id: 18, name: "月", symbol: "🌕" },
  { id: 19, name: "太陽", symbol: "☀️" },
  { id: 20, name: "審判", symbol: "🎺" },
  { id: 21, name: "世界", symbol: "🌍" }
];

function shuffle<T>(values: T[]): T[] {
  const next = [...values];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function pickTenTarotCards(): DeckCard[] {
  const seed = Date.now();
  return shuffle(MAJOR_ARCANA)
    .slice(0, 10)
    .map((card, index) => ({ ...card, deckKey: `${card.id}-${seed}-${index}` }));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function FortuneForm() {
  const { authUser, accessToken } = useAuth();
  const { usage, loadingUsage, setUsage } = useUsage(accessToken);
  const birthForm = useBirthForm();

  const [mode, setMode] = useState<FortuneMode>("総合");
  const [depth, setDepth] = useState<ResponseDepth>("ライト");

  // モードに応じた入力項目の表示制御
  const showBirthSection = mode !== "タロット";
  const showPartnerFields = mode === "相性" || mode === "総合";
  const showBirthTime = mode !== "動物占い";
  const showBirthPlace = mode === "西洋占星術" || mode === "総合";

  const deepCost = usage?.deepCost ?? DEPTH_COST["ディープ"];
  const currentCost = depth === "ディープ" ? deepCost : DEPTH_COST["ライト"];
  const remaining = usage?.remaining ?? 0;
  const isUnlimited = Boolean(usage?.unlimited);
  const isLimited = usage ? !isUnlimited && usage.remaining <= 0 : false;
  const cannotAffordCurrentDepth = usage ? !isUnlimited && usage.remaining < currentCost : false;
  const usageBadge = buildUsageBadge(usage, loadingUsage);

  const {
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
  } =
    useFortuneChat({
      accessToken,
      mode,
      depth,
      birthData: birthForm.data,
      isUnlimited,
      currentCost,
      remaining,
      setIsBirthFormOpen: birthForm.setIsBirthFormOpen,
      setUsage
    });

  const [tarotFlowStage, setTarotFlowStage] = useState<TarotFlowStage>("idle");
  const [tarotDeck, setTarotDeck] = useState<DeckCard[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [revealedCardIds, setRevealedCardIds] = useState<number[]>([]);
  const [pendingTarotConcern, setPendingTarotConcern] = useState<string | null>(null);
  const dealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSelectDeep() {
    setDepth("ディープ");
    inputRef.current?.focus();
  }

  const resetTarotFlow = useCallback(() => {
    setTarotFlowStage("idle");
    setTarotDeck([]);
    setSelectedCardIds([]);
    setRevealedCardIds([]);
    setPendingTarotConcern(null);
  }, []);

  useEffect(() => {
    return () => {
      if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (mode !== "タロット") {
      if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
      resetTarotFlow();
    }
  }, [mode, resetTarotFlow]);

  async function runTarotReading(nextSelectedIds: number[]) {
    const concern = (pendingTarotConcern ?? input).trim();
    if (!concern) {
      setGlobalError("悩みを入力してからカードを選んでください。");
      return;
    }

    const selectedCards = nextSelectedIds
      .map((id) => tarotDeck.find((card) => card.id === id))
      .filter((card): card is DeckCard => Boolean(card));

    if (selectedCards.length !== 3) {
      setGlobalError("3枚のカードを選択してください。");
      return;
    }

    setTarotFlowStage("revealing");
    setRevealedCardIds([]);

    const cardsForApi: TarotCardForApi[] = selectedCards.map((card, index) => ({
      name: card.name,
      position: TAROT_POSITIONS[index]
    }));

    const revealTask = (async () => {
      for (const card of selectedCards) {
        await sleep(300);
        setRevealedCardIds((prev) => (prev.includes(card.id) ? prev : [...prev, card.id]));
      }
    })();

    const submitTask = submitTarotFortune({
      concern,
      cards: cardsForApi
    });

    const [submitSucceeded] = await Promise.all([submitTask, revealTask]);

    if (submitSucceeded) {
      resetTarotFlow();
      setInput("");
      return;
    }

    setTarotFlowStage("selecting");
    setSelectedCardIds([]);
    setRevealedCardIds([]);
  }

  function handleStartTarotSelection() {
    if (submitting || loadingUsage) return;

    const concern = input.trim();
    if (!concern) {
      setGlobalError("悩みを入力してからカードを引いてください。");
      inputRef.current?.focus();
      return;
    }

    if (!accessToken) {
      setGlobalError("ログインが必要です。");
      return;
    }

    if (!isUnlimited && remaining < currentCost) {
      setGlobalError(`残り回数が不足しています。${depth}は${currentCost}回分消費します。`);
      return;
    }

    setGlobalError(null);
    setPendingTarotConcern(concern);
    setTarotDeck(pickTenTarotCards());
    setSelectedCardIds([]);
    setRevealedCardIds([]);
    setTarotFlowStage("dealing");

    if (dealTimerRef.current) clearTimeout(dealTimerRef.current);
    dealTimerRef.current = setTimeout(() => {
      setTarotFlowStage("selecting");
    }, 420);
  }

  function handleToggleTarotCard(cardId: number) {
    if (tarotFlowStage !== "selecting") return;

    setSelectedCardIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }

      if (prev.length >= 3) {
        return prev;
      }

      const next = [...prev, cardId];
      if (next.length === 3) {
        void runTarotReading(next);
      }
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (mode === "タロット") {
      event.preventDefault();
      if (tarotFlowStage === "idle") {
        handleStartTarotSelection();
      }
      return;
    }

    void onSubmit(event);
  }

  const isTarotMode = mode === "タロット";
  const isTarotFlowActive = isTarotMode && tarotFlowStage !== "idle";
  const tarotSubmitLabel =
    tarotFlowStage === "dealing"
      ? "展開中..."
      : tarotFlowStage === "selecting"
        ? `${selectedCardIds.length}/3枚選択`
        : tarotFlowStage === "revealing" || submitting
          ? "鑑定中..."
          : "カードを引く";

  const tarotGuideText =
    tarotFlowStage === "dealing"
      ? "カードが静かに並び始めています..."
      : tarotFlowStage === "selecting"
        ? "3枚選んでください"
        : tarotFlowStage === "revealing"
          ? "選ばれたカードを開いています..."
          : "悩みを入力してカードを引いてください";

  // 画面上部の星（5個）
  const CHAT_STARS = [
    { left: "12%", top: "6%", size: 2,   delay: "0s",   dur: "2.8s" },
    { left: "32%", top: "3%", size: 1.5, delay: "0.7s", dur: "2.2s" },
    { left: "60%", top: "7%", size: 2,   delay: "1.2s", dur: "3s"   },
    { left: "76%", top: "2%", size: 1,   delay: "0.3s", dur: "2.5s" },
    { left: "88%", top: "5%", size: 1.5, delay: "1.8s", dur: "2s"   }
  ];

  return (
    <main className="h-[100dvh] overflow-hidden text-star" style={{ background: "#0d0a1a" }}>
      <section className="mx-auto flex h-full w-full max-w-5xl flex-col">
        <header className="shrink-0 px-3 py-3 sm:px-5" style={{ borderBottom: "1px solid rgba(168,139,250,0.2)", background: "rgba(13,10,26,0.95)" }}>
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="text-base font-semibold text-star hover:text-violet-glow">
              AI占いくん
            </Link>
            <p className="rounded-full px-3 py-1 text-[11px] text-starsub" style={{ border: "1px solid rgba(168,139,250,0.2)", background: "rgba(255,255,255,0.05)" }}>{usageBadge}</p>
          </div>
          <p className="mt-1 text-[11px] text-starsub">毎日0時に回復</p>
        </header>

        <div ref={listRef} className="relative flex-1 overflow-y-auto px-3 pb-44 pt-4 sm:px-5 sm:pb-56">
          {/* 星5個（画面上部） */}
          {CHAT_STARS.map((s, i) => (
            <span
              key={i}
              className="pointer-events-none absolute rounded-full bg-star"
              style={{
                left: s.left, top: s.top,
                width: s.size, height: s.size,
                opacity: 0.35,
                animation: `twinkle ${s.dur} ${s.delay} ease-in-out infinite`
              }}
            />
          ))}

          {messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center">
              <p className="max-w-md text-center text-sm text-starsub">恋愛や人生の悩みを入力してください。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isUser = message.role === "user";

                if (isUser) {
                  return (
                    <div key={message.id} className="msg-fade-up flex justify-end">
                      <article
                        className="max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-star shadow-sm sm:max-w-[75%]"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </article>
                    </div>
                  );
                }

                if (message.pending || message.isError) {
                  return (
                    <div key={message.id} className="msg-fade-up flex justify-start">
                      <article
                        className="max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%]"
                        style={
                          message.isError
                            ? { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }
                            : { background: "rgba(124,58,237,0.15)", border: "1px solid rgba(168,139,250,0.3)" }
                        }
                      >
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-starsub">
                          {message.mode} / {message.depth}
                        </p>
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </article>
                    </div>
                  );
                }

                return (
                  <div key={message.id} className="msg-fade-up space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-starsub">
                      {message.mode} / {message.depth}
                    </p>
                    <FortuneResponseCard
                      text={message.content}
                      depth={message.depth}
                      canSelectDeep={!isLimited && (isUnlimited || remaining >= deepCost)}
                      onSelectDeep={handleSelectDeep}
                    />
                  </div>
                );
              })}

              {isLimited ? (
                <div className="space-y-3">
                  {!authUser ? (
                    <p className="rounded-xl px-3 py-2 text-[11px] text-starsub" style={{ border: "1px solid rgba(168,139,250,0.2)", background: "rgba(255,255,255,0.04)" }}>
                      無料枠が終了しました。ログインすると鑑定履歴を保存できます。
                    </p>
                  ) : null}
                  {!authUser ? <RegisterCta compact /> : null}
                  <PremiumCta />
                </div>
              ) : null}

              {!authUser && !isLimited ? (
                <div className="rounded-xl px-3 py-2 text-[11px] text-starsub" style={{ border: "1px solid rgba(168,139,250,0.2)", background: "rgba(255,255,255,0.04)" }}>
                  無料登録で鑑定履歴を保存して、前回の続きをいつでも見返せます。
                  <Link href="/signup" className="ml-1 text-violet-glow underline underline-offset-2">
                    新規登録
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <footer
          className="sticky bottom-0 z-20 shrink-0 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 backdrop-blur sm:px-5"
          style={{ borderTop: "1px solid rgba(168,139,250,0.2)", background: "rgba(13,10,26,0.95)", boxShadow: "0 -10px 26px rgba(124,58,237,0.14)" }}
        >
          <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1">
            <label className="relative">
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as FortuneMode)}
                className="appearance-none rounded-full px-3 py-1 pr-7 text-xs font-medium text-star outline-none"
                style={{ border: "1px solid rgba(168,139,250,0.3)", background: "rgba(255,255,255,0.07)" }}
                disabled={submitting}
              >
                {FORTUNE_MODES.map((item) => (
                  <option key={item} value={item} style={{ background: "#1a1030" }}>
                    {item}
                  </option>
                ))}
                <option disabled style={{ background: "#1a1030", color: "#6b7280" }}>
                  ── 近日追加予定 ──
                </option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-starsub">▼</span>
            </label>

            <div className="flex items-center rounded-full p-1" style={{ border: "1px solid rgba(168,139,250,0.3)", background: "rgba(255,255,255,0.05)" }}>
              <button
                type="button"
                onClick={() => setDepth("ライト")}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  depth === "ライト" ? "bg-violet/20 text-star" : "text-starsub"
                }`}
                disabled={submitting}
              >
                ライト
                <span className="ml-1 text-[10px] font-normal">1回分</span>
              </button>
              <button
                type="button"
                onClick={handleSelectDeep}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                  depth === "ディープ"
                    ? "bg-gradient-to-r from-violet to-violet-soft text-white"
                    : "text-starsub hover:bg-violet/10"
                }`}
                disabled={submitting}
              >
                ディープ
                <span className="ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-violet-glow" style={{ background: "rgba(168,139,250,0.15)" }}>おすすめ</span>
              </button>
            </div>

            <p className="whitespace-nowrap text-[11px] text-starsub">より詳しく鑑定 / {deepCost}回分消費</p>

            {showBirthSection ? (
              <button
                type="button"
                onClick={() => birthForm.setIsBirthFormOpen((prev) => !prev)}
                className="ml-auto whitespace-nowrap text-[11px] text-violet-glow underline underline-offset-2"
                aria-expanded={birthForm.isBirthFormOpen}
              >
                {birthForm.isBirthFormOpen ? "生年月日入力を閉じる" : "生年月日を編集する"}
              </button>
            ) : (
              <p className="ml-auto whitespace-nowrap text-[11px] text-starsub">タロット: 生年月日不要</p>
            )}
          </div>

          {showBirthSection && (
            <div
              className={`grid transition-all duration-300 ease-out ${birthForm.isBirthFormOpen ? "mb-2 grid-rows-[1fr] opacity-100" : "mb-0 grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 gap-2 rounded-xl p-2 sm:grid-cols-3" style={{ border: "1px solid rgba(168,139,250,0.2)", background: "rgba(124,58,237,0.08)" }}>
                  <label className="space-y-1">
                    <span className="text-[11px] text-starsub">自分の生年月日（必須）</span>
                    <input
                      type="date"
                      value={birthForm.data.selfBirthDate}
                      onChange={(event) => birthForm.setSelfBirthDate(event.target.value)}
                      className="w-full rounded-lg px-2 py-1.5 text-xs text-star outline-none"
                      style={{ border: "1px solid rgba(168,139,250,0.25)", background: "rgba(255,255,255,0.05)" }}
                      disabled={submitting}
                    />
                  </label>
                  {showBirthTime && (
                    <label className="space-y-1">
                      <span className="text-[11px] text-starsub">
                        自分の出生時刻{mode === "算命学・四柱推命" ? "（推奨）" : "（任意）"}
                      </span>
                      <input
                        type="time"
                        value={birthForm.data.selfBirthTime}
                        onChange={(event) => birthForm.setSelfBirthTime(event.target.value)}
                        className="w-full rounded-lg px-2 py-1.5 text-xs text-star outline-none"
                        style={{ border: "1px solid rgba(168,139,250,0.25)", background: "rgba(255,255,255,0.05)" }}
                        disabled={submitting}
                      />
                    </label>
                  )}
                  {showBirthPlace && (
                    <label className="space-y-1">
                      <span className="text-[11px] text-starsub">自分の出生地（任意）</span>
                      <input
                        type="text"
                        value={birthForm.data.selfBirthPlace}
                        onChange={(event) => birthForm.setSelfBirthPlace(event.target.value)}
                        placeholder="例: 東京都"
                        className="w-full rounded-lg px-2 py-1.5 text-xs text-star outline-none placeholder:text-starsub/60"
                        style={{ border: "1px solid rgba(168,139,250,0.25)", background: "rgba(255,255,255,0.05)" }}
                        disabled={submitting}
                        maxLength={80}
                      />
                    </label>
                  )}
                  {showPartnerFields && (
                    <>
                      <label className="space-y-1">
                        <span className="text-[11px] text-starsub">
                          相手の生年月日{mode === "相性" ? "（推奨）" : "（任意）"}
                        </span>
                        <input
                          type="date"
                          value={birthForm.data.partnerBirthDate}
                          onChange={(event) => birthForm.setPartnerBirthDate(event.target.value)}
                          className="w-full rounded-lg px-2 py-1.5 text-xs text-star outline-none"
                          style={{ border: "1px solid rgba(168,139,250,0.25)", background: "rgba(255,255,255,0.05)" }}
                          disabled={submitting}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[11px] text-starsub">相手の出生時刻（任意）</span>
                        <input
                          type="time"
                          value={birthForm.data.partnerBirthTime}
                          onChange={(event) => birthForm.setPartnerBirthTime(event.target.value)}
                          className="w-full rounded-lg px-2 py-1.5 text-xs text-star outline-none"
                          style={{ border: "1px solid rgba(168,139,250,0.25)", background: "rgba(255,255,255,0.05)" }}
                          disabled={submitting}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[11px] text-starsub">相手の出生地（任意）</span>
                        <input
                          type="text"
                          value={birthForm.data.partnerBirthPlace}
                          onChange={(event) => birthForm.setPartnerBirthPlace(event.target.value)}
                          placeholder="例: 大阪府"
                          className="w-full rounded-lg px-2 py-1.5 text-xs text-star outline-none placeholder:text-starsub/60"
                          style={{ border: "1px solid rgba(168,139,250,0.25)", background: "rgba(255,255,255,0.05)" }}
                          disabled={submitting}
                          maxLength={80}
                        />
                      </label>
                    </>
                  )}
                  <label className="space-y-1 sm:col-span-3">
                    <span className="text-[11px] text-starsub">性別（任意）</span>
                    <select
                      value={birthForm.data.gender}
                      onChange={(event) => birthForm.setGender(event.target.value as Parameters<typeof birthForm.setGender>[0])}
                      className="w-full rounded-lg px-2 py-1.5 text-xs text-star outline-none"
                      style={{ border: "1px solid rgba(168,139,250,0.25)", background: "rgba(13,10,26,0.9)" }}
                      disabled={submitting}
                    >
                      <option value="" style={{ background: "#1a1030" }}>未選択</option>
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option} value={option} style={{ background: "#1a1030" }}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>
          )}

          {isTarotMode ? (
            <div className="mb-3 rounded-2xl border px-3 py-3" style={{ borderColor: "rgba(168,139,250,0.25)", background: "rgba(124,58,237,0.08)" }}>
              <p className="text-[11px] tracking-[0.08em] text-violet-glow">{tarotGuideText}</p>

              {isTarotFlowActive ? (
                <div className="tarot-deck-scroll mt-3">
                  {tarotDeck.map((card, index) => {
                    const isSelected = selectedCardIds.includes(card.id);
                    const selectedOrder = selectedCardIds.indexOf(card.id);
                    const isRevealed = revealedCardIds.includes(card.id);
                    const hideNonSelected = tarotFlowStage === "revealing" && !isSelected;

                    return (
                      <button
                        key={card.deckKey}
                        type="button"
                        onClick={() => handleToggleTarotCard(card.id)}
                        className={`tarot-card-shell ${hideNonSelected ? "tarot-card-shell-hidden" : ""}`}
                        style={{ animationDelay: `${index * 55}ms` }}
                        disabled={tarotFlowStage !== "selecting"}
                        aria-label={`${card.name}を選択`}
                      >
                        {isSelected ? (
                          <span className="tarot-card-order">
                            {TAROT_POSITIONS[selectedOrder]}
                          </span>
                        ) : null}

                        <span
                          className={`tarot-card ${isSelected ? "tarot-card-selected" : ""} ${isRevealed ? "tarot-card-revealed" : ""}`}
                        >
                          <span className="tarot-card-inner">
                            <span className="tarot-card-face tarot-card-back">
                              <span className="tarot-card-diamond" />
                            </span>
                            <span className="tarot-card-face tarot-card-front">
                              <span className="tarot-card-symbol">{card.symbol}</span>
                              <span className="tarot-card-name">{card.name}</span>
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={isTarotMode ? undefined : onComposerKeyDown}
              placeholder={isTarotMode ? "悩みを入力してカードを引いてください" : "恋愛や人生の悩みを入力してください"}
              className="min-h-[52px] w-full rounded-2xl px-3 py-3 text-sm text-star outline-none placeholder:text-starsub/65"
              style={{ border: "1px solid rgba(168,139,250,0.4)", background: "rgba(255,255,255,0.05)" }}
              maxLength={2000}
              rows={2}
              autoFocus
              disabled={!accessToken || submitting || loadingUsage || isLimited || cannotAffordCurrentDepth || isTarotFlowActive}
            />
            <button
              type="submit"
              disabled={
                !accessToken ||
                submitting ||
                loadingUsage ||
                isLimited ||
                cannotAffordCurrentDepth ||
                input.trim().length === 0 ||
                (isTarotMode && tarotFlowStage !== "idle")
              }
              className="h-[52px] rounded-2xl bg-gradient-to-r from-violet to-violet-soft px-4 text-sm font-semibold text-white shadow-sm shadow-violet/30 disabled:opacity-50"
            >
              {isTarotMode ? (
                <span>{tarotSubmitLabel}</span>
              ) : (
                <>
                  <span className="text-xl leading-none" aria-hidden="true">
                    ↑
                  </span>
                  <span className="sr-only">{submitting ? "送信中" : "送信"}</span>
                </>
              )}
            </button>
          </form>

          {cannotAffordCurrentDepth && !isLimited ? (
            <p className="mt-2 text-[11px] text-red-400">残り回数では{depth}を実行できません。ライトに切り替えてください。</p>
          ) : null}

          {!accessToken ? (
            <p className="mt-2 text-[11px] text-starsub">
              ログイン後に鑑定を利用できます。
              <Link href="/login" className="ml-1 text-violet-glow underline underline-offset-2">
                ログイン
              </Link>
            </p>
          ) : null}

          {globalError ? <p className="mt-2 text-[11px] text-red-400">{globalError}</p> : null}
        </footer>
      </section>
    </main>
  );
}
