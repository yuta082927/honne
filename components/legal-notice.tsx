import Link from "next/link";
import { AI_NOTICE_ITEMS, PAYMENT_NOTICE_ITEMS } from "@/lib/legal-content";

type LegalNoticeProps = {
  compact?: boolean;
  showPaymentNotes?: boolean;
  showLinks?: boolean;
  className?: string;
};

export function LegalNotice({
  compact = false,
  showPaymentNotes = false,
  showLinks = false,
  className = ""
}: LegalNoticeProps) {
  const titleClass = compact ? "text-[11px]" : "text-xs";
  const bodyClass = compact ? "text-[11px]" : "text-xs";
  const list = showPaymentNotes ? [...AI_NOTICE_ITEMS, ...PAYMENT_NOTICE_ITEMS] : AI_NOTICE_ITEMS;

  return (
    <aside
      className={`rounded-xl border border-white/15 bg-white/[0.03] px-3 py-3 ${className}`}
      aria-label="注意事項"
    >
      <p className={`${titleClass} font-semibold text-violet-glow`}>ご利用前の注意事項</p>
      <ul className={`mt-2 space-y-1.5 ${bodyClass} text-starsub`}>
        {list.map((item) => (
          <li key={item} className="flex gap-2 leading-relaxed">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-glow" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {showLinks ? (
        <p className={`${bodyClass} mt-3 text-starsub`}>
          詳細は
          <Link href="/terms" className="mx-1 underline underline-offset-2 text-violet-glow">
            利用規約
          </Link>
          ・
          <Link href="/privacy" className="mx-1 underline underline-offset-2 text-violet-glow">
            プライバシーポリシー
          </Link>
          ・
          <Link href="/commerce" className="ml-1 underline underline-offset-2 text-violet-glow">
            特定商取引法に基づく表記
          </Link>
          をご確認ください。
        </p>
      ) : null}
    </aside>
  );
}
