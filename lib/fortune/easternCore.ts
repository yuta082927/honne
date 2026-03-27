import { getDayMaster, getDayMasterTraits } from "@/lib/fortune/daymaster";
import type { BirthInput, DayMaster, EasternCore } from "@/lib/fortune/types";

const STEMS: ReadonlyArray<{
  stem: DayMaster;
  element: EasternCore["baseElement"];
  polarity: EasternCore["polarity"];
}> = [
  { stem: "甲", element: "木", polarity: "陽" },
  { stem: "乙", element: "木", polarity: "陰" },
  { stem: "丙", element: "火", polarity: "陽" },
  { stem: "丁", element: "火", polarity: "陰" },
  { stem: "戊", element: "土", polarity: "陽" },
  { stem: "己", element: "土", polarity: "陰" },
  { stem: "庚", element: "金", polarity: "陽" },
  { stem: "辛", element: "金", polarity: "陰" },
  { stem: "壬", element: "水", polarity: "陽" },
  { stem: "癸", element: "水", polarity: "陰" }
];

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() + 1 !== mo || date.getUTCDate() !== d) return null;
  return date;
}

function getDayMasterFromDate(date: Date): DayMaster {
  const y = date.getUTCFullYear();
  return STEMS[((y - 4) % 10 + 10) % 10].stem;
}

export function computeEasternCore(input: BirthInput): EasternCore | undefined {
  const date = parseDate(input.birthDate);
  if (!date) return undefined;

  const y = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const birthdate = `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  let dayMaster: DayMaster;
  try {
    dayMaster = getDayMaster(birthdate);
  } catch {
    dayMaster = getDayMasterFromDate(date);
  }

  const stem = STEMS.find((item) => item.stem === dayMaster) ?? STEMS[0];
  const trait = getDayMasterTraits(dayMaster);

  const relationshipDrive: EasternCore["relationshipDrive"] = (month + day) % 2 === 0 ? "継続型" : "直感型";

  const attachmentRisk: EasternCore["attachmentRisk"] =
    stem.element === "水" || stem.element === "火" ? "高" : stem.element === "木" ? "中" : "低";

  const timingFlow: EasternCore["timingFlow"] = (y + month) % 3 === 0 ? "動く時期" : "整える時期";

  const timingSummary =
    timingFlow === "動く時期"
      ? "いまは関係を前進させるより、短い行動を試して反応を見るほど流れが掴みやすい。"
      : "いまは答えを急がず、感情の整頓と距離感の再設定が成果につながりやすい。";

  const summary = `${trait.core} ${trait.love} ${timingSummary}`;

  return {
    baseElement: stem.element,
    polarity: stem.polarity,
    relationshipDrive,
    attachmentRisk,
    timingFlow,
    summary
  };
}
