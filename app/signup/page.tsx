"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { PasswordField } from "@/components/password-field";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SignupPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!supabase) {
      setError("Supabaseのブラウザ環境変数が未設定です。");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }

    setSubmitting(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setMessage("登録リクエストを受け付けました。確認メールをご確認ください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">Signup</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">無料登録</h1>
        <p className="mt-2 text-sm text-ink/70">鑑定履歴を保存して、あなた専用の記録として残せます。</p>

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
            {submitting ? "処理中..." : "無料登録する"}
          </button>
        </form>

        {message ? <p className="mt-3 rounded-lg bg-rose px-3 py-2 text-xs text-wine">{message}</p> : null}
        {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p> : null}

        <div className="mt-4 text-xs text-ink/70">
          <p>
            すでに登録済みの方は
            <Link href="/login" className="ml-1 text-wine underline underline-offset-2">
              ログイン
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
