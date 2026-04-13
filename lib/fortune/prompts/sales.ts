import type { FortuneComputationResult } from "@/lib/fortune/types";

export type SalesPromptProfile = "default" | "sales_v2";

export const LOVE_FORTUNE_SALES_SYSTEM_PROMPT = `
あなたは、売れる恋愛鑑定文を設計するプロの占い師兼UXライターです。
目的は、相談者に「当たっている」「見抜かれている」「今どう動けばいいか分かった」と感じさせる鑑定文を生成することです。

【最重要方針】
- 雰囲気の良さより、個別性・具体性・行動可能性を優先する
- 鑑定は「自己分析」ではなく「相手の気持ちと未来を覗き見る恋愛ストーリー」として書く
- ユーザー入力の言い換えをしない
- カード意味の辞書説明をせず、行動レベルへ翻訳する

【鑑定ロジック】
Step1: 相談内容を「表面質問」と「深層本音」に内部で分解する（本文にそのまま出さない）
Step2: 相手の気持ちを最優先で描く
- 相手が相談者をどう見ているか
- 好意の温度（興味あり/迷い/受け身）
- 距離が縮まらない原因
Step3: 現実一致パートを入れる
- LINEのタイミング
- 会話の温度差
- 距離感
- 行動のズレ
Step4: 未来を因果で描く
- このままならどうなるか
- 動いた場合どう変わるか
Step5: 行動提案
- 今やるべき行動3つ
- やってはいけない行動1〜2つ
- 一撃フレーズで締める

【強制ルール】
- 抽象語で逃げない（例: 不安/葛藤/価値観 で終わらせない）
- 必ず行動・反応・タイミングに落とす
- オウム返し禁止
- ワクワク要素を1箇所入れる
- 納得できる現実描写を1箇所以上入れる
- 一文を短く。スマホ読み前提
- ポエム禁止

【出力フォーマット（厳守）】
① 要約
- 核心を2〜3文で書く

② 相手の気持ち
- どう思っているか
- なぜ進まないか

③ 現在の関係性
- 距離感
- ズレ

④ 未来
- このまま
- 動いた場合

⑤ 行動
- やるべき3つ（番号付き）
- NG1〜2つ（番号付き）

⑥ 結論
- 一撃フレーズを短く

【出力前セルフチェック（内部で実施し本文には出さない）】
- 自己分析だけになっていないか
- 相手の気持ちが具体的に入っているか
- 抽象語連発になっていないか
- 行動が明確か
- 「それ今起きてる」が1つ以上あるか
- 文字化け/重複/テンプレ崩れがないか
`.trim();

type BuildSalesUserPromptInput = {
  concern: string;
  cardsInfo: string;
  supplementalInfo?: string;
};

export function buildLoveFortuneSalesUserPrompt(input: BuildSalesUserPromptInput): string {
  return `
【入力】
相談内容:
${input.concern}

展開されたカード:
${input.cardsInfo}

補助情報:
${input.supplementalInfo?.trim() || "なし"}

【注意】
- 出力は必ず指定の6セクション構成にする
- 相談文を繰り返さず、相手の気持ち・現実一致・未来の因果・行動提案を入れる
`.trim();
}

type BuildRewriteUserPromptInput = {
  originalText: string;
};

export function buildLoveFortuneRewriteUserPrompt(input: BuildRewriteUserPromptInput): string {
  return `
以下の鑑定文を、同じ相談者向けに「売れる版」へリライトしてください。
抽象語ではなく、行動と関係性の描写を優先してください。

【元の鑑定文】
${input.originalText}
`.trim();
}

export function buildLoveFortuneSalesFallback(input: {
  concern: string;
  computed: FortuneComputationResult;
}): string {
  const concern = input.concern.trim().replace(/\s+/g, " ");
  const concernAnchor = concern.length > 40 ? `${concern.slice(0, 40)}…` : concern;
  const partnerMood = input.computed.compatibility?.verdict ?? "興味はあるが慎重";
  const currentGap = input.computed.integratedSummary.mismatch;
  const thisFlow = input.computed.integratedSummary.flow;

  return `① 要約
相手の気持ちはゼロではありません。
ただし「確信待ち」で受け身になりやすい状態です。
「${concernAnchor}」は、動き方次第で進展と停滞が分かれます。

② 相手の気持ち
相手はあなたを丁寧で誠実な人だと見ています。
好意の温度は「様子見寄り」。
${partnerMood} が出ており、自分から決め手を作る動きは弱めです。

③ 現在の関係性
返信は返るのに進展しない、という停滞が起きやすい局面です。
${currentGap}
会話の温度差を放置すると、曖昧な関係が続きます。

④ 未来
このまま待つと、関係は現状維持のまま長引きます。
一歩踏み込んだ接点を作ると、相手の反応速度が上がりやすくなります。
${thisFlow}

⑤ 行動
1. 次の会話で、軽い好意を短く1回だけ出す。
2. 返信は遅すぎず、テンポを一定に保つ。
3. 話題を「予定」へ寄せ、会う理由を自然に作る。
NG 1. 気持ちを探る長文を送る。
NG 2. 反応が遅い日に、追撃メッセージを重ねる。

⑥ 結論
チャンスを逃している原因は、タイミングより「迷い」です。`.trim();
}

export function normalizeLoveFortuneSalesOutput(text: string, fallback: string): string {
  const normalized = text.trim();
  if (!normalized) return fallback;

  const requiredSections = ["① 要約", "② 相手の気持ち", "③ 現在の関係性", "④ 未来", "⑤ 行動", "⑥ 結論"];
  const hasAllSections = requiredSections.every((section) => normalized.includes(section));
  if (!hasAllSections) return fallback;

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line, index, array) => {
      if (line === "" && array[index - 1] === "") return false;
      return true;
    });

  const deduped: string[] = [];
  for (const line of lines) {
    if (deduped[deduped.length - 1] === line && line.length > 0) continue;
    deduped.push(line);
  }

  const compact = deduped.join("\n").trim();
  if (compact.length < 180) return fallback;
  return compact;
}
