import { analyzeProblem } from "@/lib/fortune/psychology";
import type { CoachingPlan, FortuneComputationResult, PsychologyTag } from "@/lib/fortune/types";

function pickTag(tags: PsychologyTag[], key: PsychologyTag["key"]): PsychologyTag | undefined {
  return tags.find((tag) => tag.key === key);
}

function levelText(level: PsychologyTag["level"] | undefined): string {
  if (level === "high") return "強め";
  if (level === "mid") return "中程度";
  return "控えめ";
}

// ─── 週間プラン: 悩みタイプ × 時期で分岐 ─────────────────
function buildWeeklyPlan(problemType: string, timingFlow: string): string[] {
  const isMoving = timingFlow === "動く時期";

  if (problemType === "返信遅い") {
    return isMoving
      ? [
          "1日目: 待つ上限時間を自分で決める（24〜48時間）",
          "2日目: 上限を過ぎたら1文の短い自然な連絡を1本だけ送る",
          "4日目: 返信が来たら前回より短めに返し、テンポを相手に合わせる",
          "7日目: 連絡テンポが安定してきたら、返信速度への依存度を評価する"
        ]
      : [
          "1〜2日目: 返信確認の頻度を今の半分に落とす練習をする",
          "3日目: 自分の気持ちを短い言葉で書き出して整理する",
          "5日目: 送るとしたら何を伝えたいか、要点を1つに絞る",
          "7日目: 整理できたら短文を1本だけ送り、反応を冷静に見る"
        ];
  }

  if (problemType === "復縁") {
    return isMoving
      ? [
          "1日目: 連絡するなら「近況報告」1文だけにとどめる",
          "3日目: 相手の反応を見て、続けるか様子を見るかを判断する",
          "5日目: 返信があれば自然なやりとりを続け、関係を急がない",
          "7日目: 1週間の接点を振り返り、方向性を再評価する"
        ]
      : [
          "1〜3日目: 連絡よりも自分の気持ちを整理する期間にする",
          "4日目: なぜ復縁したいかを正直に言語化する",
          "6日目: 感情が落ち着いてから連絡するかを判断する",
          "7日目: 今の自分が本当に求めているものを確認する"
        ];
  }

  if (problemType === "片思い") {
    return isMoving
      ? [
          "1日目: 次に話せる場面を1つ思い浮かべ、話す内容を1行準備する",
          "3日目: 短い自然な会話を1回作ることを目標にする",
          "5日目: 相手の反応をフラットに観察し、関心のサインを確認する",
          "7日目: アプローチを続けるか、自然に任せるかを判断する"
        ]
      : [
          "1〜2日目: 焦らず相手を少し観察する期間にする",
          "3日目: 自分が何を好きなのかを改めて整理する",
          "5日目: 自分らしくいられる状況を1つ作る",
          "7日目: 流れが来たら動く姿勢を維持する"
        ];
  }

  // 温度差・その他
  return isMoving
    ? [
        "1日目: 今日1回だけ、相手のペースで連絡を返してみる",
        "3日目: 気になっていることを短い1文で正直に伝える",
        "5日目: 相手の反応を見て、次の接点の頻度を調整する",
        "7日目: この1週間の手応えを振り返り、アプローチを見直す"
      ]
    : [
        "1〜2日目: 連絡頻度を少し落として、相手に余白を作る",
        "3日目: 自分が何に不満を感じているかを言葉にする",
        "5日目: 1つだけ伝えたいことを選んで短く伝える",
        "7日目: 関係の方向性について、自分なりの答えを出す"
      ];
}

// ─── 言葉選びのコツ: 悩みタイプ × 不安レベルで分岐 ──────
function buildWordingTip(problemType: string, anxietyLevel: PsychologyTag["level"] | undefined): string {
  if (problemType === "返信遅い" && anxietyLevel === "high") {
    return "「なんで返信くれないの？」より「最近どう？」で始めると相手の返信ハードルが下がります。";
  }
  if (problemType === "復縁") {
    return "過去の話より「今の自分」の状態を伝える言葉を選ぶと、相手が応答しやすくなります。";
  }
  if (problemType === "片思い") {
    return "好意を直接伝えるより「一緒にいると楽しい」という事実を伝えると受け取りやすいです。";
  }
  if (anxietyLevel === "high") {
    return "不安を責める言葉に変えず、「私はこう感じている」という形で伝えると関係が壊れにくいです。";
  }
  return "要点を1つに絞って短く送ると、相手が答えやすい状況を作れます。";
}

// ─── 動く vs 待つのヒント ─────────────────────────────────
function buildMoveVsWaitHint(timingFlow: string, problemType: string): string {
  if (timingFlow === "動く時期") {
    if (problemType === "返信遅い") {
      return "今は動く時期。ただし「確認」より「接続」を目的に短く動くほど成功率が上がります。";
    }
    return "今は小さく動いて反応を見る時期。大きな一手より短い接点を増やすほうが流れを作りやすいです。";
  }
  return "今は整える時期。焦って動くより、自分の言葉と気持ちを整えておくほど、次の一手が刺さりやすくなります。";
}

// ─── メインエクスポート ───────────────────────────────────
export function buildCoachingPlan(input: {
  concern: string;
  depth: "ライト" | "ディープ";
  analysis: FortuneComputationResult;
  psychology: PsychologyTag[];
}): CoachingPlan {
  const anxiety = pickTag(input.psychology, "anxiety");
  const reply = pickTag(input.psychology, "reply_meaning");
  const distance = pickTag(input.psychology, "distance");
  const problem = analyzeProblem(input.concern);
  const timingFlow = input.analysis.self.eastern?.timingFlow ?? "整える時期";

  const compatibilityGap = input.analysis.compatibility?.communicationGapTags[0] ?? "連絡テンポのズレ";

  const coreIssue = `${compatibilityGap}に対して、${anxiety?.label ?? "不安傾向"}（${levelText(anxiety?.level)}）が反応している状態。`;
  const emotionalNaming =
    reply?.level === "high"
      ? "不安の正体は『返信そのもの』より『見捨てられる想像』に近い。"
      : "いまの苦しさは『状況の不明確さ』が主因。";

  const ngAction =
    reply?.level === "high"
      ? "気持ちが乱れた直後の長文確認連絡は避ける。"
      : "結論を急いで白黒を迫る行動は避ける。";

  const todayAction =
    distance?.level === "high"
      ? "送る前に1分だけ深呼吸して、3行以内の短文を下書きする。"
      : "今日の連絡は要点1つだけに絞って送る。";

  const nextLens = "次は『相手の気持ち』より『自分が安心できる連絡設計』を確認する。";

  if (input.depth === "ライト") {
    return { coreIssue, emotionalNaming, ngAction, todayAction, nextLens };
  }

  return {
    coreIssue,
    emotionalNaming,
    ngAction,
    todayAction,
    nextLens,
    weeklyPlan: buildWeeklyPlan(problem.type, timingFlow),
    wordingTip: buildWordingTip(problem.type, anxiety?.level),
    moveVsWaitHint: buildMoveVsWaitHint(timingFlow, problem.type)
  };
}
