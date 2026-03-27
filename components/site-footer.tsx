import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-void py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <p className="text-sm text-starsub">© 2026 AI占いくん</p>
        <nav className="flex gap-6">
          <Link
            href="/legal/terms"
            className="text-sm text-starsub transition-colors hover:text-star"
          >
            利用規約
          </Link>
          <Link
            href="/legal/privacy"
            className="text-sm text-starsub transition-colors hover:text-star"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/legal/tokusho"
            className="text-sm text-starsub transition-colors hover:text-star"
          >
            特定商取引法
          </Link>
        </nav>
      </div>
    </footer>
  );
}
