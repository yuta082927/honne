import OpenAI from "openai";
import { DEPTH_MAX_TOKENS, type FortuneMode, type FortuneType, type ResponseDepth } from "@/lib/constants";
import { env } from "@/lib/env";
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

export async function generateFortune(input: {
  type?: FortuneType;
  mode: FortuneMode;
  depth: ResponseDepth;
  concern: string;
  cards?: TarotCard[];
  history?: HistoryMessage[];
  computed: FortuneComputationResult;
}): Promise<string> {
  const fallback = buildFallbackFortune(input);
  const inputSummary = {
    mode: input.mode,
    depth: input.depth,
    concernLength: input.concern.trim().length,
    historyCount: input.history?.length ?? 0,
    cardsCount: input.cards?.length ?? 0
  };

  if (!client) {
    console.warn("[openai] OPENAI_API_KEY is empty. Returning fallback response.", inputSummary);
    return fallback;
  }

  try {
    const systemPrompt = buildSystemPrompt({ mode: input.mode, type: input.type, depth: input.depth });
    const userPrompt = buildUserPrompt({
      type: input.type,
      mode: input.mode,
      concern: input.concern,
      cards: input.cards,
      history: input.history,
      computed: input.computed
    });

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
      temperature: input.depth === "ライト" ? 0.55 : 0.72
    });

    const text = extractResponseText(response);
    if (!text) {
      console.warn("[openai] Empty response text from model. Returning fallback.", inputSummary);
      return fallback;
    }

    const normalized = normalizeAiFortuneOutput(text, fallback);
    if (normalized === fallback && text !== fallback) {
      console.warn("[openai] Model output was replaced by fallback during normalization.", {
        ...inputSummary,
        modelTextLength: text.length
      });
    }

    return normalized;
  } catch (error) {
    console.error("[openai] OpenAI generation failed. Returning fallback.", error);
    return fallback;
  }
}
