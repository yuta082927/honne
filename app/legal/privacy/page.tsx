import type { Metadata } from "next";
import { LEGAL_LAST_UPDATED, LEGAL_REVIEW_NOTE, PRIVACY_SECTIONS } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "ホンネのプライバシーポリシーです。取得情報、利用目的、外部サービス、第三者提供、安全管理、開示請求等を記載しています。"
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-star">プライバシーポリシー</h1>
      <p className="mb-10 text-sm text-starsub">最終更新日：{LEGAL_LAST_UPDATED}</p>

      <p className="mb-10 leading-relaxed text-starsub">
        ホンネ（以下「本サービス」）は、ユーザーの相談内容がセンシティブな情報を含み得ることを踏まえ、個人情報の取扱いに慎重に対応します。
      </p>

      {PRIVACY_SECTIONS.map((section) => (
        <Section key={section.title} title={section.title}>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="mb-3 leading-relaxed text-starsub">
              {paragraph}
            </p>
          ))}
          {section.bullets ? (
            <ul className="space-y-1 text-starsub">
              {section.bullets.map((item) => (
                <li key={item} className="flex gap-2 leading-relaxed">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-glow" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </Section>
      ))}

      <p className="mt-12 border-t border-white/10 pt-8 text-[11px] text-starsub opacity-80">
        {LEGAL_REVIEW_NOTE}
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-base font-semibold text-violet-glow">{title}</h2>
      {typeof children === "string" ? (
        <p className="leading-relaxed text-starsub">{children}</p>
      ) : (
        children
      )}
    </section>
  );
}
