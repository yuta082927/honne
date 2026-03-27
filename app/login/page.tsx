"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/password-field";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabaseのブラウザ環境変数が未設定です。");
      return;
    }

    setSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push("/chat");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">Login</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">ログイン</h1>
        <p className="mt-2 text-sm text-ink/70">ログインすると鑑定履歴を保存して見返せます。</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-ink/70">メールアドレス</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-rose-200 px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </label>

          <PasswordField label="パスワード" value={password} onChange={setPassword} minLength={6} disabled={submitting} />

          <button
            type="submit"
            disabled={submitting || !supabase}
            className="w-full rounded-xl bg-wine px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "処理中..." : "ログインする"}
          </button>
        </form>

        {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p> : null}

        <div className="mt-4 text-xs text-ink/70">
          <p>
            アカウントをお持ちでない方は
            <Link href="/signup" className="ml-1 text-wine underline underline-offset-2">
              新規登録
            </Link>
          </p>
          <Link href="/chat" className="mt-2 inline-block text-wine underline underline-offset-2">
            チャットに戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
