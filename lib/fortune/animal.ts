import { animalTraits } from "./animal-data";
import type { AnimalType } from "./types";

const animals: AnimalType[] = [
  "ライオン",
  "ゾウ",
  "コアラ",
  "チーター",
  "黒ひょう",
  "トラ",
  "ひつじ",
  "サル",
  "たぬき",
  "こじか",
  "オオカミ",
  "ペガサス"
];

function parseBirthdateToUtcDate(birthdate: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthdate);
  if (!m) {
    throw new Error("Invalid birthdate format. Expected YYYY-MM-DD.");
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() + 1 !== mo || date.getUTCDate() !== d) {
    throw new Error("Invalid birthdate value.");
  }
  return date;
}

export function getAnimalType(birthdate: string): AnimalType {
  const d = parseBirthdateToUtcDate(birthdate);
  const seed = (d.getUTCFullYear() + (d.getUTCMonth() + 1) + d.getUTCDate()) % 12;
  return animals[seed];
}

export function getAnimalTraits(animal: AnimalType) {
  return animalTraits[animal];
}
