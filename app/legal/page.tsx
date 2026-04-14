import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "法務情報",
  description: "ホンネの利用規約、プライバシーポリシー、特定商取引法に基づく表記への一覧ページです。"
};

export default function LegalIndexPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-star">法務情報</h1>
      <p className="mt-2 text-sm text-starsub">安心して利用いただくために、重要事項をまとめています。</p>
      <div className="mt-6 grid gap-3">
        <Link href="/terms" className="rounded-xl border border-white/10 px-4 py-3 text-sm text-violet-glow hover:bg-white/5">
          利用規約
        </Link>
        <Link href="/privacy" className="rounded-xl border border-white/10 px-4 py-3 text-sm text-violet-glow hover:bg-white/5">
          プライバシーポリシー
        </Link>
        <Link href="/commerce" className="rounded-xl border border-white/10 px-4 py-3 text-sm text-violet-glow hover:bg-white/5">
          特定商取引法に基づく表記
        </Link>
      </div>
    </main>
  );
}
