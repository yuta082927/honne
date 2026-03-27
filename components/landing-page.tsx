"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
function CtaButton({ label = "✦ 無料で鑑定をはじめる →", pulse = true }: { label?: string; pulse?: boolean }) {
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>登録不要・1分で完了</p>
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
// 希少性テキスト（点滅ドット付き）
// ─────────────────────────────────────────────────────────
function ScarcityLine({ remaining }: { remaining: number | null }) {
  const count = remaining !== null && remaining > 0 ? remaining : 3;
  return (
    <p className="mt-3 flex items-center justify-center gap-2 text-sm text-red-400">
      <span className="inline-block h-1.5 w-1.5 animate-blink-dot rounded-full bg-red-400" />
      本日の無料枠 残り{count}件
    </p>
  );
}

// ─────────────────────────────────────────────────────────
// Section 1: ヒーロー
// ─────────────────────────────────────────────────────────
function HeroSection({ remaining }: { remaining: number | null }) {
  const [sparkle, setSparkle] = useState(false);
  function handleCrystalClick() {
    setSparkle(true);
    setTimeout(() => setSparkle(false), 420);
  }

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
          {/* バッジ */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-2 text-sm font-medium text-violet-glow">
            <span className="h-2 w-2 animate-blink-dot rounded-full bg-violet-glow" />
            現在 1,247人が相談中
          </div>

          {/* h1: shimmer gradient */}
          <h1 className="shimmer-text font-serif text-3xl font-bold leading-tight sm:text-5xl">
            深夜、彼のことを考えすぎて<br className="hidden sm:block" />
            眠れない夜、ありませんか？
          </h1>

          <p className="mt-5 text-lg sm:text-xl" style={{ color: "#e2e8f0" }}>
            その不安、ひとりで抱えなくていい。
          </p>

          <div className="mt-8">
            <CtaButton />
            <ScarcityLine remaining={remaining} />
          </div>
        </div>

        {/* 右: 🔮 + orbit rings */}
        <div className="flex items-center justify-center">
          <div className="relative flex h-56 w-56 items-center justify-center">
            {/* 外側 orbit ring (4s, 逆回転) */}
            <div
              className="absolute h-56 w-56 animate-orbit rounded-full"
              style={{ border: "1px dashed rgba(168,139,250,0.25)", animationDuration: "4s", animationDirection: "reverse" }}
            />
            {/* 内側 orbit ring (2s) */}
            <div
              className="absolute h-40 w-40 animate-orbit rounded-full"
              style={{ border: "1.5px dashed rgba(168,139,250,0.45)", animationDuration: "2s" }}
            />
            {/* Orbital ✦ star 1 (3s, 時計回り, r=74px) */}
            <div className="absolute animate-orbit" style={{ width: "148px", height: "148px", animationDuration: "3s" }}>
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[11px]" style={{ color: "#c4b5fd", opacity: 0.9 }}>✦</span>
            </div>
            {/* Orbital ✦ star 2 (5s, 逆回転, r=98px) */}
            <div className="absolute animate-orbit" style={{ width: "196px", height: "196px", animationDuration: "5s", animationDirection: "reverse" }}>
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[10px]" style={{ color: "#a78bfa", opacity: 0.7 }}>✦</span>
            </div>
            {/* Orbital ✦ star 3 (7s, 時計回り, r=60px) */}
            <div className="absolute animate-orbit" style={{ width: "120px", height: "120px", animationDuration: "7s" }}>
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[9px]" style={{ color: "#c4b5fd", opacity: 0.6 }}>✦</span>
            </div>
            {/* 水晶玉 */}
            <span
              onClick={handleCrystalClick}
              className={`select-none cursor-pointer ${sparkle ? "crystal-sparkle" : "animate-float-spin"}`}
              style={{
                fontSize: "96px",
                lineHeight: 1,
                filter: "drop-shadow(0 0 30px rgba(168,139,250,0.8))"
              }}
            >
              🔮
            </span>
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
  "高額を払ったのにテンプレ回答だった",
  "本当に人間が占っているのか怪しかった",
  "結局、背中を押してもらえなかった"
];

function PainSection() {
  return (
    <section className="bg-void px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <FadeUp>
          <h2 className="font-serif text-2xl font-bold text-star sm:text-3xl">
            こんな経験、ありませんか？
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
// Section 3: ザイガルニック体験
// ─────────────────────────────────────────────────────────
type PersonalityKey = "intuitive" | "analytical" | "emotional";
const PERSONALITIES: Record<PersonalityKey, { label: string; preview: string }> = {
  intuitive: {
    label: "直感型",
    preview:
      "あなたは【直感型】。感情の波が大きく、相手の小さな変化にも敏感に気づく繊細さを持っています。彼との相性は…"
  },
  analytical: {
    label: "分析型",
    preview:
      "あなたは【分析型】。物事を深く考えてから動く慎重派。相手の言葉の裏を読みすぎてしまう傾向があります。彼との相性は…"
  },
  emotional: {
    label: "感情型",
    preview:
      "あなたは【感情型】。一度好きになると全力で愛情を注ぐ情熱家。想いの強さが時に空回りすることも。彼との相性は…"
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
            あなたと彼の相性、少しだけ見てみましょう
          </h2>
          <p className="mt-3 text-sm text-starsub">生まれた月と日だけで、あなたのタイプがわかります。</p>
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
              ...続きは無料鑑定で明らかに →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 4: 損失回避CTA
// ─────────────────────────────────────────────────────────
function LossCTASection({ remaining }: { remaining: number | null }) {
  return (
    <section className="px-4 py-24 sm:px-8" style={{ background: "rgba(124,58,237,0.12)" }}>
      <FadeUp>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-2xl font-bold leading-snug text-star sm:text-3xl">
            このまま答えが出ないまま、<br />
            今夜も眠れませんか？
          </h2>
          <p className="mt-4 text-base text-starsub">AIなら今すぐ、正直に答えます。</p>
          <div className="mt-8">
            <CtaButton />
            <ScarcityLine remaining={remaining} />
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 5: 社会的証明
// ─────────────────────────────────────────────────────────
const REVIEWS = [
  {
    name: "さき",
    age: "26歳・東京",
    text: "復縁を諦めかけていたとき、AIに相談したら自分の気持ちが整理できました。3日後に自分から連絡できて、今は前より良い関係になれています。",
    initials: "さ",
    avatarBg: "#3C3489"
  },
  {
    name: "みく",
    age: "23歳・大阪",
    text: "片思いで悩んで夜も眠れなかったけど、AIがちゃんと向き合ってくれて気持ちが整理できた。ずっとモヤモヤしてたのが、スッと前に進めた感じがした。",
    initials: "み",
    avatarBg: "#553C9A"
  }
];

const STATS = [
  { value: "4.8", label: "平均評価", unit: "" },
  { value: "300", label: "累計鑑定", unit: "件+" },
  { value: "72", label: "リピート率", unit: "%" }
];

function SocialProofSection() {
  return (
    <section className="bg-void px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <FadeUp>
          <h2 className="font-serif text-2xl font-bold text-star sm:text-3xl">リアルな声</h2>
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

        <FadeUp delay={300}>
          <div className="mt-10 grid grid-cols-3 gap-4 rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,139,250,0.2)" }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-grotesk text-3xl font-bold text-violet-glow sm:text-4xl">
                  {s.value}
                  <span className="text-xl">{s.unit}</span>
                </p>
                <p className="mt-1 text-xs text-starsub">{s.label}</p>
                <p className="text-[11px] text-starsub opacity-60">β実績</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Section 6: 対応している占術
// ─────────────────────────────────────────────────────────
const FORTUNE_TYPES = [
  { icon: "✦", title: "総合", desc: "全占術を組み合わせた総合鑑定", comingSoon: false },
  { icon: "🐯", title: "動物占い", desc: "生年月日から60種の動物で性格・相性を分析", comingSoon: false },
  { icon: "⭐", title: "西洋占星術", desc: "12星座と天体の動きで運勢・性格を読む", comingSoon: false },
  { icon: "☯", title: "東洋系（算命学・四柱推命）", desc: "生年月日時から命式を算出", comingSoon: false },
  { icon: "🃏", title: "タロット", desc: "78枚のカードで現在・未来・深層心理を読む", comingSoon: false },
  { icon: "💫", title: "相性占い", desc: "複数の占術を掛け合わせた本格相性鑑定", comingSoon: false },
  { icon: "＋", title: "近日追加予定", desc: "さらに多くの占術を順次実装中", comingSoon: true }
];

function FortuneTypesSection() {
  return (
    <section className="bg-void px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <FadeUp>
          <h2 className="font-serif text-2xl font-bold text-star sm:text-3xl">対応している占術</h2>
          <p className="mt-2 text-sm text-starsub">順次拡充予定。あなたの悩みに合った占術で鑑定します。</p>
        </FadeUp>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
          {FORTUNE_TYPES.map((ft, i) => (
            <FadeUp key={i} delay={i * 80}>
              <div
                className="group h-full rounded-xl p-4 transition-all duration-300"
                style={
                  ft.comingSoon
                    ? {
                        background: "rgba(255,255,255,0.02)",
                        border: "1px dashed rgba(168,139,250,0.3)",
                        opacity: 0.5
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(168,139,250,0.3)"
                      }
                }
                onMouseEnter={(e) => {
                  if (!ft.comingSoon) {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(168,139,250,0.7)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.borderColor = ft.comingSoon
                    ? "rgba(168,139,250,0.3)"
                    : "rgba(168,139,250,0.3)";
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
// Section 7: 最終CTA
// ─────────────────────────────────────────────────────────
function FinalCTASection() {
  return (
    <section className="bg-void px-4 py-28 sm:px-8">
      <FadeUp>
        <div className="mx-auto max-w-xl text-center">
          <p className="shimmer-text font-serif text-2xl font-bold leading-loose sm:text-3xl">
            AIです。だから安い。<br />
            だから正直。<br />
            だから24時間。
          </p>
          <div className="mt-10">
            <CtaButton />
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Usage取得 & ナビ
// ─────────────────────────────────────────────────────────
type UsageResponse = {
  remaining: number;
  unlimited?: boolean;
  plan?: "free" | "premium";
  accessLabel?: string;
};

export function LandingPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(Boolean(supabase));

  const fetchUsage = useCallback(async (token?: string | null) => {
    try {
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/usage", { cache: "no-store", headers });
      if (!res.ok) throw new Error();
      const body = (await res.json()) as UsageResponse;
      setUsage(typeof body.remaining === "number" ? body : null);
    } catch { setUsage(null); }
  }, []);

  useEffect(() => {
    if (!accessToken) { setUsage(null); return; }
    void fetchUsage(accessToken);
  }, [fetchUsage, accessToken]);

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
      setAccessToken(data.session?.access_token ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setLoadingAuth(false);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [supabase]);

  async function onLogout() {
    if (supabase) await supabase.auth.signOut();
  }

  // 残り回数（free user のみ表示、unlimited/premium は null）
  const remaining =
    usage && !usage.unlimited && usage.plan !== "premium" ? usage.remaining : null;

  return (
    <div className="bg-void">
      {/* ── ナビゲーション ────────────────────────────────── */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-4 sm:px-8" style={{ background: "#0d0a1a", borderBottom: "1px solid rgba(168,139,250,0.18)" }}>
        <Link href="/" className="text-sm font-bold text-star">AI占いくん</Link>
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

      {/* ── 6セクション ──────────────────────────────────── */}
      <HeroSection remaining={remaining} />
      <PainSection />
      <ZygarnikSection />
      <LossCTASection remaining={remaining} />
      <SocialProofSection />
      <FortuneTypesSection />
      <FinalCTASection />
    </div>
  );
}
