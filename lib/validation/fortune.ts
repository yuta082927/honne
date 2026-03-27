import { z } from "zod";
import {
  FORTUNE_MODES,
  FORTUNE_TYPES,
  GENDER_OPTIONS,
  RESPONSE_DEPTHS,
  type FortuneMode,
  type FortuneType
} from "@/lib/constants";

/**
 * 制御文字（改行・タブ以外）を除去する。
 * LLMプロンプトへの埋め込み前にすべてのフリーテキストに適用する。
 */
function stripControlChars(value: string): string {
  // 0x00–0x08, 0x0B(垂直タブ), 0x0C(改ページ), 0x0E–0x1F, 0x7F を除去。
  // 0x09(タブ) と 0x0A(改行) は保持。
  return value.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
}

const historyItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1000).transform(stripControlChars)
});

const tarotCardSchema = z.object({
  name: z.string().trim().min(1).max(40).transform(stripControlChars),
  position: z.enum(["過去", "現在", "未来"])
});

const dateStringSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日付は YYYY-MM-DD 形式で入力してください。")
  .refine((value) => {
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() + 1 === m && date.getUTCDate() === d;
  }, "存在する日付を入力してください。")
  .refine((value) => value >= "1900-01-01" && value <= "2099-12-31", "日付の範囲が不正です。");

const timeStringSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "時刻は HH:mm 形式で入力してください。");

const legacyModeMap: Record<string, FortuneMode> = {
  占星術: "西洋占星術",
  四柱推命: "算命学・四柱推命"
};

const modeFromTypeMap: Record<FortuneType, FortuneMode> = {
  animal: "動物占い",
  astrology: "西洋占星術",
  sanmeigaku: "算命学・四柱推命",
  shichusuimei: "算命学・四柱推命",
  kyuseikigaku: "算命学・四柱推命",
  mbti: "総合",
  tarot: "タロット",
  compatibility: "相性",
  general: "総合"
};

const modeSchema = z.string().trim().min(1);

const rawFortuneRequestSchema = z
  .object({
    type: z.enum(FORTUNE_TYPES).optional(),
    mode: modeSchema.optional(),
    category: modeSchema.optional(),
    depth: z.enum(RESPONSE_DEPTHS).optional(),
    concern: z
      .string()
      .trim()
      .min(2, "相談内容は2文字以上で入力してください。")
      .max(2000, "相談内容は2000文字以内で入力してください。")
      .transform(stripControlChars),
    selfBirthDate: dateStringSchema.optional(),
    selfBirthTime: timeStringSchema.optional(),
    selfBirthPlace: z
      .string()
      .trim()
      .min(1)
      .max(80)
      // 制御文字と < > を禁止（地名として不要かつインジェクションリスク）
      .regex(/^[^\x00-\x1f\x7f<>]+$/, "出生地に使用できない文字が含まれています。")
      .optional(),
    partnerBirthDate: dateStringSchema.optional(),
    partnerBirthTime: timeStringSchema.optional(),
    partnerBirthPlace: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[^\x00-\x1f\x7f<>]+$/, "出生地に使用できない文字が含まれています。")
      .optional(),
    gender: z.enum(GENDER_OPTIONS).optional(),
    cards: z.array(tarotCardSchema).length(3).optional(),
    history: z.array(historyItemSchema).max(8).optional()
  })
  .superRefine((val, ctx) => {
    if (!Boolean(val.type ?? val.mode ?? val.category)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "占術タイプを選択してください。", path: ["type"] });
    }
    const isTarot = val.type === "tarot" || val.mode === "タロット";
    if (!isTarot && !val.selfBirthDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "自分の生年月日を入力してください。", path: ["selfBirthDate"] });
    }
    if (isTarot && (!val.cards || val.cards.length !== 3)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "タロットは3枚のカード選択が必要です。", path: ["cards"] });
    }
  });

function normalizeMode(raw: string): FortuneMode {
  const mapped = legacyModeMap[raw] ?? raw;
  if ((FORTUNE_MODES as readonly string[]).includes(mapped)) {
    return mapped as FortuneMode;
  }
  return "総合";
}

function resolveMode(input: { type?: FortuneType; mode?: string; category?: string }): FortuneMode {
  if (input.type) return modeFromTypeMap[input.type];
  return normalizeMode((input.mode ?? input.category) as string);
}

export const fortuneRequestSchema = rawFortuneRequestSchema.transform((value) => ({
  type: value.type,
  mode: resolveMode(value),
  depth: value.depth ?? "ライト",
  concern: value.concern,
  selfBirthDate: value.selfBirthDate,
  selfBirthTime: value.selfBirthTime,
  selfBirthPlace: value.selfBirthPlace,
  partnerBirthDate: value.partnerBirthDate,
  partnerBirthTime: value.partnerBirthTime,
  partnerBirthPlace: value.partnerBirthPlace,
  gender: value.gender,
  cards: value.cards,
  history: value.history ?? []
}));

export type FortuneRequestInput = z.infer<typeof fortuneRequestSchema>;
