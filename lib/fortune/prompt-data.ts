import type { CompatibilitySummary, FortuneProfile, ProblemAnalysis } from "./types";

export function buildPromptContext(params: {
  self: FortuneProfile;
  partner: FortuneProfile | null;
  compatibility: CompatibilitySummary | null;
  problem: ProblemAnalysis;
  message: string;
}) {
  const { self, partner, compatibility, problem, message } = params;

  const synthesis = {
    keyLabels: {
      animal: `あなたは${self.animal}タイプです`,
      dayMaster: `あなたの日干は${self.dayMaster}です`,
      western: `太陽${self.astrology.sun}・月${self.astrology.moon}・金星${self.astrology.venus}・火星${self.astrology.mars}`,
      numerology: `ライフパスは${self.lifePath}`
    },
    integratedRead:
      `${self.animalTraits.love} ${self.dayMasterTraits.love} ${self.astrology.venusText} ` +
      `${self.lifePathText}`,
    psychologyFocus: problem,
    compatibilityFocus: compatibility
  };

  return {
    self: {
      animal: self.animal,
      animalTraits: self.animalTraits,
      dayMaster: self.dayMaster,
      dayMasterTraits: self.dayMasterTraits,
      sun: self.astrology.sun,
      moon: self.astrology.moon,
      venus: self.astrology.venus,
      mars: self.astrology.mars,
      sunText: self.astrology.sunText,
      moonText: self.astrology.moonText,
      venusText: self.astrology.venusText,
      marsText: self.astrology.marsText,
      lifePath: self.lifePath,
      lifePathText: self.lifePathText,
      psychologyTags: self.psychologyTags
    },
    partner: partner
      ? {
          animal: partner.animal,
          dayMaster: partner.dayMaster,
          moon: partner.astrology.moon,
          venus: partner.astrology.venus,
          psychologyTags: partner.psychologyTags
        }
      : null,
    compatibility,
    problem,
    message,
    synthesis
  };
}
