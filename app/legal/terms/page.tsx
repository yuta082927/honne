import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
  description: "ホンネの利用規約ページです。AIであることを開示した透明・誠実な占いサービスの利用条件を記載しています。"
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-star">利用規約</h1>
      <p className="mb-10 text-sm text-starsub">最終更新日：2026年3月27日</p>

      <p className="mb-10 leading-relaxed text-starsub">
        この利用規約（以下「本規約」）は、山口祐汰（以下「運営者」）が提供するホンネ（以下「本サービス」）の利用条件を定めるものです。
      </p>

      <Section title="第1条（適用）">
        本規約は、本サービスの利用に関する運営者とユーザーの間の一切の関係に適用されます。
      </Section>

      <Section title="第2条（サービスの内容）">
        本サービスは、AIを活用した占い鑑定サービスです。鑑定結果はAIが生成したものであり、運営者はその的中率・正確性を保証しません。本サービスはエンターテインメント目的で提供されます。
      </Section>

      <Section title="第3条（禁止事項）">
        <p className="mb-3 leading-relaxed text-starsub">ユーザーは以下の行為を行ってはなりません。</p>
        <ul className="space-y-1 text-starsub">
          {[
            "法令または公序良俗に違反する行為",
            "他のユーザーまたは第三者への迷惑行為",
            "本サービスの運営を妨害する行為",
            "未成年者による保護者の同意のない有料サービスの利用",
            "本サービスの情報を無断で転載・複製する行為",
          ].map((item) => (
            <li key={item} className="flex gap-2 leading-relaxed">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-glow" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="第4条（料金・決済）">
        有料サービスの料金は別途定める料金表に従います。支払い後のキャンセル・返金は原則対応しておりません。ただし、サービスに重大な瑕疵がある場合はこの限りではありません。
      </Section>

      <Section title="第5条（免責事項）">
        運営者は、本サービスの利用によりユーザーに生じた損害について、運営者の故意または重過失による場合を除き、責任を負いません。鑑定結果に基づくユーザーの判断・行動については、ユーザー自身が責任を負うものとします。
      </Section>

      <Section title="第6条（サービスの変更・終了）">
        運営者は、事前通知なく本サービスの内容を変更・終了することがあります。
      </Section>

      <Section title="第7条（規約の変更）">
        運営者は本規約を変更することがあります。変更後の規約はサービス上に掲示した時点から効力を生じます。
      </Section>

      <Section title="第8条（準拠法・管轄）">
        本規約の解釈には日本法が適用されます。本サービスに関する紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
      </Section>

      <div className="mt-12 border-t border-white/10 pt-8 text-sm text-starsub space-y-1">
        <p>運営者：山口祐汰</p>
        <p>所在地：東京都</p>
        <p>連絡先：sankou3150@gmail.com</p>
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
