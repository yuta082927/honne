import { buildNextQuestion, shouldAskQuestionThisTurn } from "@/lib/chat/dialoguePolicy";
import { computeAnimalLogic } from "@/lib/fortune/animalLogic";
import { computeCompatibility } from "@/lib/fortune/compatibility";
import { buildCoachingPlan } from "@/lib/fortune/coaching";
import { computeEasternCore } from "@/lib/fortune/easternCore";
import { inferPsychologyTags } from "@/lib/fortune/psychology";
import { buildIntegratedSummary, buildModeSummary } from "@/lib/fortune/summary";
import { computeWesternAstrology } from "@/lib/fortune/westernAstrology";
import type { FortuneComputationResult, FortuneProfileInput } from "@/lib/fortune/types";
import type { FortuneMode, ResponseDepth } from "@/lib/constants";

function easternToLegacyShichu(eastern?: ReturnType<typeof computeEasternCore>) {
  if (!eastern) return undefined;

  const stemMap: Record<string, string> = {
    木: "甲",
    火: "丙",
    土: "戊",
    金: "庚",
    水: "壬"
  };

  return {
    heavenlyStem: stemMap[eastern.baseElement],
    earthlyBranch: eastern.relationshipDrive === "継続型" ? "辰" : "午",
    element: eastern.baseElement,
    polarity: eastern.polarity,
    tendency: eastern.summary
  };
}

export function computeFortuneEngine(input: {
  mode: FortuneMode;
  depth: ResponseDepth;
  profile: FortuneProfileInput;
}): FortuneComputationResult {
  const selfWestern = computeWesternAstrology(input.profile.self);
  const selfAnimal = computeAnimalLogic(input.profile.self);
  const selfEastern = computeEasternCore(input.profile.self);

  const partnerInput = input.profile.partner;
  const partnerWestern = partnerInput ? computeWesternAstrology(partnerInput) : undefined;
  const partnerAnimal = partnerInput ? computeAnimalLogic(partnerInput) : undefined;
  const partnerEastern = partnerInput ? computeEasternCore(partnerInput) : undefined;

  const notes: string[] = [];
  if (!input.profile.self.birthDate) {
    notes.push("自分の生年月日が未入力です。占術精度は簡易推定になります。");
  }
  if (!partnerInput?.birthDate) {
    notes.push("相手の生年月日が未入力のため、相性分析は限定版です。");
  }
  if (!input.profile.self.birthTime || !input.profile.self.birthPlace) {
    notes.push("出生時刻・出生地が未入力のため、アセンダントは推定しません。");
  }

  const base: FortuneComputationResult = {
    mode: input.mode,
    depth: input.depth,
    self: {
      birthDate: input.profile.self.birthDate,
      birthTime: input.profile.self.birthTime,
      birthPlace: input.profile.self.birthPlace,
      gender: input.profile.self.gender,
      western: selfWestern,
      animal: selfAnimal,
      eastern: selfEastern,
      zodiac: selfWestern ? { sign: selfWestern.sun } : undefined,
      shichu: easternToLegacyShichu(selfEastern)
    },
    partner: partnerInput
      ? {
          birthDate: partnerInput.birthDate,
          birthTime: partnerInput.birthTime,
          birthPlace: partnerInput.birthPlace,
          western: partnerWestern,
          animal: partnerAnimal,
          eastern: partnerEastern,
          zodiac: partnerWestern ? { sign: partnerWestern.sun } : undefined,
          shichu: easternToLegacyShichu(partnerEastern)
        }
      : undefined,
    psychology: [],
    coaching: {
      coreIssue: "",
      emotionalNaming: "",
      ngAction: "",
      todayAction: "",
      nextLens: ""
    },
    integratedSummary: {
      romanticCore: "",
      painReason: "",
      mismatch: "",
      flow: ""
    },
    nextQuestion: "",
    modeSummary: buildModeSummary(input.mode),
    notes
  };

  const compatibility = computeCompatibility(base);
  if (compatibility) {
    base.compatibility = {
      ...compatibility,
      animalScore: Math.round(compatibility.totalScore * 0.85),
      zodiacScore: Math.round(compatibility.totalScore * 1.05 > 100 ? 100 : compatibility.totalScore * 1.05),
      verdict:
        compatibility.totalScore >= 78
          ? "相性は高め。温度差の調整ができれば安定しやすい。"
          : compatibility.totalScore >= 58
            ? "相性は中間。連絡テンポを合わせるほど噛み合う。"
            : "相性は課題あり。距離感の設計が必要。"
    };
  }

  base.psychology = inferPsychologyTags({
    concern: input.profile.concern,
    history: input.profile.history,
    analysis: base
  });

  base.coaching = buildCoachingPlan({
    concern: input.profile.concern,
    depth: input.depth,
    analysis: base,
    psychology: base.psychology
  });

  base.integratedSummary = buildIntegratedSummary({
    analysis: base,
    coaching: base.coaching,
    compatibility: base.compatibility
  });

  base.nextQuestion = shouldAskQuestionThisTurn(input.profile.history?.length ?? 0)
    ? buildNextQuestion(base)
    : "いま一番苦しい場面を1つだけ教えてください。";

  return base;
}
