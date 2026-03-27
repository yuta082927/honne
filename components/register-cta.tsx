import Link from "next/link";

export function RegisterCta({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`rounded-2xl border border-line bg-gradient-to-br from-cream to-rose ${compact ? "p-3" : "p-4"}`}>
      <h2 className="text-sm font-bold text-ink">無料登録で鑑定履歴を保存</h2>
      <p className="mt-1 text-xs leading-relaxed text-subink">
        あなた専用の鑑定記録を残して、前回の続きをいつでも見返せます。
      </p>
      <div className="mt-3 flex gap-2">
        <Link href="/signup" className="rounded-lg bg-gradient-to-r from-ctaStart to-accent px-3 py-2 text-xs font-semibold text-white">
          無料登録
        </Link>
        <Link href="/login" className="rounded-lg border border-accent px-3 py-2 text-xs font-semibold text-accent">
          ログイン
        </Link>
      </div>
    </aside>
  );
}
