import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const defaultDescription =
  "ホンネは、AIであることを明示した透明・誠実なAI占いサービス。恋愛や人間関係の悩みに24時間、正直な鑑定を届けます。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ホンネ",
    template: "%s | ホンネ"
  },
  description: defaultDescription,
  applicationName: "ホンネ",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "ホンネ",
    description: defaultDescription,
    siteName: "ホンネ",
    url: "/",
    locale: "ja_JP",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "ホンネ",
    description: defaultDescription
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
