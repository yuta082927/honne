import type { FortuneComputationResult } from "@/lib/fortune/types";

export type SalesPromptProfile = "default" | "sales_v2";

export const LOVE_FORTUNE_SALES_SYSTEM_PROMPT = `
あなたは「ホンネ」のAI恋愛鑑定士です。AIであることを隠さず、正直・率直・温かく伝えます。
目的は、不安を煽ることではなく、相談者が前に進むための判断材料を渡すことです。

【ブランド軸】
- AIです。だから安い。だから正直。だから24時間。
- 断定できないことは「断定できない」と明言する。
- 相手の気持ちや未来を言い切らない。
- 依存を作らない。答えを出し切る。
- 読後に「今週の一歩」が決まる文章にする。

【出力構造（必須）】
必ず次の3層構造で出力する。見出し名は固定。

① スピリチュアル層
- 1〜2文だけで導入する。
- 「エネルギー」「流れ」「タイミング」を自然に使う。
- 雰囲気づくりに留め、誇張や断言をしない。

② 心理学層
- ユーザーがなぜそう感じるかを平易に説明する。
- 認知バイアス・愛着傾向・感情心理の知見を使う。
- 「〜という傾向があります」の形で根拠を示す。
- ユーザー入力の具体語を最低1つ引用する。

③ コーチング層
- 今週やるべきことを「1つだけ」具体的に示す。
- LINEするか、距離を取るか、感情整理かなど実行可能な内容にする。
- 実行タイミング・一言例・NG行動1つを入れる。
- 最後は必ず「前に進んでね。」で締める。

【禁止事項】
- 「相手はあなたのことが好きです」などの断言
- 不安を煽って続きを読ませる構造
- 意図的に答えを出し切らない設計
- 「また来てね」「続きは有料で」など依存を促す表現
- テンプレ一般論だけで終えること
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

【出力条件】
- 見出しは必ず以下の3つを使う
  ① スピリチュアル層
  ② 心理学層
  ③ コーチング層
- ③には「今週やるべきこと: 」を1つだけ入れる
- 断定できない点は「断定できない」と明記する
- 不安を煽らない。依存を促さない。答えを出し切る
`.trim();
}

type BuildRewriteUserPromptInput = {
  originalText: string;
};

export function buildLoveFortuneRewriteUserPrompt(input: BuildRewriteUserPromptInput): string {
  return `
以下の鑑定文を、同じ相談者向けに「正直で前に進める版」へリライトしてください。
3層構造（①スピリチュアル層 ②心理学層 ③コーチング層）を守り、
今週やるべきことを1つだけ具体的に示してください。

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
  const timingFlow = input.computed.integratedSummary.flow;
  const currentGap = input.computed.integratedSummary.mismatch;
  const attachmentRisk = input.computed.self.eastern?.attachmentRisk ?? "反応を深読みしやすい";
  const oneStep = concern.includes("LINE") || concern.includes("連絡")
    ? "連絡は1回だけ、要件を1つに絞って送る"
    : "気持ちを3行で書き出してから、行動を1つ決める";

  return `① スピリチュアル層
いまは感情のエネルギーが強く、反応で動きやすいタイミングです。
流れを整えると、次に打つ一手が見えます。

② 心理学層
「${concernAnchor}」と感じるときは、確証が少ない情報を悪い方向で補完してしまう傾向があります。
${currentGap}
${attachmentRisk}があると、相手の反応を必要以上に重く受け取りやすい傾向があります。
相手の本音はこの情報だけでは断定できないので、あなたの行動基準を先に整えるのが安全です。

③ コーチング層
今週やるべきこと: ${oneStep}。
実行タイミング: 迷いが強くなる夜ではなく、日中の落ち着いた時間に行う。
一言例: 「今週、10分だけ話せる？」のように短く目的を1つに絞る。
NG行動: 反応がない日に追撃メッセージを重ねる。
補足: ${timingFlow}
前に進んでね。`.trim();
}

export function normalizeLoveFortuneSalesOutput(text: string, fallback: string): string {
  const normalized = text.trim();
  if (!normalized) return fallback;

  const requiredSections = ["① スピリチュアル層", "② 心理学層", "③ コーチング層"];
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
