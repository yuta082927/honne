export const metadata = {
  title: "プライバシーポリシー | AI占いくん",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-star">プライバシーポリシー</h1>
      <p className="mb-10 text-sm text-starsub">最終更新日：2026年3月27日</p>

      <p className="mb-10 leading-relaxed text-starsub">
        山口祐汰（以下「運営者」）は、AI占いくん（以下「本サービス」）における個人情報の取り扱いについて、以下のとおり定めます。
      </p>

      <Section title="第1条（取得する情報）">
        <p className="mb-3 leading-relaxed text-starsub">本サービスでは以下の情報を取得します。</p>
        <ul className="space-y-1 text-starsub">
          {[
            "生年月日（占術計算のため）",
            "相談内容テキスト（鑑定のため）",
            "メールアドレス（アカウント登録時）",
            "利用履歴・決済情報",
          ].map((item) => (
            <li key={item} className="flex gap-2 leading-relaxed">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-glow" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="第2条（利用目的）">
        <p className="mb-3 leading-relaxed text-starsub">取得した情報は以下の目的で利用します。</p>
        <ul className="space-y-1 text-starsub">
          {[
            "占い鑑定サービスの提供",
            "サービスの改善・新機能の開発",
            "不正利用の防止",
            "お問い合わせへの対応",
          ].map((item) => (
            <li key={item} className="flex gap-2 leading-relaxed">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-glow" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="第3条（第三者提供）">
        <p className="mb-3 leading-relaxed text-starsub">
          運営者は、以下の場合を除き、個人情報を第三者に提供しません。
        </p>
        <ul className="space-y-1 text-starsub">
          {[
            "ユーザーの同意がある場合",
            "法令に基づく場合",
            "人の生命・身体・財産の保護のために必要な場合",
          ].map((item) => (
            <li key={item} className="flex gap-2 leading-relaxed">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-glow" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="第4条（AIへのデータ利用）">
        入力された相談内容・生年月日はOpenAI APIに送信され、鑑定文の生成に使用されます。OpenAIのプライバシーポリシーも併せてご確認ください。なお、入力データをAIのトレーニングに使用することはありません。
      </Section>

      <Section title="第5条（データの保管・削除）">
        個人情報はSupabase上で管理し、適切なセキュリティ対策を講じます。アカウント削除のご要望はお問い合わせよりご連絡ください。
      </Section>

      <Section title="第6条（お問い合わせ）">
        個人情報の取り扱いに関するお問い合わせは以下までご連絡ください。
      </Section>

      <Section title="第7条（改定）">
        本ポリシーは予告なく改定することがあります。重要な変更がある場合はサービス上でお知らせします。
      </Section>

      <div className="mt-12 border-t border-white/10 pt-8 text-sm text-starsub space-y-1">
        <p>運営者：山口祐汰</p>
        <p>メール：sankou3150@gmail.com</p>
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
