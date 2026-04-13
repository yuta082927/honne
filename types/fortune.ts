import type { FortuneMode, ResponseDepth } from "@/lib/constants";

export type AnonymousSession = {
  id: string;
  session_id: string;
  used_count: number;
  free_limit: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
};

export type FortuneLog = {
  id: string;
  session_id: string;
  mode: FortuneMode;
  depth: ResponseDepth;
  category?: string | null;
  subcategory?: string | null;
  user_input: string;
  ai_response: string;
  self_birthday: string | null;
  self_birth_time?: string | null;
  self_birth_place?: string | null;
  partner_birthday: string | null;
  partner_birth_time?: string | null;
  partner_birth_place?: string | null;
  computed_summary: unknown | null;
  input_payload?: Record<string, unknown> | null;
  analysis_payload?: Record<string, unknown> | null;
  user_id: string | null;
  created_at: string;
};

export type FortuneApiResponse = {
  fortuneId: string;
  mode: FortuneMode;
  depth: ResponseDepth;
  response: string;
  usedCount: number;
  freeLimit: number;
  remaining: number;
};

export type UsageResponse = {
  sessionId: string;
  usedCount: number;
  freeLimit: number;
  remaining: number;
  resetAt?: string | null;
  role?: "guest" | "user" | "admin";
  plan?: "free" | "premium";
  unlimited?: boolean;
  deepCost?: number;
  accessLabel?: string;
  error?: string;
};

export type FortuneCreateResponse = {
  fortuneId?: string | null;
  mode: FortuneMode;
  depth: ResponseDepth;
  cost?: number;
  response: string;
  usedCount: number;
  freeLimit: number;
  remaining: number;
  isLoggedIn?: boolean;
  role?: "guest" | "user" | "admin";
  plan?: "free" | "premium";
  unlimited?: boolean;
  deepCost?: number;
  accessLabel?: string;
  computedSummary?: {
    selfAnimal: string | null;
    selfZodiac: string | null;
    compatibilityScore: number | null;
  };
  debug?: {
    requestId: string;
    source:
      | "openai"
      | "openai-fallback-no-key"
      | "openai-fallback-empty"
      | "openai-fallback-normalized"
      | "openai-fallback-error"
      | "bypass";
    marker: string;
    openaiError?: {
      type: string;
      message: string;
      status?: number;
      code?: string;
    };
    promptProfile?: "default" | "sales_v2";
  };
  error?: string;
  code?: string;
};
