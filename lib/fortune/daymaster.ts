import type { DayMaster } from "./types";
import { dayMasterTraits } from "./daymaster-data";

const stems: DayMaster[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

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

export function getDayMaster(birthdate: string): DayMaster {
  const d = parseBirthdateToUtcDate(birthdate);
  const seed = (d.getUTCFullYear() + (d.getUTCMonth() + 1) + d.getUTCDate()) % 10;
  return stems[seed];
}

export function getDayMasterTraits(dayMaster: DayMaster) {
  return dayMasterTraits[dayMaster];
}
