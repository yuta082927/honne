import Link from "next/link";
import { PREMIUM_CTA_TEXT } from "@/lib/constants";

export function PremiumCta() {
  return (
    <aside className="rounded-2xl border border-line bg-gradient-to-br from-cream to-rose p-4">
      <h2 className="text-base font-bold text-ink">{PREMIUM_CTA_TEXT.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-subink">{PREMIUM_CTA_TEXT.description}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link
          href="#"
          className="rounded-lg bg-gradient-to-r from-ctaStart to-accent px-3 py-2 text-center text-sm font-semibold text-white"
        >
          {PREMIUM_CTA_TEXT.primaryLabel}
        </Link>
        <Link
          href="#"
          className="rounded-lg border border-accent px-3 py-2 text-center text-sm font-semibold text-accent"
        >
          {PREMIUM_CTA_TEXT.secondaryLabel}
        </Link>
      </div>
      <p className="mt-2 text-xs text-subink">現在は仮導線です。後でStripeやLINE連携に差し替えできます。</p>
    </aside>
  );
}
