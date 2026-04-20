"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { LazyMotion, m, useReducedMotion } from "framer-motion";
import { PasswordField } from "@/components/password-field";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const AMBIENT = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 31 + 7) % 98}%`,
  top: `${(i * 43 + 11) % 95}%`,
  size: [1, 1.5, 2, 1.2][i % 4],
  delay: `${((i * 17) % 24) / 10}s`,
  duration: `${4 + ((i * 9) % 20) / 10}s`,
  opacity: [0.2, 0.28, 0.34][i % 3]
}));

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const loadFeatures = () => import("@/lib/motion-features").then((module) => module.default);

export default function SignupPage() {
  const reduced = useReducedMotion();
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
    <LazyMotion features={loadFeatures} strict>
      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <m.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(99,102,241,0.16),transparent_42%),radial-gradient(circle_at_82%_70%,rgba(56,189,248,0.08),transparent_45%),linear-gradient(180deg,#0d0a1a_0%,#120d24_50%,#0d0a1a_100%)]"
            animate={reduced ? undefined : { opacity: [0.88, 1, 0.9] }}
            transition={reduced ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          {AMBIENT.map((star, i) => (
            <m.span
              key={i}
              className="absolute rounded-full bg-star"
              style={{ left: star.left, top: star.top, width: star.size, height: star.size }}
              animate={reduced ? undefined : { opacity: [star.opacity * 0.7, star.opacity, star.opacity * 0.7] }}
              transition={
                reduced
                  ? undefined
                  : {
                      duration: Number(star.duration.replace("s", "")),
                      delay: Number(star.delay.replace("s", "")),
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
              }
            />
          ))}
          <div className="absolute left-1/2 top-44 h-64 w-64 -translate-x-1/2 rounded-full bg-violet/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <m.section
            className="rounded-3xl border border-violet/25 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8"
            initial={reduced ? false : { opacity: 0, y: 24, filter: "blur(2px)" }}
            animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <p className="inline-flex rounded-full border border-violet/35 bg-violet/10 px-3 py-1 text-[11px] tracking-[0.16em] text-violet-glow">
              本音の記録をはじめる
            </p>
            <h1 className="mt-5 font-serif text-3xl leading-tight text-star sm:text-4xl">
              あなただけの深層体験を、
              <br />
              ここから育てる。
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-starsub sm:text-base">
              honneは、単発の占いではなく、
              気づきを積み重ねるための対話空間です。
              登録すると、言葉の変化を履歴として残せます。
            </p>

            <div className="mt-8 space-y-3 text-sm text-starsub">
              <p className="rounded-xl border border-violet/20 bg-void/45 px-4 py-3">恋愛・人間関係・仕事の迷いを、深層から言語化</p>
              <p className="rounded-xl border border-violet/20 bg-void/45 px-4 py-3">占術と心理の視点を重ね、あなた専用の示唆を提示</p>
              <p className="rounded-xl border border-violet/20 bg-void/45 px-4 py-3">記録を見返しながら、自分の変化を追える</p>
            </div>
          </m.section>

          <m.section
            className="rounded-3xl border border-violet/30 bg-[radial-gradient(circle_at_30%_0%,rgba(99,102,241,0.15),rgba(13,10,26,0.72)_45%)] p-6 shadow-[0_24px_60px_rgba(13,10,26,0.55)] backdrop-blur-xl sm:p-8"
            initial={reduced ? false : { opacity: 0, y: 30, filter: "blur(2px)" }}
            animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.95, delay: 0.08, ease: EASE }}
          >
            <p className="text-xs tracking-[0.16em] text-violet-glow">無料登録</p>
            <h2 className="mt-2 font-serif text-2xl text-star">深層への入口をつくる</h2>
            <p className="mt-2 text-sm text-starsub">まずは無料で始めて、あなたに合うか確かめられます。</p>

            <form onSubmit={onSubmit} className="mt-5 space-y-3">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-starsub">メールアドレス</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-xl border border-violet/35 bg-void/60 px-3 py-2 text-sm text-star outline-none placeholder:text-starsub/70 focus:border-violet-glow focus:ring-1 focus:ring-violet-glow/35"
                />
              </label>

              <PasswordField label="パスワード" value={password} onChange={setPassword} minLength={6} disabled={submitting} />

              <button
                type="submit"
                disabled={submitting || !supabase}
                className="w-full rounded-xl border border-violet/45 bg-[radial-gradient(circle_at_20%_0%,rgba(196,181,253,0.3),rgba(79,70,229,0.7))] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? "処理中..." : "無料で入口をつくる"}
              </button>
            </form>

            {message ? <p className="mt-3 rounded-lg border border-violet/30 bg-violet/20 px-3 py-2 text-xs text-violet-glow">{message}</p> : null}
            {error ? <p className="mt-3 rounded-lg border border-rose-300/30 bg-rose-500/20 px-3 py-2 text-xs text-rose-100">{error}</p> : null}

            <div className="mt-5 text-xs text-starsub">
              <p>
                すでに登録済みの方は
                <Link href="/login" className="ml-1 text-violet-glow underline underline-offset-2">
                  ログイン
                </Link>
              </p>
              <Link href="/chat" className="mt-2 inline-block text-violet-glow underline underline-offset-2">
                チャットに戻る
              </Link>
            </div>
          </m.section>
        </div>
      </main>
    </LazyMotion>
  );
}
