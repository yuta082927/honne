import { marsTraits, moonTraits, sunTraits, venusTraits } from "@/lib/fortune/astrology-data";
import type { BirthInput, WesternCore, ZodiacSign } from "@/lib/fortune/types";

type ZodiacDef = {
  sign: ZodiacSign;
  from: [number, number];
  to: [number, number];
};

const ZODIACS: ZodiacDef[] = [
  { sign: "牡羊座", from: [3, 21], to: [4, 19] },
  { sign: "牡牛座", from: [4, 20], to: [5, 20] },
  { sign: "双子座", from: [5, 21], to: [6, 21] },
  { sign: "蟹座", from: [6, 22], to: [7, 22] },
  { sign: "獅子座", from: [7, 23], to: [8, 22] },
  { sign: "乙女座", from: [8, 23], to: [9, 22] },
  { sign: "天秤座", from: [9, 23], to: [10, 23] },
  { sign: "蠍座", from: [10, 24], to: [11, 22] },
  { sign: "射手座", from: [11, 23], to: [12, 21] },
  { sign: "山羊座", from: [12, 22], to: [1, 19] },
  { sign: "水瓶座", from: [1, 20], to: [2, 18] },
  { sign: "魚座", from: [2, 19], to: [3, 20] }
];

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!matched) return null;

  const y = Number(matched[1]);
  const m = Number(matched[2]);
  const d = Number(matched[3]);
  const date = new Date(Date.UTC(y, m - 1, d));

  if (date.getUTCFullYear() !== y || date.getUTCMonth() + 1 !== m || date.getUTCDate() !== d) {
    return null;
  }

  return date;
}

function dayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000) + 1;
}

function findSunSign(date: Date): ZodiacDef {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  return (
    ZODIACS.find((z) => {
      const [fromMonth, fromDay] = z.from;
      const [toMonth, toDay] = z.to;

      if (fromMonth <= toMonth) {
        return (
          (month > fromMonth || (month === fromMonth && day >= fromDay)) &&
          (month < toMonth || (month === toMonth && day <= toDay))
        );
      }

      return (
        month > fromMonth ||
        month < toMonth ||
        (month === fromMonth && day >= fromDay) ||
        (month === toMonth && day <= toDay)
      );
    }) ?? ZODIACS[0]
  );
}

function zodiacByIndex(index: number): ZodiacSign {
  const safe = ((index % 12) + 12) % 12;
  return ZODIACS[safe].sign;
}

function placeHash(place?: string): number {
  if (!place) return 0;
  let total = 0;
  for (const char of place) {
    total += char.charCodeAt(0);
  }
  return total % 12;
}

function timeToIndex(time?: string): number {
  if (!time) return 0;
  const matched = /^(\d{2}):(\d{2})$/.exec(time);
  if (!matched) return 0;
  const hour = Number(matched[1]);
  if (!Number.isFinite(hour)) return 0;
  return Math.floor(hour / 2) % 12;
}

export function computeWesternAstrology(input: BirthInput): WesternCore | undefined {
  const date = parseDate(input.birthDate);
  if (!date) return undefined;

  const sunDef = findSunSign(date);
  const doy = dayOfYear(date);

  const moon = zodiacByIndex(doy + date.getUTCFullYear());
  const venus = zodiacByIndex(doy + date.getUTCMonth() * 2 + 7);
  const mars = zodiacByIndex(doy + date.getUTCDate() * 3 + 11);

  const hasAscData = Boolean(input.birthTime && input.birthPlace);
  const ascendant = hasAscData
    ? zodiacByIndex(timeToIndex(input.birthTime) + placeHash(input.birthPlace))
    : undefined;

  const confidence: WesternCore["confidence"] = hasAscData
    ? "high"
    : input.birthTime || input.birthPlace
      ? "medium"
      : "low";

  const notes: string[] = [];
  if (!input.birthTime) {
    notes.push("出生時刻が未入力のため、アセンダントは推定しません。");
  }
  if (!input.birthPlace) {
    notes.push("出生地が未入力のため、地域依存の判定は簡易化しています。");
  }

  return {
    sun: sunDef.sign,
    moon,
    venus,
    mars,
    ascendant,
    confidence,
    notes,
    loveFocus: [
      `太陽: ${sunTraits[sunDef.sign]}`,
      `月: ${moonTraits[moon]}`,
      `金星: ${venusTraits[venus]}`,
      `火星: ${marsTraits[mars]}`
    ]
  };
}

export function getWesternSignIndex(sign: ZodiacSign): number {
  return ZODIACS.findIndex((item) => item.sign === sign);
}

export function getWesternZodiacLabels(): ZodiacSign[] {
  return ZODIACS.map((item) => item.sign);
}
