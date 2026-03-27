import type { CoachingPlan, CompatibilityLens, FortuneComputationResult } from "@/lib/fortune/types";

export function buildIntegratedSummary(input: {
  analysis: FortuneComputationResult;
  coaching: CoachingPlan;
  compatibility?: CompatibilityLens;
}): FortuneComputationResult["integratedSummary"] {
  const selfAnimal = input.analysis.self.animal?.name ?? "未判定";
  const selfSun = input.analysis.self.western?.sun ?? "未判定";

  const romanticCore = `あなたの恋愛の核は「${selfAnimal}×${selfSun}」タイプ。感情と理性の両方で関係を守ろうとする傾向。`;

  const painReason = input.coaching.emotionalNaming;

  const mismatch =
    input.compatibility && (input.compatibility.communicationGapTags.length > 0 || input.compatibility.distanceGapTags.length > 0)
      ? `主なズレは「${[...input.compatibility.communicationGapTags, ...input.compatibility.distanceGapTags].slice(0, 2).join(" / ")}」。`
      : "現時点では大きな相性衝突より、認識ズレの調整が主課題。";

  const flow = input.analysis.self.eastern?.timingFlow === "動く時期"
    ? "今は小さく動いて反応を見る時期。短い行動が流れを変えやすい。"
    : "今は整える時期。焦りを減らすほど次の一手が当たりやすい。";

  return {
    romanticCore,
    painReason,
    mismatch,
    flow
  };
}

export function buildModeSummary(mode: FortuneComputationResult["mode"]): string[] {
  switch (mode) {
    case "動物占い":
      return ["本質タイプと距離感スタイルを中心に恋愛行動を読む。", "意思決定テンポと対話の噛み合わせを重視する。"];
    case "西洋占星術":
      return ["太陽・月・金星・火星（+条件付きアセンダント）で感情と恋愛行動を読む。", "感情表現と連絡温度のズレを重点分析する。"];
    case "算命学・四柱推命":
      return ["生年月日ベースで性格骨格と時期の流れを読む。", "いま動くべきか整えるべきかを明確にする。"];
    case "相性":
      return ["2人の感情テンポ・距離感・連絡解釈のズレを中心に分析する。", "関係修復に使える安全行動を優先する。"];
    default:
      return ["西洋・動物・東洋系を統合し、恋愛構造を一貫した言葉で整理する。", "最初の1手が決めやすい総合導線として提示する。"];
  }
}
