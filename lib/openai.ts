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

  if (!client) {
    return fallback;
  }

  try {
    const response = await client.responses.create({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: (() => {
            const systemPrompt = buildSystemPrompt({ mode: input.mode, type: input.type, depth: input.depth });
            console.log('=== SYSTEM PROMPT START ===');
            console.log(systemPrompt.slice(0, 300));
            console.log('=== SYSTEM PROMPT END ===');
            return systemPrompt;
          })()
        },
        {
          role: "user",
          content: buildUserPrompt({
            type: input.type,
            mode: input.mode,
            concern: input.concern,
            cards: input.cards,
            history: input.history,
            computed: input.computed
          })
        }
      ],
      max_output_tokens: DEPTH_MAX_TOKENS[input.depth],
      temperature: input.depth === "ライト" ? 0.55 : 0.72
    });

    const text = response.output_text?.trim();
    if (!text) {
      return fallback;
    }

    return normalizeAiFortuneOutput(text, fallback);
  } catch (error) {
    console.error("OpenAI generation failed", error);
    return fallback;
  }
}
