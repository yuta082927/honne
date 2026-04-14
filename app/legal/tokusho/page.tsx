import type { Metadata } from "next";
import { COMMERCE_ROWS, LEGAL_LAST_UPDATED, LEGAL_REVIEW_NOTE } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description: "ホンネの特定商取引法に基づく表記です。販売事業者情報、価格、支払方法、提供時期、返品・返金等を記載しています。"
};

export default function TokushoPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-star">特定商取引法に基づく表記</h1>
      <p className="mb-2 text-sm text-starsub">消費者保護のため、以下のとおり表記します。</p>
      <p className="mb-10 text-sm text-starsub">最終更新日：{LEGAL_LAST_UPDATED}</p>

      <div className="divide-y divide-white/10 rounded-xl border border-white/10">
        {COMMERCE_ROWS.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
            <dt className="w-full shrink-0 text-sm font-medium text-violet-glow sm:w-44">
              {label}
            </dt>
            <dd className="text-sm leading-relaxed text-starsub">
              {Array.isArray(value) ? (
                <ul className="space-y-1">
                  {value.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[11px] text-starsub opacity-80">{LEGAL_REVIEW_NOTE}</p>
    </main>
  );
}
