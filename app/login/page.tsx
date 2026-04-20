"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LazyMotion, m, useReducedMotion } from "framer-motion";
import { PasswordField } from "@/components/password-field";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type OAuthProvider = "google" | "apple";

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

export default function LoginPage() {
  const reduced = useReducedMotion();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState<OAuthProvider | null>(null);
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

  async function onOAuthLogin(provider: OAuthProvider) {
    setError(null);

    if (!supabase) {
      setError("Supabaseのブラウザ環境変数が未設定です。");
      return;
    }

    setOauthSubmitting(provider);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/chat`
        }
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } finally {
      setOauthSubmitting(null);
    }
  }

  return (
    <LazyMotion features={loadFeatures} strict>
      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-14 sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <m.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(99,102,241,0.16),transparent_42%),radial-gradient(circle_at_80%_72%,rgba(56,189,248,0.08),transparent_45%),linear-gradient(180deg,#0d0a1a_0%,#120d24_50%,#0d0a1a_100%)]"
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
              深層への再接続
            </p>
            <h1 className="mt-5 font-serif text-3xl leading-tight text-star sm:text-4xl">
              いまの感情の続きを、
              <br />
              ここから受け取る。
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-starsub sm:text-base">
              honneは、答えを押しつける場所ではありません。
              あなたの本音がゆっくり輪郭を持つための、静かな対話空間です。
            </p>

            <div className="mt-8 space-y-3 text-sm text-starsub">
              <p className="rounded-xl border border-violet/20 bg-void/45 px-4 py-3">恋愛、人間関係、仕事の迷いを深層から読み解く</p>
              <p className="rounded-xl border border-violet/20 bg-void/45 px-4 py-3">占術と心理と対話を重ねて、あなたの言葉へ整える</p>
              <p className="rounded-xl border border-violet/20 bg-void/45 px-4 py-3">履歴を保存し、気づきの変化をあとで見返せる</p>
            </div>
          </m.section>

          <m.section
            className="rounded-3xl border border-violet/30 bg-[radial-gradient(circle_at_30%_0%,rgba(99,102,241,0.15),rgba(13,10,26,0.72)_45%)] p-6 shadow-[0_24px_60px_rgba(13,10,26,0.55)] backdrop-blur-xl sm:p-8"
            initial={reduced ? false : { opacity: 0, y: 30, filter: "blur(2px)" }}
            animate={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.95, delay: 0.08, ease: EASE }}
          >
            <p className="text-xs tracking-[0.16em] text-violet-glow">ログイン</p>
            <h2 className="mt-2 font-serif text-2xl text-star">体験を再開する</h2>
            <p className="mt-2 text-sm text-starsub">保存された鑑定履歴と、前回の続きにアクセスできます。</p>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => onOAuthLogin("google")}
                disabled={!supabase || submitting || oauthSubmitting !== null}
                className="w-full rounded-xl border border-violet/35 bg-void/55 px-4 py-3 text-sm font-semibold text-star transition hover:border-violet-glow/60 hover:bg-violet/12 disabled:opacity-60"
              >
                {oauthSubmitting === "google" ? "Googleへ移動中..." : "Googleで続ける"}
              </button>
              <button
                type="button"
                onClick={() => onOAuthLogin("apple")}
                disabled={!supabase || submitting || oauthSubmitting !== null}
                className="w-full rounded-xl border border-violet/35 bg-void/55 px-4 py-3 text-sm font-semibold text-star transition hover:border-violet-glow/60 hover:bg-violet/12 disabled:opacity-60"
              >
                {oauthSubmitting === "apple" ? "Appleへ移動中..." : "Appleで続ける"}
              </button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-violet/25" />
              <p className="text-xs text-starsub/90">またはメールアドレスでログイン</p>
              <div className="h-px flex-1 bg-violet/25" />
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
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

              <PasswordField
                label="パスワード"
                value={password}
                onChange={setPassword}
                minLength={6}
                disabled={submitting || oauthSubmitting !== null}
              />

              <button
                type="submit"
                disabled={submitting || oauthSubmitting !== null || !supabase}
                className="w-full rounded-xl border border-violet/45 bg-[radial-gradient(circle_at_20%_0%,rgba(196,181,253,0.3),rgba(79,70,229,0.7))] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,58,237,0.35)] transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? "処理中..." : "ログインして深層をひらく"}
              </button>
            </form>

            {error ? <p className="mt-3 rounded-lg border border-rose-300/30 bg-rose-500/20 px-3 py-2 text-xs text-rose-100">{error}</p> : null}

            <div className="mt-5 text-xs text-starsub">
              <p>
                アカウントをお持ちでない方は
                <Link href="/signup" className="ml-1 text-violet-glow underline underline-offset-2">
                  無料登録
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
