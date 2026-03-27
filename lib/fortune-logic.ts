import { computeFortuneEngine } from "@/lib/fortune";
import type { FortuneMode, ResponseDepth, UserGender } from "@/lib/constants";
import type { FortuneComputationResult, FortuneProfileInput } from "@/lib/fortune/types";

export function computeFortuneData(input: {
  mode: FortuneMode;
  depth?: ResponseDepth;
  profile: {
    selfBirthDate?: string;
    selfBirthTime?: string;
    selfBirthPlace?: string;
    partnerBirthDate?: string;
    partnerBirthTime?: string;
    partnerBirthPlace?: string;
    gender?: UserGender;
  };
  concern?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}): FortuneComputationResult {
  const profile: FortuneProfileInput = {
    self: {
      birthDate: input.profile.selfBirthDate,
      birthTime: input.profile.selfBirthTime,
      birthPlace: input.profile.selfBirthPlace,
      gender: input.profile.gender
    },
    partner: input.profile.partnerBirthDate || input.profile.partnerBirthTime || input.profile.partnerBirthPlace
      ? {
          birthDate: input.profile.partnerBirthDate,
          birthTime: input.profile.partnerBirthTime,
          birthPlace: input.profile.partnerBirthPlace
        }
      : undefined,
    concern: input.concern ?? "",
    history: input.history
  };

  return computeFortuneEngine({
    mode: input.mode,
    depth: input.depth ?? "ライト",
    profile
  });
}

export function summarizeFortuneData(result: FortuneComputationResult): string {
  const animal = result.self.animal?.name ?? "未判定";
  const sun = result.self.western?.sun ?? "未判定";
  const east = result.self.eastern ? `${result.self.eastern.baseElement}${result.self.eastern.polarity}` : "未判定";
  const score = result.compatibility?.totalScore ?? null;

  return `自分: 動物=${animal}, 太陽=${sun}, 東洋骨格=${east}${score !== null ? ` / 相性=${score}` : ""}`;
}

export function normalizeGender(value?: string): UserGender | undefined {
  if (!value) return undefined;
  const normalized = value.trim();
  return normalized === "女性" || normalized === "男性" || normalized === "その他" || normalized === "回答しない"
    ? normalized
    : undefined;
}
