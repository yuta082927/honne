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
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
          ホンネ
        </span>
        <nav className="flex gap-6">
          <Link
            href="/legal/terms"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}
            className="transition-colors hover:text-white"
          >
            利用規約
          </Link>
          <Link
            href="/legal/privacy"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}
            className="transition-colors hover:text-white"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/legal/tokusho"
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
