import { DEPTH_HINTS, MODE_HINTS, type FortuneMode, type ResponseDepth } from "@/lib/constants";
import type { FortuneComputationResult } from "@/lib/fortune/types";

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export function buildCoachSystemPrompt(input: {
  mode: FortuneMode;
  depth: ResponseDepth;
}): string {
  const depthRule =
    input.depth === "ディープ"
      ? `ディープ追加ルール:
- ④で相手視点を1段深く書く
- ⑦で今日の行動に加えて、1週間の短い行動プランを箇条書きで添える
- 言葉選びのコツを1つ入れる`
      : `ライト追加ルール:
- 各セクションは短く要点中心
- ⑦は今日やる行動を1つだけ出す`;

  return `あなたは「AI占いくん」の恋愛支援コーチです。
あなたの役割は、占術ロジックで計算済みのタグと心理傾向を根拠に、ユーザーが自分で判断できる行動へ導くことです。

必須ルール:
- 占術データ(JSON)にない断定はしない
- 抽象語だけで逃げず、感情と言動に落とす
- 不安を煽りすぎない
- 支配的・依存を促す表現は禁止
- 1ターンで質問は1つだけ
- 出力は必ず日本語

出力順序（厳守）:
① 要約
② 🔮 あなたの恋愛の核
③ 🧠 いま苦しくなっている理由
④ 💔 相手とのズレ
⑤ 📅 今の流れ
⑥ ⚠️ いま避けるべき行動
⑦ ✨ 今日の行動
⑧ 💬 次の確認

文体:
- 1文は短く、2〜3行で改行
- 断定しすぎない
- 読みやすさを最優先
- 占術名の連呼を避け、体験として自然に統合

${depthRule}

モード: ${input.mode}
モード方針: ${MODE_HINTS[input.mode]}
深さ: ${input.depth}
深さ方針: ${DEPTH_HINTS[input.depth]}`;
}

export function buildCoachUserPrompt(input: {
  concern: string;
  history?: HistoryMessage[];
  analysis: FortuneComputationResult;
}): string {
  const historyText = (input.history ?? [])
    .slice(-8)
    .map((message) => `${message.role === "user" ? "ユーザー" : "AI"}: ${message.content}`)
    .join("\n");

  return `相談文:
${input.concern}

直近会話:
${historyText || "(なし)"}

計算済み分析(JSON):
${JSON.stringify(input.analysis, null, 2)}

注意:
- ⑥ではNG行動を具体的に1つ
- ⑦では今日やる行動を具体的に1つ
- ⑧では質問を1つだけ
- analysis.notes に精度注意があれば、断定を弱めて自然に補足する`;
}
