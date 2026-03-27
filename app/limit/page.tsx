import Link from "next/link";
import { PremiumCta } from "@/components/premium-cta";
import { RegisterCta } from "@/components/register-cta";

export default function LimitPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">Free Limit</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">無料回数を使い切りました</h1>
        <p className="mt-3 text-sm leading-relaxed text-subink">
          本日の無料鑑定はここまでです。無料登録すると履歴を保存でき、次回の再開がスムーズになります。
        </p>
      </section>

      <div className="mt-5">
        <RegisterCta />
      </div>

      <div className="mt-5">
        <PremiumCta />
      </div>

      <Link
        href="/"
        className="mt-5 block rounded-xl bg-gradient-to-r from-ctaStart to-accent px-4 py-3 text-center text-sm font-semibold text-white"
      >
        トップへ戻る
      </Link>
    </main>
  );
}
