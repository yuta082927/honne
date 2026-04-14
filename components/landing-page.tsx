"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

// ─────────────────────────────────────────────────────────
// Stars: 50個を決定論的な位置で生成（SSR hydration安全）
// ─────────────────────────────────────────────────────────
const STARS = Array.from({ length: 50 }, (_, i) => ({
  left: `${(i * 37 + 13) % 97}%`,
  top: `${(i * 53 + 7) % 95}%`,
  size: [2, 1.5, 1, 2.5, 1, 1.5][i % 6],
  delay: `${((i * 23) % 30) / 10}s`,
  duration: `${2 + ((i * 17) % 15) / 10}s`
}));

// ─────────────────────────────────────────────────────────
// FadeUp: Intersection Observer によるスクロール出現
// ─────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      } ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CTA ボタン（共通）
// ─────────────────────────────────────────────────────────
function CtaButton({ label = "✦ 今すぐ答えを出す（無料）", pulse = true }: { label?: string; pulse?: boolean }) {
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>登録不要・1分で本音を整理</p>
      <Link
        href="/chat"
        className={`cta-ring inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet to-violet-soft font-bold text-white shadow-lg transition hover:opacity-90 ${
          pulse ? "animate-pulse-btn" : ""
        }`}
        style={{ padding: "18px 40px", fontSize: "18px" }}
      >
        {label}
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Section 1: ヒーロー
// ─────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-void px-4 pb-24 pt-20 sm:px-8">
      {/* 星50個 */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full bg-star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: 0.4,
            animation: `twinkle ${s.duration} ${s.delay} ease-in-out infinite`
          }}
        />
      ))}

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        {/* 左: テキスト */}
        <div>
          {/* h1: shimmer gradient */}
          <h1 className="shimmer-text font-serif text-3xl font-bold leading-tight sm:text-5xl">
            相手の気持ちを占うより、<br className="hidden sm:block" />
            あなたの次の一手を決める。
          </h1>

          <p className="mt-5 text-lg sm:text-xl" style={{ color: "#e2e8f0" }}>
            ホンネは、恋愛の「感情整理」と「意思決定」を支えるAIです。
          </p>
          <p className="mt-2 text-base sm:text-lg text-starsub">
            相手の気持ちは断言しません。あなたがどう動くべきかを決めます。
          </p>

          <div
            className="mt-6 rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(168,139,250,0.28)"
            }}
          >
            <p className="text-sm leading-relaxed text-star">
              AIだから、感情に引っ張られずに整理できます。<br />
              AIだから、24時間いつでも相談できます。<br />
              AIだから、曖昧な優しさではなく行動を返します。
            </p>
          </div>

          <div
            className="mt-4 rounded-2xl p-5"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(168,139,250,0.3)"
            }}
          >
            <p className="text-sm font-semibold text-star">1分後に決まること</p>
            <ul className="mt-2 space-y-1 text-sm text-starsub">
              <li>・LINEするか、今日はやめるか</li>
              <li>・追うか、距離を置くか</li>
              <li>・今週やるべき一歩</li>
            </ul>
          </div>

          <div className="mt-8">
            <CtaButton label="✦ もう悩むのをやめる" />
          </div>
        </div>

        {/* 右: 会話密度を上げた意思決定カード */}
        <div className="flex items-center justify-center">
          <div
            className="w-full max-w-md rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(168,139,250,0.28)",
              boxShadow: "0 0 36px rgba(124,58,237,0.18)"
            }}
          >
            <p className="text-xs tracking-[0.14em] text-violet-glow">TONIGHT DECISION</p>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl p-3 text-sm text-starsub" style={{ background: "rgba(13,10,26,0.7)" }}>
                「既読はつくけど返信が遅い。送っていいのかな…」
              </div>
              <div className="rounded-xl p-3 text-sm text-star" style={{ background: "rgba(124,58,237,0.18)", border: "1px solid rgba(168,139,250,0.35)" }}>
                今夜は送らない。明日19:30に短文で1通だけ送る。
                <br />
                文面: 「今週どこかで10分だけ話せる？」
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-starsub">
              <div className="rounded-lg py-2" style={{ background: "rgba(255,255,255,0.04)" }}>感情整理</div>
              <div className="rounded-lg py-2" style={{ background: "rgba(255,255,255,0.04)" }}>判断</div>
              <div className="rounded-lg py-2" style={{ background: "rgba(255,255,255,0.04)" }}>行動</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 2: 問題提起
// ─────────────────────────────────────────────────────────
const PAINS = [
  "LINEを送るかどうかで1時間止まっている",
  "既読はつくのに、返事が来ない理由がわからない",
  "期待していいのか、諦めるべきか判断できない",
  "会えたのに距離が縮まらず、疲れてしまった"
];

function PainSection() {
  return (
    <section className="bg-void px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <FadeUp>
          <h2 className="font-serif text-2xl font-bold text-star sm:text-3xl">
            こんな夜、止まりませんか？
          </h2>
        </FadeUp>
        <div className="mt-8 space-y-4">
          {PAINS.map((text, i) => (
            <FadeUp key={i} delay={i * 150}>
              <div
                className="group cursor-default rounded-xl p-5 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(248,113,113,0.05)",
                  borderLeft: "2px solid #f87171"
                }}
              >
                <p className="text-base text-starsub group-hover:text-star">{text}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 3: 差別化
// ─────────────────────────────────────────────────────────
const DIFFERENCE_POINTS = [
  {
    title: "相手の気持ちは断言しない",
    desc: "「好きです」などの断定で期待を煽りません。現時点で判断できる材料だけを扱います。"
  },
  {
    title: "不安を煽らない",
    desc: "続きを読ませるための恐怖訴求はしません。必要な情報をその場で出し切ります。"
  },
  {
    title: "行動だけにフォーカス",
    desc: "共感だけで終わらせず、「今週やるべきこと」を具体的に決めます。"
  },
  {
    title: "AIだから冷静に整理できる",
    desc: "感情に流されず、同じ悩みをいつでも同じ基準で見直せます。"
  }
];

function DifferenceSection() {
  return (
    <section className="bg-void px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <FadeUp>
          <h2 className="font-serif text-2xl font-bold text-star sm:text-3xl">
            ホンネは“当てる占い”ではありません
          </h2>
          <p className="mt-2 text-sm text-starsub">曖昧な優しさではなく、判断と行動に変えるサービスです。</p>
        </FadeUp>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {DIFFERENCE_POINTS.map((item, i) => (
            <FadeUp key={item.title} delay={i * 100}>
              <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(168,139,250,0.24)" }}>
                <p className="text-sm font-semibold text-star">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-starsub">{item.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 4: ベネフィット
// ─────────────────────────────────────────────────────────
const BENEFITS = [
  "連絡するか、今日はやめるか決められる",
  "続けるか終わらせるか判断できる",
  "自分が本当に求めている関係がわかる",
  "今週の一歩が具体的に決まる"
];

function BenefitSection() {
  return (
    <section className="px-4 py-20 sm:px-8" style={{ background: "rgba(124,58,237,0.1)" }}>
      <div className="mx-auto max-w-3xl">
        <FadeUp>
          <h2 className="font-serif text-2xl font-bold text-star sm:text-3xl">この相談で得られること</h2>
        </FadeUp>
        <div className="mt-8 space-y-3">
          {BENEFITS.map((text, i) => (
            <FadeUp key={text} delay={i * 90}>
              <div className="rounded-xl px-4 py-3 text-sm text-star" style={{ background: "rgba(13,10,26,0.65)", border: "1px solid rgba(168,139,250,0.25)" }}>
                {text}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 5: 入口診断
// ─────────────────────────────────────────────────────────
type PersonalityKey = "intuitive" | "analytical" | "emotional";
const PERSONALITIES: Record<PersonalityKey, { label: string; preview: string }> = {
  intuitive: {
    label: "直感型",
    preview:
      "あなたは【直感型】。相手の小さな反応にも敏感で、期待と不安が揺れやすいタイプです。"
  },
  analytical: {
    label: "分析型",
    preview:
      "あなたは【分析型】。言葉の意図を深く読み取り、慎重に動くタイプです。考えすぎで動けなくなることがあります。"
  },
  emotional: {
    label: "感情型",
    preview:
      "あなたは【感情型】。好きになるとまっすぐ行動できるタイプです。反応がない時に自己否定へ傾きやすい面があります。"
  }
};

function getPersonalityKey(month: string, day: string): PersonalityKey {
  const sum = (parseInt(month, 10) + parseInt(day, 10)) % 3;
  return sum === 0 ? "intuitive" : sum === 1 ? "analytical" : "emotional";
}

function ZygarnikSection() {
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [result, setResult] = useState<PersonalityKey | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function handleSubmit() {
    if (!month || !day) return;
    setResult(getPersonalityKey(month, day));
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  const personality = result ? PERSONALITIES[result] : null;

  return (
    <section className="bg-void px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <FadeUp>
          <h2 className="font-serif text-2xl font-bold text-star sm:text-3xl">
            まずは、あなたの恋愛タイプを30秒で確認
          </h2>
          <p className="mt-3 text-sm text-starsub">なぜ迷うのかが分かると、判断は一気に楽になります。</p>
        </FadeUp>

        <FadeUp delay={100}>
          <div className="mt-8 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-starsub">生まれた月</span>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-star outline-none focus:ring-2 focus:ring-violet"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(168,139,250,0.3)" }}
              >
                <option value="">月</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)} style={{ background: "#1a1030" }}>
                    {i + 1}月
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-starsub">生まれた日</span>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-star outline-none focus:ring-2 focus:ring-violet"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(168,139,250,0.3)" }}
              >
                <option value="">日</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)} style={{ background: "#1a1030" }}>
                    {i + 1}日
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!month || !day}
              className="rounded-xl bg-gradient-to-r from-violet to-violet-soft px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              相性を見る
            </button>
          </div>
        </FadeUp>

        {personality && (
          <div
            ref={resultRef}
            className="mt-8 rounded-2xl p-6 transition-all duration-500"
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(168,139,250,0.5)",
              boxShadow: "0 0 30px rgba(124,58,237,0.2)"
            }}
          >
            <p className="mb-1 text-xs font-semibold tracking-widest text-violet-glow">診断結果</p>
            <p className="text-base leading-relaxed text-star">{personality.preview}</p>
            <div
              className="mt-3 h-16 rounded-lg"
              style={{ background: "linear-gradient(to bottom, transparent, #0d0a1a)" }}
            />
            <Link
              href="/chat"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-violet-glow hover:underline"
            >
              このタイプで相談を始める →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 6: 行動CTA
// ─────────────────────────────────────────────────────────
function LossCTASection() {
  return (
    <section className="px-4 py-24 sm:px-8" style={{ background: "rgba(124,58,237,0.12)" }}>
      <FadeUp>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl font-bold leading-snug text-star sm:text-3xl">
            迷い続けるより、今夜ここで決める。
          </h2>
          <p className="mt-4 text-base text-starsub">1分で本音を整理して、次の一歩を明確にしましょう。</p>
          <div className="mt-8">
            <CtaButton label="✦ 1分で本音を整理する" />
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 7: 社会的証明
// ─────────────────────────────────────────────────────────
const REVIEWS = [
  {
    name: "さき",
    age: "26歳・東京",
    text: "『送るか迷ったら送らない』と決められたのが大きかったです。勢いLINEをやめたら、逆に会話が戻りました。",
    initials: "さ",
    avatarBg: "#3C3489"
  },
  {
    name: "みく",
    age: "23歳・大阪",
    text: "復縁を追い続けるのをやめる決断ができました。つらいけど、やっと自分の生活に戻れています。",
    initials: "み",
    avatarBg: "#553C9A"
  }
];

function SocialProofSection() {
  return (
    <section className="bg-void px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <FadeUp>
          <h2 className="font-serif text-2xl font-bold text-star sm:text-3xl">行動が変わった声</h2>
        </FadeUp>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {REVIEWS.map((r, i) => (
            <FadeUp key={i} delay={i * 150}>
              <div
                className="h-full rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(168,139,250,0.2)"
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: r.avatarBg }}
                  >
                    {r.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-star">{r.name}さん</p>
                    <p className="text-xs text-starsub">{r.age}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5 text-yellow-400 text-sm">
                    {"★★★★★"}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-starsub">{r.text}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 8: 解決できる理由
// ─────────────────────────────────────────────────────────
const FORTUNE_TYPES = [
  { icon: "✦", title: "スピリチュアル層", desc: "感情の流れを短く可視化し、混乱を落ち着かせる", comingSoon: false },
  { icon: "🧠", title: "心理学層", desc: "なぜ迷うかを言語化し、思考の偏りを整える", comingSoon: false },
  { icon: "🪜", title: "コーチング層", desc: "今週やることを1つに絞り、行動へ落とす", comingSoon: false },
  { icon: "🔍", title: "恋愛タイプ分析", desc: "悩み方の癖と、彼とのズレを入口で把握できる", comingSoon: false }
];

function FortuneTypesSection() {
  return (
    <section className="bg-void px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <FadeUp>
          <h2 className="font-serif text-2xl font-bold text-star sm:text-3xl">なぜ、結論まで進めるのか</h2>
          <p className="mt-2 text-sm text-starsub">三層構造で「わかる」を「決められる」に変えます。</p>
        </FadeUp>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {FORTUNE_TYPES.map((ft, i) => (
            <FadeUp key={i} delay={i * 80}>
              <div
                className="group h-full rounded-xl p-4 transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(168,139,250,0.3)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(168,139,250,0.7)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(168,139,250,0.3)";
                }}
              >
                <span style={{ fontSize: "20px", lineHeight: 1, display: "block", marginBottom: "8px" }}>
                  {ft.icon}
                </span>
                <p className="text-sm font-bold text-star" style={{ fontSize: "14px" }}>{ft.title}</p>
                <p className="mt-1 text-starsub" style={{ fontSize: "12px" }}>{ft.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 9: 最終CTA
// ─────────────────────────────────────────────────────────
function FinalCTASection() {
  return (
    <section className="bg-void px-4 py-28 sm:px-8">
      <FadeUp>
        <div className="mx-auto max-w-xl text-center">
          <p className="shimmer-text font-serif text-2xl font-bold leading-loose sm:text-3xl">
            迷いを引き延ばさない。<br />
            今夜、答えを出す。
          </p>
          <p className="mt-4 text-sm text-starsub">AIです。だから安い。だから正直。だから24時間。</p>
          <div className="mt-10">
            <CtaButton label="✦ 今すぐ答えを出す（無料）" />
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Usage取得 & ナビ
// ─────────────────────────────────────────────────────────
export function LandingPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) { setLoadingAuth(false); return; }
    let mounted = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoadingAuth(false);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [supabase]);

  async function onLogout() {
    if (supabase) await supabase.auth.signOut();
  }

  return (
    <div className="bg-void">
      {/* ── ナビゲーション ────────────────────────────────── */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-4 sm:px-8" style={{ background: "#0d0a1a", borderBottom: "1px solid rgba(168,139,250,0.18)" }}>
        <Link href="/" className="text-sm font-bold text-star">ホンネ</Link>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          {loadingAuth ? (
            <span className="text-starsub">確認中...</span>
          ) : user ? (
            <>
              <Link href="/account" className="rounded-full px-3 py-1 text-starsub hover:text-star">マイページ</Link>
              <button type="button" onClick={onLogout} className="rounded-full border border-violet/30 px-3 py-1 text-starsub hover:text-star">ログアウト</button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-1 text-starsub hover:text-star">ログイン</Link>
              <Link href="/signup" className="rounded-full border border-violet/50 bg-violet/10 px-3 py-1 font-semibold text-violet-glow hover:bg-violet/20">無料登録</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── LPストーリー ──────────────────────────────────── */}
      <HeroSection />
      <PainSection />
      <DifferenceSection />
      <BenefitSection />
      <SocialProofSection />
      <ZygarnikSection />
      <FortuneTypesSection />
      <LossCTASection />
      <FinalCTASection />
    </div>
  );
}
