import type { AstrologySummary, ZodiacSign } from "./types";
import { marsTraits, moonTraits, sunTraits, venusTraits } from "./astrology-data";

const signs: ZodiacSign[] = [
  "牡羊座",
  "牡牛座",
  "双子座",
  "蟹座",
  "獅子座",
  "乙女座",
  "天秤座",
  "蠍座",
  "射手座",
  "山羊座",
  "水瓶座",
  "魚座"
];

function parseDate(date: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD.");
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const value = new Date(Date.UTC(y, mo - 1, d));
  if (value.getUTCFullYear() !== y || value.getUTCMonth() + 1 !== mo || value.getUTCDate() !== d) {
    throw new Error("Invalid date value.");
  }
  return value;
}

export function getSunSign(date: string): ZodiacSign {
  const d = parseDate(date);
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "牡羊座";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "牡牛座";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 21)) return "双子座";
  if ((m === 6 && day >= 22) || (m === 7 && day <= 22)) return "蟹座";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "獅子座";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "乙女座";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 23)) return "天秤座";
  if ((m === 10 && day >= 24) || (m === 11 && day <= 22)) return "蠍座";
  if ((m === 11 && day >= 23) || (m === 12 && day <= 21)) return "射手座";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "山羊座";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "水瓶座";
  return "魚座";
}

function shiftedSign(date: string, shift: number): ZodiacSign {
  const d = parseDate(date);
  const base = (d.getUTCMonth() + d.getUTCDate() + shift) % 12;
  return signs[base];
}

export function getAstrologySummary(date: string): AstrologySummary {
  const sun = getSunSign(date);
  const moon = shiftedSign(date, 1);
  const venus = shiftedSign(date, 4);
  const mars = shiftedSign(date, 7);

  return {
    sun,
    moon,
    venus,
    mars,
    sunText: sunTraits[sun],
    moonText: moonTraits[moon],
    venusText: venusTraits[venus],
    marsText: marsTraits[mars]
  };
}
