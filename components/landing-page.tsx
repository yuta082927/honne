"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const notoSansJp = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FEATURES = [
  {
    title: "01. 行動の科学",
    body: "心理学に基づく独自アルゴリズムで、あなたの思考の癖と不安の起点を分析します。"
  },
  {
    title: "02. 3つの次の一手",
    body: "相談後には、明日から実行できる具体的な3つの行動案を必ず提示します。"
  },
  {
    title: "03. AIの透明性",
    body: "AIであることを隠さず、感情に迎合しない正直で客観的な視点を届けます。"
  }
] as const;

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28, filter: "blur(4px)" }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </m.div>
  );
}

function NeonButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="honne-cta">
      {label}
    </Link>
  );
}

function SectionHead({ overline, title, body, centered = false }: { overline: string; title: string; body: string; centered?: boolean }) {
  return (
    <div className={centered ? "text-center" : ""}>
      <p className={`${inter.className} text-xs uppercase tracking-[0.34em] text-[#00E5FF]/85`}>{overline}</p>
      <h2 className="mt-4 text-[1.8rem] font-semibold leading-tight text-white sm:text-[2.3rem]">{title}</h2>
      <p className="mt-5 max-w-[64ch] text-sm leading-8 tracking-[0.05em] text-white/74 sm:text-base">{body}</p>
    </div>
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
    <section className="relative flex min-h-[92svh] items-center px-5 pb-16 pt-14 sm:px-8 sm:pt-16 lg:px-16">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
        <Reveal className="max-w-[640px]">
          <p className={`${inter.className} text-[11px] uppercase tracking-[0.38em] text-[#87f4ff]/80`}>HONNE / INNER VOICE AI</p>
          <h1 className="honne-hero-title mt-7 text-[clamp(2.1rem,6.8vw,4.6rem)] leading-[1.35] text-white">
            今夜は、ただ
            <br className="hidden sm:block" />
            「本音」を話せばいい。
          </h1>
          <p className="mt-7 max-w-[34ch] text-[0.95rem] leading-[2.05] tracking-[0.04em] text-white/78 sm:text-[1.03rem]">
            不安な夜に、もう一人で迷わなくていい。
            <br />
            あなたの言葉から、AIが心の奥にある本音と
            <br />
            次に踏み出す一歩を静かに導き出します。
          </p>
          <div className="mt-10">
            <NeonButton href="/chat" label="本音を話してみる" />
          </div>
        </Reveal>

        <Reveal delay={0.12} className="flex justify-center lg:justify-end">
          <div className="honne-crystal-scene" aria-hidden>
            <div className="honne-crystal-aura" />
            <div className="honne-crystal-ring honne-crystal-ring--outer" />
            <div className="honne-crystal-ring honne-crystal-ring--inner" />
            <div className="honne-crystal">
              <span className="honne-crystal-facet honne-crystal-facet--left" />
              <span className="honne-crystal-facet honne-crystal-facet--right" />
              <span className="honne-crystal-facet honne-crystal-facet--core" />
            </div>
            <span className="honne-crystal-particle honne-crystal-particle--a" />
            <span className="honne-crystal-particle honne-crystal-particle--b" />
            <span className="honne-crystal-particle honne-crystal-particle--c" />
            <span className="honne-crystal-particle honne-crystal-particle--d" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ConceptSection() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-16">
      <div className="mx-auto max-w-[1080px]">
        <Reveal>
          <SectionHead
            overline="Concept / カクテルパーティー効果 × 希少性原理"
            title="占いでも、共感だけでもない。"
            body="恋愛で不安になった時に必要なのは『相手の気持ちの推測』ではなく、あなた自身の感情整理と具体的な行動指針。honneは、世界で唯一のあなた専用 行動科学AIとして、次の一歩に集中できる状態をつくります。"
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/12 bg-white/[0.02] px-5 py-5">
            <p className={`${inter.className} text-xs uppercase tracking-[0.2em] text-[#00E5FF]/80`}>Emotion</p>
            <p className="mt-3 text-sm leading-7 text-white/76">不安の構造を言語化し、焦りを減らす。</p>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/[0.02] px-5 py-5">
            <p className={`${inter.className} text-xs uppercase tracking-[0.2em] text-[#9D00FF]/90`}>Behavior</p>
            <p className="mt-3 text-sm leading-7 text-white/76">行動の優先順位を決め、明日の迷いをなくす。</p>
          </div>
          <div
            className="rounded-2xl border border-[#00E5FF]/35 bg-[linear-gradient(130deg,rgba(157,0,255,0.2),rgba(0,229,255,0.08))] px-5 py-5"
            style={{ boxShadow: "0 0 28px rgba(0,229,255,0.2)" }}
          >
            <p className={`${inter.className} text-xs uppercase tracking-[0.2em] text-white`}>honne</p>
            <p className="mt-3 text-sm leading-7 text-white/90">今夜の感情を、明日の行動エネルギーへ変換する。</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-16">
      <div className="mx-auto max-w-[1080px]">
        <Reveal>
          <SectionHead
            overline="Features / アンカリング効果"
            title="行動に直結する設計。"
            body="抽象論では終わらせず、具体的な数値・具体的な行動へ着地させることを前提に設計されています。"
          />
        </Reveal>

        <div className="mt-11 grid gap-5 lg:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <Reveal key={feature.title} delay={idx * 0.1}>
              <article
                className="h-full rounded-2xl border border-[#9D00FF]/30 bg-[linear-gradient(160deg,rgba(157,0,255,0.14),rgba(255,255,255,0.02))] px-5 py-6"
                style={{ boxShadow: "0 0 24px rgba(157,0,255,0.22)" }}
              >
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-4 text-sm leading-8 tracking-[0.04em] text-white/76">{feature.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function UiPreviewSection() {
  return (
    <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-16">
      <div className="mx-auto max-w-[1080px]">
        <Reveal>
          <SectionHead
            overline="UI Preview / 社会的証明"
            title="不安が、タスクへ変わる対話。"
            body="対話のゴールは安心感だけではなく、具体的な行動に移せる状態。チャットはネオンの導線で思考の流れを視覚化します。"
            centered
          />
        </Reveal>

        <Reveal delay={0.12} className="mt-12 flex justify-center">
          <div className="w-full max-w-[760px] rounded-[28px] border border-[#00E5FF]/28 bg-[#070022]/70 p-4 backdrop-blur-xl sm:p-6">
            <div className="rounded-3xl border border-white/12 bg-[linear-gradient(160deg,rgba(3,0,28,0.8),rgba(157,0,255,0.12),rgba(0,229,255,0.08))] p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className={`${inter.className} text-[11px] uppercase tracking-[0.2em] text-[#00E5FF]/88`}>honne live dialog</p>
                  <p className="mt-1 text-xs tracking-[0.08em] text-white/62">行動心理学モード</p>
                </div>
                <span
                  className="rounded-full border border-[#9D00FF]/75 bg-[#9D00FF]/18 px-3 py-1 text-[10px] tracking-[0.18em] text-white"
                  style={{ boxShadow: "0 0 14px rgba(157,0,255,0.5)" }}
                >
                  ACTIVE
                </span>
              </div>

              <div className="space-y-3 py-5 text-sm leading-7">
                <div className="max-w-[84%] rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-white/78">
                  返信がないだけで、ずっと最悪の展開を考えてしまいます。
                </div>
                <div className="ml-auto max-w-[84%] rounded-2xl border border-[#00E5FF]/36 bg-[linear-gradient(140deg,rgba(0,229,255,0.15),rgba(157,0,255,0.15))] p-4 text-white/90">
                  その不安は「拒絶される損失」を過大評価している状態です。明日の行動を3つに分解します。
                </div>
              </div>

              <div className="rounded-2xl border border-[#9D00FF]/35 bg-[#04001F]/80 p-4">
                <p className={`${inter.className} text-[11px] uppercase tracking-[0.16em] text-[#00E5FF]/85`}>明日の3つの次の一手</p>
                <ol className="mt-3 space-y-2 text-sm leading-7 text-white/82">
                  <li>1. 朝に2分だけ感情メモを書く</li>
                  <li>2. 夕方まで連絡を待ち、夜に短文を1通送る</li>
                  <li>3. 返信の有無で翌日の行動プランを分岐する</li>
                </ol>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="px-5 pb-24 pt-12 sm:px-8 sm:pb-28 lg:px-16">
      <div className="mx-auto max-w-[960px]">
        <Reveal>
          <div
            className="rounded-[30px] border border-[#9D00FF]/36 bg-[linear-gradient(150deg,rgba(157,0,255,0.22),rgba(3,0,28,0.78),rgba(0,229,255,0.2))] px-6 py-14 text-center"
            style={{ boxShadow: "0 0 38px rgba(157,0,255,0.38), inset 0 0 24px rgba(0,229,255,0.18)" }}
          >
            <p className={`${inter.className} text-xs uppercase tracking-[0.32em] text-[#00E5FF]/85`}>Loss Aversion Trigger</p>
            <h2 className="mt-5 text-[1.8rem] font-semibold leading-tight text-white sm:text-[2.35rem]">今夜、その不安を確実な行動に変える。</h2>
            <p className="mx-auto mt-5 max-w-[50ch] text-sm leading-8 tracking-[0.05em] text-white/78 sm:text-base">
              明日も同じ不安を繰り返す前に、行動のヒントを受け取る。honneは、あなたの一歩を止めないためのAIです。
            </p>
            <div className="mt-10 flex justify-center">
              <NeonButton href="/chat" label="行動のヒントを受け取る" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <LazyMotion features={domAnimation} strict>
      <main className={`${inter.className} ${notoSansJp.className} relative overflow-hidden bg-[#03001C] text-white`}>
        <FlowingBackground />
        <div className="relative z-10">
          <HeroSection />
          <ConceptSection />
          <FeaturesSection />
          <UiPreviewSection />
          <FinalCtaSection />
        </div>
      </main>
    </LazyMotion>
  );
}
