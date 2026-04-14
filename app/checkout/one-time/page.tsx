import type { Metadata } from "next";
import Link from "next/link";
import { LegalNotice } from "@/components/legal-notice";

export const metadata: Metadata = {
  title: "単発ディープ申込確認",
  description: "ホンネの単発ディープ相談（980円）の申込前確認ページです。価格、提供内容、注意事項をご確認ください。"
};

export default function OneTimeCheckoutPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">One-Time Checkout</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">単発ディープ相談 申込確認</h1>
        <p className="mt-3 text-sm text-subink">申込前に、価格・提供内容・注意事項をご確認ください。</p>

        <div className="mt-4 rounded-xl bg-rose px-4 py-3 text-sm text-ink">
          <p>価格: 980円（税込）</p>
          <p className="mt-1">提供内容: ディープ相談1回（AI生成）</p>
          <p className="mt-1">履歴保存: なし</p>
          <p className="mt-1">返金: 提供開始後は原則不可（法令等の例外を除く）</p>
        </div>

        <div className="mt-4">
          <LegalNotice showPaymentNotes showLinks />
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-amber-400/60 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          決済実装は準備中です。公開前に決済事業者連携と法務レビューを完了してください。
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link href="/chat" className="rounded-lg border border-ink/20 px-3 py-2 text-center text-sm font-semibold text-ink">
            チャットに戻る
          </Link>
          <button type="button" disabled className="cursor-not-allowed rounded-lg bg-gray-300 px-3 py-2 text-sm font-semibold text-white">
            980円で申し込む（準備中）
          </button>
        </div>
      </section>
    </main>
  );
}
