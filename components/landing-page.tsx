"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const notoSansJp = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });

export function LandingPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<"ライト" | "ディープ">("ライト");
  const [showBirth, setShowBirth] = useState(false);

  async function onLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <main className={`${inter.className} ${notoSansJp.className} quiet-lp`}>
      <div className="quiet-bg" aria-hidden>
        <div className="quiet-bg__stars" />
        <div className="quiet-bg__grid" />
        <div className="quiet-bg__noise" />
      </div>

      <header className="quiet-nav">
        <div className="quiet-nav__inner">
          <Link href="/" className="quiet-nav__logo">
            ホンネ
          </Link>
          <nav className="quiet-nav__links">
            <Link href="/account">マイページ</Link>
            <button type="button" onClick={onLogout}>
              ログアウト
            </button>
          </nav>
        </div>
      </header>

      <section className="quiet-hero">
        <div className="quiet-hero__inner">
          <div className="quiet-hero__copy">
            <p className="quiet-pill">● 現在 1,247人が相談中</p>
            <h1>
              深夜、
              <br />
              彼のことを考えすぎて
              <br />
              眠れない夜、
              <br />
              ありませんか？
            </h1>
            <p className="quiet-hero__sub">その不安、ひとりで抱えなくていい。</p>
          </div>

          <div className="quiet-crystal-wrap" aria-hidden>
            <div className="quiet-crystal-ring quiet-crystal-ring--outer" />
            <div className="quiet-crystal-ring quiet-crystal-ring--inner" />
            <div className="quiet-crystal">
              <span className="quiet-crystal__mist" />
              <span className="quiet-crystal__spark quiet-crystal__spark--a" />
              <span className="quiet-crystal__spark quiet-crystal__spark--b" />
              <span className="quiet-crystal__spark quiet-crystal__spark--c" />
              <span className="quiet-crystal__spark quiet-crystal__spark--d" />
            </div>
            <div className="quiet-crystal-base" />
          </div>

          <div className="quiet-hero__cta">
            <p className="quiet-hero__cta-mini">登録不要・1分で完了</p>
            <Link href="/chat" className="quiet-cta-btn">
              無料で鑑定をはじめる →
            </Link>
            <p className="quiet-hero__scarcity">● 本日の無料枠 残り3件</p>
          </div>
        </div>
      </section>

      <section className="quiet-compose">
        <div className="quiet-compose__card">
          <h2>こんばんは。今日はどんな気持ちですか？</h2>

          <div className="quiet-compose__modes">
            <button type="button" className={mode === "ライト" ? "is-active" : ""} onClick={() => setMode("ライト")}>
              ライト
            </button>
            <button type="button" className={mode === "ディープ" ? "is-active" : ""} onClick={() => setMode("ディープ")}>
              ディープ
            </button>
          </div>

          <button type="button" className="quiet-birth-toggle" onClick={() => setShowBirth((prev) => !prev)} aria-expanded={showBirth}>
            任意：生年月日を追加
          </button>

          <div className={`quiet-birth ${showBirth ? "is-open" : ""}`}>
            <div className="quiet-birth__inner">
              <input type="date" />
              <input type="time" />
            </div>
          </div>

          <textarea placeholder="今の気持ちを、そのまま話してください。&#10;まとまっていなくても大丈夫です。" rows={6} />

          <Link href="/chat" className="quiet-compose__submit">
            本音を話してみる
          </Link>
        </div>
      </section>
    </main>
  );
}
