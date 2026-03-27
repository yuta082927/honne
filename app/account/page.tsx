"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type ProfileResponse = {
  profile: {
    id: string;
    displayName: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export default function AccountPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError("Supabaseのブラウザ環境変数が未設定です。");
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      const client = supabase;
      if (!client) return;

      setLoading(true);
      setError(null);

      const { data: sessionData } = await client.auth.getSession();
      if (!active) return;

      const session = sessionData.session;
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);

      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/me/profile", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        cache: "no-store"
      });

      const body = (await res.json().catch(() => null)) as ProfileResponse | { error?: string } | null;

      if (!res.ok) {
        setError((body as { error?: string } | null)?.error ?? "プロフィール取得に失敗しました。");
        setLoading(false);
        return;
      }

      setDisplayName(body && "profile" in body ? body.profile.displayName ?? "" : "");
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!accessToken) {
      setError("ログインが必要です。");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ displayName: displayName.trim() || null })
      });

      const body = (await res.json().catch(() => null)) as ProfileResponse | { error?: string } | null;

      if (!res.ok) {
        setError((body as { error?: string } | null)?.error ?? "プロフィール更新に失敗しました。");
        return;
      }

      setMessage("プロフィールを更新しました。");
      if (body && "profile" in body) {
        setDisplayName(body.profile.displayName ?? "");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-sm text-ink/70">読み込み中...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-ink">アカウント</h1>
          <p className="mt-2 text-sm text-ink/70">ログインするとプロフィール編集と履歴保存が使えます。</p>
          <div className="mt-4 flex gap-2">
            <Link href="/login" className="rounded-xl bg-wine px-4 py-2 text-sm font-semibold text-white">
              ログイン
            </Link>
            <Link href="/signup" className="rounded-xl border border-wine px-4 py-2 text-sm font-semibold text-wine">
              新規登録
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">Account</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">アカウント設定</h1>
        <p className="mt-1 text-xs text-ink/60">{user.email}</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-ink/70">表示名</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={40}
              className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-wine px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </form>

        {message ? <p className="mt-3 rounded-lg bg-rose px-3 py-2 text-xs text-wine">{message}</p> : null}
        {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p> : null}

        <Link href="/history" className="mt-4 inline-block text-sm text-wine underline underline-offset-2">
          鑑定履歴を見る
        </Link>
      </section>
    </main>
  );
}
