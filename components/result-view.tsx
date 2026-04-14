"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { FortuneResponseCard } from "@/components/fortune-response-card";
import { LegalNotice } from "@/components/legal-notice";
import { PremiumCta } from "@/components/premium-cta";
import { RegisterCta } from "@/components/register-cta";
import { DEPTH_COST, type ResponseDepth } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type FortuneDetail = {
  id: string;
  mode: string;
  depth: string;
  concern: string;
  response: string;
  createdAt: string;
  usedCount: number;
  freeLimit: number;
  remaining: number;
  unlimited?: boolean;
  role?: "guest" | "user" | "admin";
  plan?: "free" | "premium";
  accessLabel?: string;
  deepCost?: number;
  selfBirthday?: string | null;
  partnerBirthday?: string | null;
  computedSummary?: {
    selfAnimal: string | null;
    selfZodiac: string | null;
    compatibilityScore: number | null;
  } | null;
  error?: string;
};

function normalizeDepth(value: string): ResponseDepth {
  return value === "ディープ" ? "ディープ" : "ライト";
}

function buildUsageLine(data: FortuneDetail): string {
  if (data.unlimited) {
    return data.accessLabel ?? "無制限利用中";
  }

  if (data.plan === "premium") {
    return `プレミアム利用中（残り ${data.remaining}）`;
  }

  return `無料回数: ${data.usedCount}/${data.freeLimit}（残り ${data.remaining}）`;
}

export function ResultView({ fortuneId }: { fortuneId: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [data, setData] = useState<FortuneDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    void supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!active) return;
      setAuthUser(sessionData.session?.user ?? null);
      setAccessToken(sessionData.session?.access_token ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const loadResult = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!accessToken) {
        setError("ログインが必要です。");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/fortune/${fortuneId}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const body = (await res.json().catch(() => null)) as FortuneDetail | null;

      if (!res.ok) {
        setError(body?.error ?? "鑑定結果の読み込みに失敗しました。");
        return;
      }

      if (!body?.id || !body.response) {
        setError("鑑定結果の形式が不正です。");
        return;
      }

      setData(body);
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }, [fortuneId, accessToken]);

  useEffect(() => {
    void loadResult();
  }, [loadResult]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">Result</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">鑑定結果</h1>

        {loading ? <p className="mt-4 text-sm text-ink/70">結果を読み込み中...</p> : null}

        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {data ? (
          <>
            <div className="mt-4 rounded-xl bg-rose px-3 py-2 text-sm text-ink">
              <p>
                占術モード: <span className="font-semibold">{data.mode}</span>
              </p>
              <p className="mt-1 text-xs text-ink/70">回答深さ: {data.depth}</p>
              <p className="mt-1 text-xs text-ink/70">{buildUsageLine(data)}</p>
              {data.computedSummary ? (
                <p className="mt-1 text-xs text-ink/70">
                  鑑定根拠: 動物 {data.computedSummary.selfAnimal ?? "-"} / 星座 {data.computedSummary.selfZodiac ?? "-"} /
                  相性 {data.computedSummary.compatibilityScore ?? "-"}
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <FortuneResponseCard
                text={data.response}
                depth={normalizeDepth(data.depth)}
                onSelectDeep={() => {
                  window.location.href = "/chat";
                }}
                canSelectDeep={data.unlimited || data.remaining >= (data.deepCost ?? DEPTH_COST["ディープ"])}
              />
            </div>

            <div className="mt-4">
              <LegalNotice showLinks />
            </div>

            {!authUser ? (
              <div className="mt-4">
                <RegisterCta compact />
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-rose px-3 py-2 text-xs text-wine">
                鑑定履歴は
                <Link href="/history" className="ml-1 underline underline-offset-2">
                  履歴ページ
                </Link>
                でいつでも確認できます。
              </p>
            )}

            {!data.unlimited && data.remaining <= 1 ? (
              <p className="mt-4 rounded-lg bg-rose px-3 py-2 text-sm text-wine">
                無料回数が残りわずかです。継続利用向けのプレミアム案内もご確認ください。
              </p>
            ) : null}
          </>
        ) : null}
      </section>

      <div className="mt-5">
        <PremiumCta />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Link href="/chat" className="rounded-xl bg-wine px-4 py-3 text-center text-sm font-semibold text-white">
          チャットに戻る
        </Link>
        <Link href="/limit" className="rounded-xl border border-wine px-4 py-3 text-center text-sm font-semibold text-wine">
          プレミアム案内へ
        </Link>
      </div>
    </main>
  );
}
