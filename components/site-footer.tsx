import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        backgroundColor: "#0d0a1a",
        padding: "24px",
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
          ホンネ / AIです。だから安い。だから正直。だから24時間。
        </span>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/terms"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}
            className="transition-colors hover:text-white"
          >
            利用規約
          </Link>
          <Link
            href="/privacy"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}
            className="transition-colors hover:text-white"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/commerce"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}
            className="transition-colors hover:text-white"
          >
            特定商取引法に基づく表記
          </Link>
        </nav>
      </div>
    </footer>
  );
}
