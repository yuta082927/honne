import type { FortuneComputationResult, ProblemAnalysis, PsychologyTag } from "@/lib/fortune/types";

function detectKeywords(text: string, keys: string[]): boolean {
  return keys.some((key) => text.includes(key));
}

export function analyzeProblem(message: string): ProblemAnalysis {
  const text = message.toLowerCase();

  let type = "恋愛全般";
  let emotion = "迷い";
  let need = "状況整理";

  if (/返信|既読|未読|line|ライン/.test(text)) type = "返信遅い";
  if (/復縁|元彼|元カノ/.test(text)) type = "復縁";
  if (/片思い|好きな人/.test(text)) type = "片思い";
  if (/温度差|冷たい|そっけない/.test(text)) type = "温度差";

  if (/不安|怖い|しんどい|苦しい/.test(text)) emotion = "不安";
  else if (/焦る|早く|急い/.test(text)) emotion = "焦り";
  else if (/怒|ムカつ|腹立/.test(text)) emotion = "怒り";
  else if (/期待|信じたい/.test(text)) emotion = "期待";

  if (/どうしたら|どうすれば/.test(text)) need = "行動指針";
  if (/脈|気持ち/.test(text)) need = "相手の本音";
  if (/待つ|動く/.test(text)) need = "判断材料";

  return { type, emotion, need };
}

export function derivePsychologyTags(message: string, signals: string[]): string[] {
  const tags = [...signals];
  const text = message.toLowerCase();

  if (/返信|既読|未読/.test(text)) tags.push("返信の間隔に意味を乗せやすい");
  if (/不安|怖い|しんどい/.test(text)) tags.push("不安を抱えやすい");
  if (/どうしたら|どうすれば|動くべき/.test(text)) tags.push("すぐ答えを出したくなりやすい");
  if (/待てない|追い/.test(text)) tags.push("不安時に先に動きやすい");

  return Array.from(new Set(tags));
}

function levelFrom(tags: string[], target: string): PsychologyTag["level"] {
  if (tags.includes(target)) return "high";
  if (tags.length >= 2) return "mid";
  return "low";
}

export function inferPsychologyTags(input: {
  concern: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  analysis: FortuneComputationResult;
}): PsychologyTag[] {
  const corpus = `${input.concern}\n${(input.history ?? []).map((item) => item.content).join("\n")}`;
  const problem = analyzeProblem(corpus);

  const baseSignals: string[] = [];
  if (problem.emotion === "不安") baseSignals.push("不安を抱えやすい");
  if (problem.need === "行動指針") baseSignals.push("すぐ答えを出したくなりやすい");
  if (problem.type === "返信遅い") baseSignals.push("返信の間隔に意味を乗せやすい");

  const tagsText = derivePsychologyTags(corpus, baseSignals);
  const replyMeaning = detectKeywords(corpus, ["返信", "既読", "未読", "遅い", "無視"]);
  const distanceConcern = detectKeywords(corpus, ["近づ", "離れ", "距離感", "重い", "温度差"]);

  const tags: PsychologyTag[] = [
    {
      key: "anxiety",
      label: "不安傾向",
      level: levelFrom(tagsText, "不安を抱えやすい"),
      reason:
        problem.emotion === "不安"
          ? "不安語が多く、感情の揺れが強めに出ている"
          : "大きな不安語は少ないが、慎重さが見られる"
    },
    {
      key: "avoidance",
      label: "回避傾向",
      level: detectKeywords(corpus, ["距離", "冷め", "もういい", "諦め"]) ? "mid" : "low",
      reason: detectKeywords(corpus, ["距離", "冷め", "もういい", "諦め"])
        ? "傷つく前に引く語彙が見られる"
        : "関係を続けたい意図が中心"
    },
    {
      key: "dependency",
      label: "依存傾向",
      level: detectKeywords(corpus, ["ずっと", "毎日", "ないと", "依存", "気になって"]) ? "mid" : "low",
      reason: detectKeywords(corpus, ["ずっと", "毎日", "ないと", "依存", "気になって"])
        ? "相手反応で気分が上下しやすい"
        : "自己軸を保てている"
    },
    {
      key: "approval",
      label: "承認欲求傾向",
      level: detectKeywords(corpus, ["嫌われ", "好かれ", "価値", "認め"]) ? "high" : "mid",
      reason: detectKeywords(corpus, ["嫌われ", "好かれ", "価値", "認め"])
        ? "相手評価と自己価値が近い形で語られている"
        : "評価意識はあるが過度ではない"
    },
    {
      key: "distance",
      label: "距離感タイプ",
      level: distanceConcern ? "high" : "mid",
      reason: distanceConcern ? "距離感・温度差が中心テーマ" : "距離設計は中程度の課題"
    },
    {
      key: "emotion_labeling",
      label: "感情言語化",
      level: detectKeywords(corpus, ["モヤモヤ", "言葉に", "整理", "感情"]) ? "mid" : "low",
      reason: detectKeywords(corpus, ["モヤモヤ", "言葉に", "整理", "感情"])
        ? "感情を言語化する姿勢がある"
        : "感情が先行しやすい"
    },
    {
      key: "reply_meaning",
      label: "返信意味づけ",
      level: replyMeaning ? "high" : "mid",
      reason: replyMeaning ? "返信速度や既読に意味を見出しやすい" : "返信以外の要素も見ている"
    },
    {
      key: "overreaction",
      label: "反応過敏傾向",
      level:
        replyMeaning ||
        (input.analysis.compatibility?.communicationGapTags.length ?? 0) > 0 ||
        (input.analysis.compatibility?.distanceGapTags.length ?? 0) > 0
          ? "mid"
          : "low",
      reason:
        replyMeaning ||
        (input.analysis.compatibility?.communicationGapTags.length ?? 0) > 0 ||
        (input.analysis.compatibility?.distanceGapTags.length ?? 0) > 0
          ? "相手の小さな変化を強く受け取りやすい"
          : "状況を分けて捉えられている"
    }
  ];

  return tags;
}
