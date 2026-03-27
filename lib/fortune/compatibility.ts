import { compareAnimalCompatibility } from "@/lib/fortune/animalLogic";
import { getWesternSignIndex } from "@/lib/fortune/westernAstrology";
import type {
  CompatibilityLens,
  CompatibilitySummary,
  FortuneComputationResult,
  FortuneProfile,
  WesternCore
} from "@/lib/fortune/types";

function zodiacDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 12 - diff);
}

function hasAny(tags: string[], keywords: string[]) {
  return keywords.some((k) => tags.some((t) => t.includes(k)));
}

function westernGapScore(self?: WesternCore, partner?: WesternCore): {
  score: number;
  communicationGapTags: string[];
  emotionalGapTags: string[];
  distanceGapTags: string[];
  safeBondTags: string[];
} {
  if (!self || !partner) {
    return {
      score: 60,
      communicationGapTags: [],
      emotionalGapTags: [],
      distanceGapTags: [],
      safeBondTags: ["相手データがあると相性精度が上がる"]
    };
  }

  const selfMoon = getWesternSignIndex(self.moon);
  const partnerMoon = getWesternSignIndex(partner.moon);
  const selfVenus = getWesternSignIndex(self.venus);
  const partnerVenus = getWesternSignIndex(partner.venus);
  const selfMars = getWesternSignIndex(self.mars);
  const partnerMars = getWesternSignIndex(partner.mars);

  const moonDiff = zodiacDistance(selfMoon, partnerMoon);
  const venusDiff = zodiacDistance(selfVenus, partnerVenus);
  const marsDiff = zodiacDistance(selfMars, partnerMars);

  const score = Math.max(30, 100 - moonDiff * 10 - venusDiff * 8 - marsDiff * 6);

  const communicationGapTags: string[] = [];
  const emotionalGapTags: string[] = [];
  const distanceGapTags: string[] = [];
  const safeBondTags: string[] = [];

  if (moonDiff >= 5) {
    emotionalGapTags.push("感情の波のタイミングがズレやすい");
  } else {
    safeBondTags.push("感情理解の相性が良い");
  }

  if (venusDiff >= 4) {
    communicationGapTags.push("愛情表現の頻度に温度差が出やすい");
  } else {
    safeBondTags.push("愛情の伝え方が噛み合いやすい");
  }

  if (marsDiff >= 5) {
    distanceGapTags.push("近づき方・離れ方のテンポ差がある");
  } else {
    safeBondTags.push("行動テンポが比較的合う");
  }

  return { score, communicationGapTags, emotionalGapTags, distanceGapTags, safeBondTags };
}

export function computeCompatibility(result: FortuneComputationResult): CompatibilityLens | undefined {
  if (!result.partner) {
    return undefined;
  }

  const western = westernGapScore(result.self.western, result.partner.western);
  const animal = compareAnimalCompatibility(result.self.animal, result.partner.animal);

  const totalScore = Math.round(western.score * 0.7 + (animal?.score ?? 60) * 0.3);
  const mergedSafe = [...western.safeBondTags, ...(animal?.tags ?? [])].slice(0, 4);

  return {
    totalScore,
    communicationGapTags: western.communicationGapTags,
    emotionalGapTags: western.emotionalGapTags,
    distanceGapTags: western.distanceGapTags,
    safeBondTags: mergedSafe
  };
}

export function buildCompatibility(
  self: FortuneProfile,
  partner: FortuneProfile | null
): CompatibilitySummary | null {
  if (!partner) return null;

  const selfTags = [
    self.animalTraits.love,
    self.dayMasterTraits.love,
    self.astrology.moonText,
    self.astrology.venusText,
    ...self.psychologyTags
  ];

  const partnerTags = [
    partner.animalTraits.love,
    partner.dayMasterTraits.love,
    partner.astrology.moonText,
    partner.astrology.venusText,
    ...partner.psychologyTags
  ];

  const selfAnxious = hasAny(selfTags, ["不安", "安心", "確認", "深く"]);
  const partnerDistance = hasAny(partnerTags, ["自由", "距離", "束縛", "軽やか"]);
  const bothStable = hasAny(selfTags, ["安定", "信頼"]) && hasAny(partnerTags, ["安定", "信頼"]);

  if (selfAnxious && partnerDistance) {
    return {
      overall: "惹かれやすい相性ですが、連絡頻度や距離感でズレが出やすい関係です。",
      conflict: "あなたは安心確認を求めやすく、相手は余白や自由を必要としやすい点です。",
      goodPattern: "短く穏やかなやりとりを続け、相手のペースを急かさない形だと関係が安定しやすいです。",
      advice: "確認したくなった時ほど、一度言葉を短く整えてから送るのが有効です。"
    };
  }

  if (bothStable) {
    return {
      overall: "堅実で長続きしやすい相性です。",
      conflict: "大きな衝突は少ない反面、気持ちを溜め込むと停滞しやすいです。",
      goodPattern: "安心感を土台にしながら、小さな本音共有を増やすとうまくいきます。",
      advice: "安定している時ほど、気持ちを言葉にして関係を前に進めるのが大切です。"
    };
  }

  return {
    overall: "お互いに学びが多い相性です。",
    conflict: "感じ方や動くタイミングの違いで、温度差を感じやすい場面があります。",
    goodPattern: "相手のペースを理解しつつ、自分の気持ちも曖昧にしない時に関係が整いやすいです。",
    advice: "相手に合わせるだけでなく、自分が何を求めているかを先に整理するのが鍵です。"
  };
}
