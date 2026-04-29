"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const notoSansJp = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const EMPATHY_POINTS = [
  "返信がないだけで、不安になる",
  "将来のことを考えると眠れない",
  "誰かに話したいけど、話せない",
  "本当の気持ちが、自分でも分からない"
] as const;

const CONCEPT_POINTS = [
  {
    title: "本音を知る",
    body: "言葉にならない気持ちを、静かにほどきながら輪郭をつくります。"
  },
  {
    title: "心を整える",
    body: "不安や焦りを整理して、呼吸を整えるように気持ちを落ち着かせます。"
  },
  {
    title: "次の一歩が見える",
    body: "今夜のあなたに無理のない、小さくても確かな一歩を見つけます。"
  }
] as const;

const FEELING_OPTIONS = [
  "不安や心配がある",
  "恋愛や好きな人のこと",
  "将来のことが気になる",
  "人間関係で悩んでいる",
  "モヤモヤしている"
] as const;

const MINI_CARDS = [
  {
    title: "月の灯",
    symbol: "☽",
    message: "希望は、静かに育っている。今はすぐに答えが出なくても大丈夫。あなたの中の本音を、少しずつ言葉にしてみましょう。"
  },
  {
    title: "星の鍵",
    symbol: "✦",
    message: "閉じていた気持ちに、小さな鍵が見つかる夜。焦らずに、いま一番守りたいものから選び直してみてください。"
  },
  {
    title: "夜の鏡",
    symbol: "✧",
    message: "答えは外側よりも、あなたの内側にあります。正解探しをやめると、本音はやさしく浮かび上がります。"
  },
  {
    title: "灯火の糸",
    symbol: "❋",
    message: "今夜の迷いは、未来へつながる糸の途中。小さな安心をひとつ選ぶことで、心はちゃんと前へ進めます。"
  },
  {
    title: "静かな羅針盤",
    symbol: "✺",
    message: "急がなくていい。迷いの中でも方向は失っていません。あなたの本音は、もう次の道を知っています。"
  }
] as const;

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24, filter: "blur(4px)" }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </m.div>
  );
}

function CtaButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="honne-cta">
      {label}
    </Link>
  );
}

function FlowingBackground() {
  return (
    <div className="lp-night-bg pointer-events-none absolute inset-0 overflow-hidden">
      <div className="lp-night-bg__stars" />
      <div className="lp-night-bg__grid" />
      <div className="lp-night-bg__mist" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative px-4 pb-14 pt-12 sm:px-8 sm:pt-16 lg:px-16">
      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
        <Reveal className="order-1">
          <p className="honne-logo text-[1.55rem] text-[#f8f3ff]">honne</p>
          <h1 className="honne-hero-title mt-5 text-[clamp(2rem,6.8vw,4.2rem)] leading-[1.34] text-[#f8f3ff]">
            迷いの夜に、心を整える。
          </h1>
          <p className="mt-6 max-w-[34ch] text-[0.98rem] leading-[2] tracking-[0.02em] text-[#cfc3e8] sm:text-[1.04rem]">
            うまく言葉にできなくても大丈夫。
            <br />
            あなたの本音を、AIが静かにひもとき、
            <br />
            次の一歩を一緒に見つけます。
          </p>
        </Reveal>

        <Reveal delay={0.12} className="order-2 flex justify-center lg:justify-end">
          <div className="honne-crystal-scene" aria-hidden>
            <div className="honne-scene-moon" />
            <div className="honne-scene-library" />
            <div className="honne-scene-candle honne-scene-candle--left" />
            <div className="honne-scene-candle honne-scene-candle--right" />
            <div className="honne-crystal-aura" />
            <div className="honne-crystal-ring honne-crystal-ring--outer" />
            <div className="honne-crystal-ring honne-crystal-ring--inner" />
            <div className="honne-crystal">
              <span className="honne-crystal-facet honne-crystal-facet--left" />
              <span className="honne-crystal-facet honne-crystal-facet--right" />
              <span className="honne-crystal-facet honne-crystal-facet--core" />
              <span className="honne-crystal-face">
                <i />
                <i />
                <b />
              </span>
            </div>
            <div className="honne-crystal-stand" />
            <span className="honne-crystal-particle honne-crystal-particle--a" />
            <span className="honne-crystal-particle honne-crystal-particle--b" />
            <span className="honne-crystal-particle honne-crystal-particle--c" />
            <span className="honne-crystal-particle honne-crystal-particle--d" />
          </div>
        </Reveal>

        <Reveal delay={0.18} className="order-3 lg:order-1">
          <CtaButton href="/chat" label="本音を話してみる" />
          <p className="mt-3 text-xs tracking-[0.04em] text-[#cfc3e8]">匿名OK・誰にも見られません</p>
        </Reveal>
      </div>
    </section>
  );
}

function EmpathySection() {
  return (
    <section className="px-4 py-14 sm:px-8 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-[1120px]">
        <Reveal>
          <h2 className="honne-section-title text-[1.75rem] leading-tight text-[#f8f3ff] sm:text-[2.15rem]">こんな夜、ありませんか。</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {EMPATHY_POINTS.map((text, idx) => (
            <Reveal key={text} delay={idx * 0.08}>
              <article className="honne-glass-card p-5">
                <p className="text-sm leading-8 text-[#f8f3ff]/90 sm:text-base">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConceptSection() {
  return (
    <section className="px-4 py-14 sm:px-8 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-[1120px]">
        <Reveal>
          <h2 className="honne-section-title text-[1.75rem] leading-tight text-[#f8f3ff] sm:text-[2.1rem]">honneは、あなたの本音に寄り添う場所です</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {CONCEPT_POINTS.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 0.1}>
              <article className="honne-glass-card p-5">
                <h3 className="text-lg font-semibold text-[#f8f3ff]">{item.title}</h3>
                <p className="mt-3 text-sm leading-8 text-[#cfc3e8]">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniReadingSection() {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [cardIndex, setCardIndex] = useState<number | null>(null);

  const currentCard = useMemo(() => {
    if (cardIndex === null) return null;
    return MINI_CARDS[cardIndex];
  }, [cardIndex]);

  function onSelectFeeling(feeling: string) {
    setSelectedFeeling(feeling);
    setRevealed(false);
    setCardIndex(null);
  }

  function drawCard() {
    const index = Math.floor(Math.random() * MINI_CARDS.length);
    setCardIndex(index);
    setRevealed(true);
  }

  return (
    <section className="px-4 py-14 sm:px-8 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-[1120px]">
        <Reveal>
          <h2 className="honne-section-title text-[1.75rem] leading-tight text-[#f8f3ff] sm:text-[2.1rem]">1分でできる、本音カード診断</h2>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="honne-glass-card p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#d79dff]/90">Step 1</p>
            <p className="mt-2 text-base text-[#f8f3ff]">今、あなたに一番近い気持ちは？</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {FEELING_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectFeeling(option)}
                  className={`honne-feeling-option ${selectedFeeling === option ? "honne-feeling-option--active" : ""}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="mt-5">
          <div className="honne-glass-card p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#d79dff]/90">Step 2</p>
            <p className="mt-2 text-base text-[#f8f3ff]">カードを1枚引く</p>
            <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={drawCard}
                disabled={!selectedFeeling}
                className="honne-draw-button disabled:cursor-not-allowed disabled:opacity-45"
              >
                カードを引く
              </button>
              {selectedFeeling ? <p className="text-sm text-[#cfc3e8]">選択中: {selectedFeeling}</p> : <p className="text-sm text-[#cfc3e8]/80">まず気持ちを選択してください</p>}
            </div>
            <div className="mt-5">
              <div className={`honne-mini-card ${revealed ? "honne-mini-card--revealed" : ""}`}>
                <div className="honne-mini-card__inner">
                  <div className="honne-mini-card__face honne-mini-card__face--back">
                    <span className="honne-mini-card__glyph">☾</span>
                  </div>
                  <div className="honne-mini-card__face honne-mini-card__face--front">
                    <span className="honne-mini-card__glyph">{currentCard?.symbol ?? "✧"}</span>
                    <span className="honne-mini-card__name">{currentCard?.title ?? "夜のカード"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {revealed && currentCard ? (
          <Reveal delay={0.16} className="mt-5">
            <div className="honne-glass-card p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d79dff]/90">Step 3</p>
              <p className="mt-2 text-base leading-8 text-[#f8f3ff]">{currentCard.message}</p>
              <div className="mt-6">
                <CtaButton href="/chat" label="もっと深く、本音を読む" />
              </div>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

function DeepCtaSection() {
  return (
    <section className="px-4 py-14 sm:px-8 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-[980px]">
        <Reveal>
          <div className="honne-cta-panel px-6 py-12 text-center sm:px-10">
            <h2 className="honne-section-title text-[1.7rem] leading-tight text-[#f8f3ff] sm:text-[2.2rem]">あなたの本音を、もっと深くひもときます。</h2>
            <p className="mx-auto mt-5 max-w-[44ch] text-sm leading-8 text-[#cfc3e8] sm:text-base">
              気持ちの整理、恋愛の悩み、将来の不安、人間関係のモヤモヤ。
              <br />
              どんなことでも、安心して話してください。
            </p>
            <div className="mt-8 flex justify-center">
              <CtaButton href="/chat" label="本音を話してみる" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TrustSection() {
  const items = ["匿名OK", "24時間相談", "AIが心理を整理", "プライバシー保護"] as const;
  return (
    <section className="px-4 pb-24 pt-10 sm:px-8 sm:pb-28 lg:px-16">
      <div className="mx-auto max-w-[1120px]">
        <Reveal>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item} className="honne-trust-chip">
                {item}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <LazyMotion features={domAnimation} strict>
      <main className={`${inter.className} ${notoSansJp.className} relative overflow-hidden bg-[#050312] text-white`}>
        <FlowingBackground />
        <div className="relative z-10">
          <HeroSection />
          <EmpathySection />
          <ConceptSection />
          <MiniReadingSection />
          <DeepCtaSection />
          <TrustSection />
        </div>
      </main>
    </LazyMotion>
  );
}
