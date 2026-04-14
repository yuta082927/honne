"use client";

import Link from "next/link";
import { useState } from "react";
import { PREMIUM_CTA_TEXT } from "@/lib/constants";
import { LegalNotice } from "@/components/legal-notice";

export function PremiumCta() {
  const [agreed, setAgreed] = useState(false);

  return (
    <aside className="rounded-2xl border border-line bg-gradient-to-br from-cream to-rose p-4">
      <h2 className="text-base font-bold text-ink">{PREMIUM_CTA_TEXT.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-subink">{PREMIUM_CTA_TEXT.description}</p>

      <div className="mt-3 rounded-xl border border-accent/30 bg-white/70 p-3 text-xs text-ink/80">
        <p className="font-semibold text-ink">申込前にご確認ください</p>
        <ul className="mt-2 space-y-1">
          <li>・単発ディープ相談: 980円（税込）</li>
          <li>・提供内容: ディープ相談1回（履歴保存なし）</li>
          <li>・返金: デジタル提供開始後は原則不可（法令等の例外を除く）</li>
        </ul>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {agreed ? (
          <Link
            href="/checkout/one-time"
            className="rounded-lg bg-gradient-to-r from-ctaStart to-accent px-3 py-2 text-center text-sm font-semibold text-white"
          >
            単発980円で申し込む
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg bg-gray-300 px-3 py-2 text-center text-sm font-semibold text-white">
            単発980円で申し込む
          </span>
        )}
        {agreed ? (
          <Link
            href="/checkout/monthly"
            className="rounded-lg border border-accent px-3 py-2 text-center text-sm font-semibold text-accent"
          >
            月額1980円を検討する
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-accent/40 px-3 py-2 text-center text-sm font-semibold text-accent/50">
            月額1980円を検討する
          </span>
        )}
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs text-subink">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border border-accent/40"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
        />
        <span>
          <Link href="/terms" className="text-accent underline underline-offset-2">利用規約</Link>・
          <Link href="/privacy" className="text-accent underline underline-offset-2">プライバシーポリシー</Link>・
          <Link href="/commerce" className="text-accent underline underline-offset-2">特定商取引法に基づく表記</Link>
          に同意のうえ申し込みます。
        </span>
      </label>

      <div className="mt-3">
        <LegalNotice compact showPaymentNotes />
      </div>
    </aside>
  );
}
