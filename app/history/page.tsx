"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { PremiumCta } from "@/components/premium-cta";
import { RegisterCta } from "@/components/register-cta";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type HistoryItem = {
  id: string;
  mode: string;
  depth: string;
  concern: string;
  response: string;
  createdAt: string;
};

export default function HistoryPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const client = supabase;

      if (!client) {
        setError("Supabaseのブラウザ環境変数が未設定です。");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: sessionData } = await client.auth.getSession();
      if (!active) return;

      const session = sessionData.session;
      setUser(session?.user ?? null);

      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/me/fortunes", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        cache: "no-store"
      });

      const body = (await res.json().catch(() => null)) as { logs?: HistoryItem[]; error?: string } | null;

      if (!res.ok) {
        setError(body?.error ?? "履歴の取得に失敗しました。");
        setLoading(false);
        return;
      }

      setLogs(body?.logs ?? []);
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [supabase]);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-sm text-ink/70">読み込み中...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-ink">鑑定履歴</h1>
          <p className="mt-2 text-sm text-ink/70">無料登録すると鑑定履歴を保存して見返せます。</p>
          <div className="mt-4">
            <RegisterCta />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">History</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">鑑定履歴</h1>
        <p className="mt-1 text-xs text-ink/60">{user.email}</p>

        {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {logs.length === 0 ? (
          <p className="mt-4 rounded-lg bg-rose px-3 py-3 text-sm text-ink/80">まだ履歴がありません。チャットで鑑定するとここに保存されます。</p>
        ) : (
          <div className="mt-4 space-y-3">
            {logs.map((log) => (
              <article key={log.id} className="rounded-xl border border-rose-100 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-wine">
                    {log.mode} / {log.depth}
                  </p>
                  <p className="text-[11px] text-ink/50">{new Date(log.createdAt).toLocaleString("ja-JP")}</p>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-ink/70">相談: {log.concern}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink">{log.response}</p>
                <Link href={`/result/${log.id}`} className="mt-3 inline-block text-xs text-wine underline underline-offset-2">
                  詳細を見る
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="mt-5">
        <PremiumCta />
      </div>
    </main>
  );
}
