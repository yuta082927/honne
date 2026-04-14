import type { Metadata } from "next";
import Link from "next/link";
import { LegalNotice } from "@/components/legal-notice";

export const metadata: Metadata = {
  title: "月額プラン申込確認",
  description: "ホンネの月額プラン（1,980円）の申込前確認ページです。提供価値、注意事項、法務導線を確認できます。"
};

export default function MonthlyCheckoutPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">Monthly Checkout</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">月額プラン 申込確認</h1>
        <p className="mt-3 text-sm text-subink">将来実装を見据えた確認画面です。提供内容の差分を明確に記載します。</p>

        <div className="mt-4 rounded-xl bg-rose px-4 py-3 text-sm text-ink">
          <p>価格: 1,980円（税込）/ 月</p>
          <p className="mt-1">提供内容: ディープ相談、履歴保存、比較分析</p>
          <p className="mt-1">継続価値: 回数ではなく「蓄積」と「比較」</p>
          <p className="mt-1">返金: 個別規約・法令・決済事業者規約に従います</p>
        </div>

        <div className="mt-4">
          <LegalNotice showPaymentNotes showLinks />
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-amber-400/60 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          月額決済導線は準備中です。公開前に請求タイミング、解約、日割りの規約整備が必要です。
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link href="/chat" className="rounded-lg border border-ink/20 px-3 py-2 text-center text-sm font-semibold text-ink">
            チャットに戻る
          </Link>
          <button type="button" disabled className="cursor-not-allowed rounded-lg bg-gray-300 px-3 py-2 text-sm font-semibold text-white">
            月額を開始する（準備中）
          </button>
        </div>
      </section>
    </main>
  );
}
