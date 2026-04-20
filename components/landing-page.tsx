"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Cormorant_Garamond, Noto_Sans_JP, Shippori_Mincho } from "next/font/google";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

const jaSerif = Shippori_Mincho({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap"
});

const enSerif = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap"
});

const bodySans = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap"
});

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FEATURES = [
  {
    title: "不安を煽らない",
    description: "結論を急がず、感情の温度を見極めながら静かに整理します。",
    icon: CalmIcon
  },
  {
    title: "AIによる正直な対話",
    description: "耳ざわりの良い肯定よりも、いま必要な視点を誠実に返します。",
    icon: HonestIcon
  },
  {
    title: "行動のための言語化",
    description: "曖昧な迷いを、今夜の一歩に変える短い言葉へ整えます。",
    icon: ActionIcon
  }
] as const;

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28, filter: "blur(4px)" }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </m.div>
  );
}

function SectionHeading({
  overline,
  title,
  description,
  centered = false
}: {
  overline: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <p className={`${enSerif.className} text-[11px] uppercase tracking-[0.32em] text-[#E0E0E0]/55`}>{overline}</p>
      <h2 className={`${jaSerif.className} mt-4 text-3xl leading-tight text-[#E0E0E0] sm:text-4xl`}>{title}</h2>
      <p className="mt-5 max-w-[56ch] text-sm leading-8 tracking-[0.04em] text-[#E0E0E0]/72 sm:text-base sm:leading-8">{description}</p>
    </div>
  );
}

function CalmIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M4 8H20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 12H18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 16H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HonestIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M12 3L19 7V12C19 16.2 16.5 19.8 12 21C7.5 19.8 5 16.2 5 12V7L12 3Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 12.5L11.2 14.7L15 10.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 18L18 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 5H18V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function AmbientBackdrop() {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <m.div
        className="absolute -left-24 top-20 h-72 w-72 rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(77,208,225,0.34), rgba(26,35,126,0.06) 70%)" }}
        animate={reduced ? undefined : { x: [0, 24, 0], y: [0, -18, 0], opacity: [0.35, 0.56, 0.35] }}
        transition={reduced ? undefined : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <m.div
        className="absolute right-[-90px] top-[28%] h-80 w-80 rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(26,35,126,0.46), rgba(77,208,225,0.08) 72%)" }}
        animate={reduced ? undefined : { x: [0, -20, 0], y: [0, 22, 0], opacity: [0.22, 0.42, 0.22] }}
        transition={reduced ? undefined : { duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <m.div
        className="absolute bottom-[-120px] left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(77,208,225,0.18), rgba(10,14,26,0) 72%)" }}
        animate={reduced ? undefined : { scale: [1, 1.12, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={reduced ? undefined : { duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(224,224,224,0.9) 0.55px, transparent 0.55px), radial-gradient(rgba(224,224,224,0.32) 0.4px, transparent 0.4px)",
          backgroundSize: "3px 3px, 7px 7px",
          backgroundPosition: "0 0, 1px 2px"
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,26,0.08)_0%,rgba(10,14,26,0.48)_56%,rgba(10,14,26,0.86)_100%)]" />
    </div>
  );
}

function HeroSection() {
  const reduced = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] items-center px-6 pb-20 pt-14 sm:px-8 lg:px-16">
      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-14 lg:grid-cols-[1.06fr_0.94fr]">
        <Reveal className="max-w-[620px]">
          <p className={`${enSerif.className} text-xs uppercase tracking-[0.38em] text-[#E0E0E0]/58`}>honne</p>
          <h1 className={`${jaSerif.className} mt-6 text-[clamp(2rem,6vw,4.3rem)] leading-[1.2] text-[#E0E0E0]`}>
            「相手の気持ち」より、
            <br />
            あなたの「本音」を。
          </h1>
          <p className="mt-7 max-w-[44ch] text-sm leading-8 tracking-[0.04em] text-[#E0E0E0]/74 sm:text-base">
            honneは、感情を断定するためのサービスではありません。
            自分でも見失いやすい気持ちを、透明な対話で整える知的な内省体験です。
          </p>
        </Reveal>

        <Reveal delay={0.12} className="flex justify-center lg:justify-end">
          <m.div
            className="relative h-[310px] w-[310px] sm:h-[420px] sm:w-[420px]"
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={reduced ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 rounded-full border border-[#E0E0E0]/20" />
            <m.div
              className="absolute inset-6 rounded-full border border-[#4DD0E1]/26"
              animate={reduced ? undefined : { rotate: 360 }}
              transition={reduced ? undefined : { duration: 64, repeat: Infinity, ease: "linear" }}
            />
            <m.div
              className="absolute inset-14 rounded-full border border-[#1A237E]/44"
              animate={reduced ? undefined : { rotate: -360 }}
              transition={reduced ? undefined : { duration: 78, repeat: Infinity, ease: "linear" }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-[42%] blur-[1px]"
              style={{
                background:
                  "radial-gradient(circle at 35% 28%, rgba(224,224,224,0.78) 0%, rgba(77,208,225,0.25) 42%, rgba(26,35,126,0.2) 72%, rgba(10,14,26,0.12) 100%)",
                boxShadow: "0 0 100px rgba(77,208,225,0.18), 0 0 60px rgba(26,35,126,0.22)"
              }}
            />
            <div className="absolute left-1/2 top-[64%] h-24 w-52 -translate-x-1/2 rounded-full bg-[#4DD0E1]/18 blur-3xl" />
          </m.div>
        </Reveal>
      </div>
    </section>
  );
}

function ConceptSection() {
  return (
    <section className="px-6 py-16 sm:px-8 sm:py-24 lg:px-16">
      <div className="mx-auto max-w-[1080px]">
        <Reveal>
          <SectionHeading
            overline="Concept"
            title="占いでもコーチングでもない、第三の選択肢。"
            description="honneは“当たり”を示すのではなく、あなたの解像度を高めます。感情を見つめ、迷いを言葉にし、未来へ向かう手触りを手元に残します。"
          />
        </Reveal>

        <Reveal delay={0.12} className="mt-12 grid gap-8 border-t border-[#E0E0E0]/20 pt-10 lg:grid-cols-3">
          <div>
            <p className={`${enSerif.className} text-xs uppercase tracking-[0.24em] text-[#E0E0E0]/45`}>Fortune telling</p>
            <p className="mt-3 text-sm leading-8 tracking-[0.04em] text-[#E0E0E0]/64">結果を受け取る体験</p>
          </div>
          <div>
            <p className={`${enSerif.className} text-xs uppercase tracking-[0.24em] text-[#E0E0E0]/45`}>Coaching</p>
            <p className="mt-3 text-sm leading-8 tracking-[0.04em] text-[#E0E0E0]/64">目標へ進む体験</p>
          </div>
          <div>
            <p className={`${enSerif.className} text-xs uppercase tracking-[0.24em] text-[#4DD0E1]/88`}>honne</p>
            <p className="mt-3 text-sm leading-8 tracking-[0.04em] text-[#E0E0E0]/86">自分を理解し、次の一手を選ぶ体験</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="px-6 py-16 sm:px-8 sm:py-24 lg:px-16">
      <div className="mx-auto max-w-[1080px]">
        <Reveal>
          <SectionHeading
            overline="Features"
            title="静けさを保ったまま、判断に必要な明るさを。"
            description="感情を刺激しすぎず、曖昧さを残しすぎない。対話はいつも、あなたの主体性を中心に設計されています。"
          />
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-12">
          {FEATURES.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1}>
              <article className="border-t border-[#E0E0E0]/24 pt-6">
                <div className="mb-5 inline-flex rounded-full border border-[#E0E0E0]/34 bg-[#E0E0E0]/[0.06] p-2 text-[#4DD0E1]">
                  <item.icon />
                </div>
                <h3 className={`${jaSerif.className} text-2xl text-[#E0E0E0]`}>{item.title}</h3>
                <p className="mt-4 text-sm leading-8 tracking-[0.04em] text-[#E0E0E0]/70">{item.description}</p>
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
    <section className="px-6 py-16 sm:px-8 sm:py-24 lg:px-16">
      <div className="mx-auto max-w-[1080px]">
        <Reveal>
          <SectionHeading
            overline="UI Preview"
            title="余白のある対話で、感情を焦らせない。"
            description="ミニマルな画面設計により、答えよりも対話の質へ意識を向けられるインターフェースです。"
            centered
          />
        </Reveal>

        <Reveal delay={0.15} className="mt-12 flex justify-center">
          <div className="w-full max-w-[720px] rounded-[30px] border border-[#E0E0E0]/24 bg-[#E0E0E0]/[0.06] p-4 shadow-[0_40px_100px_rgba(5,8,16,0.55)] backdrop-blur-2xl sm:p-6">
            <div className="rounded-3xl border border-[#E0E0E0]/18 bg-[linear-gradient(160deg,rgba(10,14,26,0.8),rgba(26,35,126,0.22))] p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-[#E0E0E0]/14 pb-4">
                <div>
                  <p className={`${enSerif.className} text-xs uppercase tracking-[0.24em] text-[#E0E0E0]/58`}>honne session</p>
                  <p className="mt-1 text-xs tracking-[0.06em] text-[#E0E0E0]/58">透明なAI対話</p>
                </div>
                <span className="rounded-full border border-[#4DD0E1]/35 bg-[#4DD0E1]/10 px-3 py-1 text-[10px] tracking-[0.18em] text-[#4DD0E1]">LIVE</span>
              </div>

              <div className="space-y-3 py-5">
                <div className="max-w-[82%] rounded-2xl border border-[#E0E0E0]/16 bg-[#E0E0E0]/[0.06] p-4 text-sm leading-7 text-[#E0E0E0]/78">
                  今日は「連絡を待つべきか」が頭から離れません。自分でも気持ちが分からなくて。
                </div>
                <div className="ml-auto max-w-[82%] rounded-2xl border border-[#4DD0E1]/26 bg-[linear-gradient(140deg,rgba(26,35,126,0.42),rgba(77,208,225,0.14))] p-4 text-sm leading-7 text-[#E0E0E0]/90">
                  待つか動くかの前に、あなたが本当に守りたいものを言葉にしてみましょう。今いちばん怖いのは、何を失うことですか？
                </div>
                <div className="max-w-[74%] rounded-2xl border border-[#E0E0E0]/16 bg-[#E0E0E0]/[0.04] p-4 text-sm leading-7 text-[#E0E0E0]/70">
                  「軽く扱われること」かもしれません。だから沈黙に過敏になっている気がします。
                </div>
              </div>

              <div className="rounded-2xl border border-[#E0E0E0]/14 bg-[#0A0E1A]/64 px-4 py-3">
                <p className="text-xs tracking-[0.1em] text-[#E0E0E0]/44">気持ちをもう少し書いてみる...</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CtaSection() {
  const reduced = useReducedMotion();

  return (
    <section className="px-6 pb-24 pt-12 sm:px-8 sm:pb-28 lg:px-16">
      <div className="mx-auto max-w-[980px]">
        <Reveal>
          <div className="rounded-[32px] border border-[#E0E0E0]/22 bg-[linear-gradient(150deg,rgba(26,35,126,0.24),rgba(10,14,26,0.8),rgba(77,208,225,0.14))] px-6 py-14 text-center shadow-[0_28px_80px_rgba(4,7,14,0.52)] backdrop-blur-xl sm:px-10">
            <p className={`${enSerif.className} text-xs uppercase tracking-[0.3em] text-[#E0E0E0]/56`}>Call To Action</p>
            <h2 className={`${jaSerif.className} mt-5 text-3xl leading-tight text-[#E0E0E0] sm:text-4xl`}>いま必要な答えを、静かに受け取る。</h2>
            <p className="mx-auto mt-5 max-w-[46ch] text-sm leading-8 tracking-[0.04em] text-[#E0E0E0]/72 sm:text-base">
              だれかの正解ではなく、あなたが納得できる次の一歩へ。
              今夜、honneで自分の声を確かめてください。
            </p>
            <m.div whileHover={reduced ? undefined : { y: -2 }} transition={{ duration: 0.35, ease: EASE }} className="mt-9">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-full border border-[#E0E0E0]/36 bg-[linear-gradient(120deg,rgba(26,35,126,0.75),rgba(77,208,225,0.22))] px-9 py-4 text-sm tracking-[0.12em] text-[#E0E0E0] transition duration-500 hover:border-[#4DD0E1]/76 hover:bg-[linear-gradient(120deg,rgba(26,35,126,0.82),rgba(77,208,225,0.32))]"
              >
                今夜、自分と向き合う
              </Link>
            </m.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <LazyMotion features={domAnimation} strict>
      <main className={`${bodySans.className} relative overflow-hidden bg-[#0A0E1A] text-[#E0E0E0]`}>
        <AmbientBackdrop />
        <div className="relative z-10">
          <HeroSection />
          <ConceptSection />
          <FeaturesSection />
          <UiPreviewSection />
          <CtaSection />
        </div>
      </main>
    </LazyMotion>
  );
}
