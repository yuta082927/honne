import OpenAI from "openai";
import { DEPTH_MAX_TOKENS, type FortuneMode, type FortuneType, type ResponseDepth } from "@/lib/constants";
import { env } from "@/lib/env";
import {
  LOVE_FORTUNE_SALES_SYSTEM_PROMPT,
  buildLoveFortuneSalesFallback,
  buildLoveFortuneSalesUserPrompt,
  normalizeLoveFortuneSalesOutput,
  type SalesPromptProfile
} from "@/lib/fortune/prompts/sales";
import {
  buildFallbackFortune,
  buildSystemPrompt,
  buildUserPrompt,
  normalizeAiFortuneOutput
} from "@/lib/prompts";
import type { FortuneComputationResult } from "@/lib/fortune/types";

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type TarotCard = {
  name: string;
  position: "過去" | "現在" | "未来";
};

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
const debugOpenAI = process.env.OPENAI_DEBUG === "1";
const defaultPromptProfile: SalesPromptProfile = process.env.OPENAI_SALES_PROMPT === "0" ? "default" : "sales_v2";

export type FortuneResponseSource =
  | "openai"
  | "openai-fallback-no-key"
  | "openai-fallback-empty"
  | "openai-fallback-normalized"
  | "openai-fallback-error";

export type FortuneGenerationResult = {
  text: string;
  source: FortuneResponseSource;
  promptProfile: SalesPromptProfile;
  errorDetail?: {
    type: string;
    message: string;
    status?: number;
    code?: string;
  };
};

type VariationProfile = {
  tone: string;
  lens: string;
  storyFlow: string;
  openingLead: string;
  closingStyle: string;
};

const TONE_OPTIONS = ["やさしく包む語り口", "現実的で率直な語り口", "客観的で冷静な語り口", "スピリチュアル寄りの語り口"] as const;
const LENS_OPTIONS = ["未来シナリオ視点", "現状構造の分解視点", "見落としリスクの警告視点", "行動変容のアドバイス視点"] as const;
const STORY_FLOW_OPTIONS = [
  "現在の感情 -> 背景要因 -> 分岐点 -> 次の一手",
  "結論先出し -> 根拠解説 -> 注意点 -> 実行プラン",
  "相手視点の仮説 -> 自分の本音 -> 関係の転機 -> 行動提案",
  "短期(7日) -> 中期(1か月) -> 長期(3か月)の順で見立てる"
] as const;
const OPENING_LEADS = ["最初に強く出ているのは、", "いま一番はっきり見えるのは、", "占術データを重ねると、まず見えるのは、", "先に結論を言うと、"] as const;
const CLOSING_STYLES = ["背中を押す一言で締める", "次の確認質問で締める", "注意喚起で締める", "希望を残す言葉で締める"] as const;

function pickOne<T>(items: readonly T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function pickVariationProfile(): VariationProfile {
  return {
    tone: pickOne(TONE_OPTIONS),
    lens: pickOne(LENS_OPTIONS),
    storyFlow: pickOne(STORY_FLOW_OPTIONS),
    openingLead: pickOne(OPENING_LEADS),
    closingStyle: pickOne(CLOSING_STYLES)
  };
}

function buildConcernAnchor(concern: string): string {
  const trimmed = concern.trim().replace(/\s+/g, " ");
  return trimmed.length <= 40 ? trimmed : `${trimmed.slice(0, 40)}…`;
}

function buildVariationInstruction(profile: VariationProfile, variationSeed: string, concernAnchor: string): string {
  return `【出力バリエーション指示】
- variation_seed: ${variationSeed}
- tone: ${profile.tone}
- lens: ${profile.lens}
- story_flow: ${profile.storyFlow}
- opening: 最初の一文は必ず「${profile.openingLead}」で始める
- closing: ${profile.closingStyle}
- concern引用: 相談内容から「${concernAnchor}」を必ず「」付きで1回以上引用する
- 禁止: 前回と同じ導入文・同じ結論文・誰にでも当てはまる一般論の羅列
- variation_seed自体は回答本文に出力しない`;
}

function personalizeFallback(base: string, profile: VariationProfile, concernAnchor: string): string {
  const injected = `${profile.openingLead}「${concernAnchor}」を、${profile.lens}で整理します。`;
  const withSummary = base.includes("### 要約\n")
    ? base.replace("### 要約\n", `### 要約\n${injected}\n`)
    : base.includes("① 要約\n")
      ? base.replace("① 要約\n", `① 要約\n${injected}\n`)
      : `${injected}\n\n${base}`;

  return `${withSummary}\n\n補足: ${profile.closingStyle}を意識して次の一歩を決めてください。`;
}

function extractResponseText(response: { output_text?: string | null; output?: unknown }): string {
  const direct = response.output_text?.trim();
  if (direct) return direct;

  const outputItems = Array.isArray(response.output) ? response.output : [];
  const segments: string[] = [];

  for (const item of outputItems) {
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const block of content) {
      const text = (block as { text?: unknown }).text;
      if (typeof text === "string" && text.trim()) {
        segments.push(text.trim());
      }
    }
  }

  return segments.join("\n").trim();
}

function buildSalesCardsInfo(cards?: TarotCard[]): string {
  if (!cards || cards.length === 0) return "なし";
  return cards.map((card) => `- ${card.position}: ${card.name}`).join("\n");
}

function buildSalesSupplementalInfo(input: {
  mode: FortuneMode;
  depth: ResponseDepth;
  history?: HistoryMessage[];
  computed: FortuneComputationResult;
}): string {
  const lines: string[] = [`占術モード: ${input.mode}`, `深さ: ${input.depth}`];

  if (input.computed.self.birthDate) lines.push(`生年月日: ${input.computed.self.birthDate}`);
  if (input.computed.self.animal?.name) lines.push(`動物占い: ${input.computed.self.animal.name}`);
  if (input.computed.self.western?.sun) lines.push(`太陽星座: ${input.computed.self.western.sun}`);
  if (input.computed.partner?.western?.sun) lines.push(`相手の太陽星座: ${input.computed.partner.western.sun}`);
  if (input.computed.compatibility?.totalScore != null) {
    lines.push(`相性スコア: ${input.computed.compatibility.totalScore}`);
  }

  if (input.history && input.history.length > 0) {
    lines.push("会話履歴（直近）:");
    for (const message of input.history.slice(-6)) {
      const role = message.role === "user" ? "ユーザー" : "AI";
      lines.push(`- ${role}: ${message.content.slice(0, 120)}`);
    }
  } else {
    lines.push("会話履歴: なし");
  }

  return lines.join("\n");
}

function resolvePromptProfile(requested?: string): SalesPromptProfile {
  if (requested === "default") return "default";
  if (requested === "sales_v2") return "sales_v2";
  return defaultPromptProfile;
}

function dedupeConsecutiveLines(text: string): string {
  const lines = text.split(/\r?\n/);
  const deduped: string[] = [];

  for (const line of lines) {
    const prev = deduped[deduped.length - 1];
    if (line.trim().length > 0 && prev === line) continue;
    if (line.trim().length === 0 && prev?.trim().length === 0) continue;
    deduped.push(line);
  }

  return deduped.join("\n").trim();
}

export async function generateFortune(input: {
  type?: FortuneType;
  mode: FortuneMode;
  depth: ResponseDepth;
  concern: string;
  cards?: TarotCard[];
  history?: HistoryMessage[];
  computed: FortuneComputationResult;
  promptProfile?: SalesPromptProfile;
}): Promise<string> {
  const result = await generateFortuneWithMeta(input);
  return result.text;
}

export async function generateFortuneWithMeta(input: {
  type?: FortuneType;
  mode: FortuneMode;
  depth: ResponseDepth;
  concern: string;
  cards?: TarotCard[];
  history?: HistoryMessage[];
  computed: FortuneComputationResult;
  promptProfile?: SalesPromptProfile;
}): Promise<FortuneGenerationResult> {
  const promptProfile = resolvePromptProfile(input.promptProfile);
  const useSalesPrompt = promptProfile === "sales_v2";
  const variationSeed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const variationProfile = pickVariationProfile();
  const concernAnchor = buildConcernAnchor(input.concern);
  const variationInstruction = buildVariationInstruction(variationProfile, variationSeed, concernAnchor);
  const fallbackBase = useSalesPrompt
    ? buildLoveFortuneSalesFallback({ concern: input.concern, computed: input.computed })
    : buildFallbackFortune(input);
  const fallback = personalizeFallback(fallbackBase, variationProfile, concernAnchor);
  const inputSummary = {
    mode: input.mode,
    depth: input.depth,
    concernLength: input.concern.trim().length,
    historyCount: input.history?.length ?? 0,
    cardsCount: input.cards?.length ?? 0,
    variationSeed,
    promptProfile
  };

  if (!client) {
    console.warn("[openai] OPENAI_API_KEY is empty. Returning fallback response.", inputSummary);
    return {
      text: fallback,
      source: "openai-fallback-no-key",
      promptProfile
    };
  }

  try {
    const systemPromptBase = useSalesPrompt
      ? LOVE_FORTUNE_SALES_SYSTEM_PROMPT
      : buildSystemPrompt({ mode: input.mode, type: input.type, depth: input.depth });
    const systemPrompt = `${systemPromptBase}\n\n${variationInstruction}`;
    const userPromptBase = useSalesPrompt
      ? buildLoveFortuneSalesUserPrompt({
          concern: input.concern,
          cardsInfo: buildSalesCardsInfo(input.cards),
          supplementalInfo: buildSalesSupplementalInfo({
            mode: input.mode,
            depth: input.depth,
            history: input.history,
            computed: input.computed
          })
        })
      : buildUserPrompt({
          type: input.type,
          mode: input.mode,
          concern: input.concern,
          cards: input.cards,
          history: input.history,
          computed: input.computed
        });
    const userPrompt = `${userPromptBase}

${variationInstruction}`;

    if (debugOpenAI) {
      console.log("[openai] request summary", inputSummary);
      console.log("[openai] system prompt preview", systemPrompt.slice(0, 200));
      console.log("[openai] user prompt preview", userPrompt.slice(0, 200));
    }

    const response = await client.responses.create({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_output_tokens: DEPTH_MAX_TOKENS[input.depth],
      temperature: input.depth === "ライト" ? 0.85 : 0.92
    });

    const text = extractResponseText(response);
    if (!text) {
      console.warn("[openai] Empty response text from model. Returning fallback.", inputSummary);
      return {
        text: fallback,
        source: "openai-fallback-empty",
        promptProfile
      };
    }

    const normalized = useSalesPrompt
      ? normalizeLoveFortuneSalesOutput(dedupeConsecutiveLines(text), fallback)
      : normalizeAiFortuneOutput(text, fallback);
    if (normalized === fallback && text !== fallback) {
      console.warn("[openai] Model output was replaced by fallback during normalization.", {
        ...inputSummary,
        modelTextLength: text.length
      });
      return {
        text: normalized,
        source: "openai-fallback-normalized",
        promptProfile
      };
    }

    return {
      text: normalized,
      source: "openai",
      promptProfile
    };
  } catch (error) {
    console.error("[openai] OpenAI generation failed. Returning fallback.", error);
    const errorObject = error as {
      name?: string;
      message?: string;
      status?: number;
      code?: string;
      type?: string;
    };
    const rawMessage =
      typeof errorObject?.message === "string" && errorObject.message.trim().length > 0
        ? errorObject.message.trim()
        : "OpenAI request failed";
    const safeMessage = rawMessage.slice(0, 200);
    return {
      text: fallback,
      source: "openai-fallback-error",
      promptProfile,
      errorDetail: {
        type: errorObject?.type ?? errorObject?.name ?? "OpenAIError",
        message: safeMessage,
        status: typeof errorObject?.status === "number" ? errorObject.status : undefined,
        code: typeof errorObject?.code === "string" ? errorObject.code : undefined
      }
    };
  }
}
