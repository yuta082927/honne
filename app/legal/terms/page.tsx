import type { Metadata } from "next";
import { LEGAL_CONTACT, LEGAL_LAST_UPDATED, LEGAL_REVIEW_NOTE, TERMS_SECTIONS } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "利用規約",
  description: "ホンネの利用規約です。AI生成サービスとしての利用条件、免責、禁止事項、料金・支払条件を記載しています。"
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-star">利用規約</h1>
      <p className="mb-10 text-sm text-starsub">最終更新日：{LEGAL_LAST_UPDATED}</p>

      <p className="mb-10 leading-relaxed text-starsub">
        この利用規約（以下「本規約」）は、{LEGAL_CONTACT.businessName}（以下「運営者」）が提供するホンネ（以下「本サービス」）の利用条件を定めるものです。
      </p>

      {TERMS_SECTIONS.map((section) => (
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

      <div className="mt-12 border-t border-white/10 pt-8 text-sm text-starsub space-y-1">
        <p>事業者名：{LEGAL_CONTACT.businessName}</p>
        <p>運営責任者：{LEGAL_CONTACT.operator}</p>
        <p>所在地：{LEGAL_CONTACT.address}</p>
        <p>電話番号：{LEGAL_CONTACT.phone}</p>
        <p>問い合わせ先：{LEGAL_CONTACT.email}</p>
        <p className="pt-2 text-[11px] opacity-80">{LEGAL_REVIEW_NOTE}</p>
      </div>
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
