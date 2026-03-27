import { getAnimalTraits, getAnimalType } from "./animal";
import { getAstrologySummary } from "./astrology";
import { getDayMaster, getDayMasterTraits } from "./daymaster";
import { derivePsychologyTags } from "./psychology";
import type { FortuneProfile } from "./types";
import { getLifePath, numerologyTraits } from "./numerology";

export function buildFortuneProfile(birthdate: string, message: string): FortuneProfile {
  const animal = getAnimalType(birthdate);
  const animalTraits = getAnimalTraits(animal);

  const dayMaster = getDayMaster(birthdate);
  const dayMasterTraits = getDayMasterTraits(dayMaster);

  const astrology = getAstrologySummary(birthdate);

  const lifePath = getLifePath(birthdate);
  const lifePathText = numerologyTraits[lifePath];

  const psychologyTags = derivePsychologyTags(message, [
    animalTraits.weakness,
    dayMasterTraits.weakness,
    astrology.moonText,
    astrology.venusText
  ]);

  return {
    animal,
    animalTraits,
    dayMaster,
    dayMasterTraits,
    astrology,
    lifePath,
    lifePathText,
    psychologyTags
  };
}
