import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description: "ホンネの特定商取引法に基づく表記ページです。料金や支払い方法、提供条件などを記載しています。"
};

const rows: { label: string; value: string | string[] }[] = [
  { label: "販売業者", value: "山口祐汰" },
  { label: "所在地", value: "東京都（詳細住所はお問い合わせにより開示します）" },
  { label: "連絡先", value: "sankou3150@gmail.com" },
  { label: "お問い合わせ受付時間", value: "24時間（返信は2営業日以内）" },
  {
    label: "販売価格",
    value: [
      "単発鑑定：500円〜980円（税込）",
      "月額サブスクリプション：1,980円（税込）",
      "※ 詳細は料金ページをご確認ください",
    ],
  },
  { label: "代金の支払時期", value: "サービス利用前にお支払いいただきます" },
  { label: "代金の支払方法", value: "クレジットカード決済" },
  { label: "サービスの提供時期", value: "決済完了後、即時提供" },
  {
    label: "返品・返金について",
    value:
      "デジタルコンテンツの性質上、原則として返金には応じておりません。ただしサービスに重大な不具合がある場合はこの限りではありません。ご不満がある場合はお問い合わせください。",
  },
  { label: "動作環境", value: "インターネット接続環境・最新のWebブラウザ" },
];

export default function TokushoPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-star">特定商取引法に基づく表記</h1>
      <p className="mb-10 text-sm text-starsub">消費者保護のため、以下のとおり表記します。</p>

      <div className="divide-y divide-white/10 rounded-xl border border-white/10">
        {rows.map(({ label, value }) => (
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
    </main>
  );
}
