import { supabaseAdmin } from "@/lib/supabase";
import type { FortuneMode, ResponseDepth } from "@/lib/constants";
import type { FortuneComputationResult } from "@/lib/fortune/types";
import type { AnonymousSession, FortuneLog } from "@/types/fortune";

const USAGE_TABLE_CANDIDATES = ["usage_logs", "anonymous_sessions"] as const;
type UsageTableName = (typeof USAGE_TABLE_CANDIDATES)[number];

let preferredUsageTable: UsageTableName | null = null;

function isMissingTableOrColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "42P01" || code === "42703";
}

function usageTableOrder(): UsageTableName[] {
  if (!preferredUsageTable) {
    return [...USAGE_TABLE_CANDIDATES];
  }

  return [preferredUsageTable, ...USAGE_TABLE_CANDIDATES.filter((table) => table !== preferredUsageTable)];
}

function rememberUsageTable(table: UsageTableName): void {
  preferredUsageTable = table;
}

function getJstDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function isSameJstDate(a: string | Date | null | undefined, b: Date): boolean {
  if (!a) return false;
  return getJstDateKey(a) === getJstDateKey(b);
}

function normalizeSessionRow(row: Record<string, unknown> | null): AnonymousSession | null {
  if (!row) return null;

  const sessionId = typeof row.session_id === "string" ? row.session_id : "";
  if (!sessionId) return null;

  const id = typeof row.id === "string" ? row.id : sessionId;
  const used = typeof row.used_count === "number" && Number.isFinite(row.used_count) ? Math.max(0, Math.floor(row.used_count)) : 0;
  const limit =
    typeof row.free_limit === "number" && Number.isFinite(row.free_limit) && row.free_limit > 0
      ? Math.floor(row.free_limit)
      : 3;

  const now = new Date().toISOString();

  return {
    id,
    session_id: sessionId,
    used_count: used,
    free_limit: limit,
    last_reset_at: typeof row.last_reset_at === "string" ? row.last_reset_at : now,
    created_at: typeof row.created_at === "string" ? row.created_at : now,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : now
  };
}

async function findSessionByIdOnTable(table: UsageTableName, sessionId: string): Promise<{ data: AnonymousSession | null; error: unknown | null }> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle<Record<string, unknown>>();

  if (error) {
    return { data: null, error };
  }

  return { data: normalizeSessionRow(data), error: null };
}

export async function findSessionById(sessionId: string): Promise<AnonymousSession | null> {
  let fallbackError: unknown = null;

  for (const table of usageTableOrder()) {
    const result = await findSessionByIdOnTable(table, sessionId);

    if (!result.error) {
      rememberUsageTable(table);
      if (result.data) {
        return result.data;
      }
      continue;
    }

    if (isMissingTableOrColumnError(result.error)) {
      fallbackError = result.error;
      continue;
    }

    throw result.error;
  }

  if (fallbackError) {
    throw fallbackError;
  }

  return null;
}

async function createAnonymousSessionOnTable(
  table: UsageTableName,
  input: { sessionId: string; freeLimit: number }
): Promise<{ data: AnonymousSession | null; error: unknown | null }> {
  const basePayload = {
    session_id: input.sessionId,
    free_limit: input.freeLimit,
    used_count: 0,
    last_reset_at: new Date().toISOString()
  };

  const firstTry = await supabaseAdmin.from(table).insert(basePayload).select("*").maybeSingle<Record<string, unknown>>();

  if (!firstTry.error) {
    return { data: normalizeSessionRow(firstTry.data), error: null };
  }

  if (isMissingTableOrColumnError(firstTry.error)) {
    const fallbackPayload = {
      session_id: input.sessionId,
      free_limit: input.freeLimit,
      used_count: 0
    };

    const secondTry = await supabaseAdmin.from(table).insert(fallbackPayload).select("*").maybeSingle<Record<string, unknown>>();

    if (!secondTry.error) {
      return { data: normalizeSessionRow(secondTry.data), error: null };
    }

    return { data: null, error: secondTry.error };
  }

  return { data: null, error: firstTry.error };
}

export async function createAnonymousSession(input: {
  sessionId: string;
  freeLimit: number;
}): Promise<AnonymousSession> {
  let fallbackError: unknown = null;

  for (const table of usageTableOrder()) {
    const result = await createAnonymousSessionOnTable(table, input);

    if (!result.error && result.data) {
      rememberUsageTable(table);
      return result.data;
    }

    if (result.error && isMissingTableOrColumnError(result.error)) {
      fallbackError = result.error;
      continue;
    }

    if (result.error) {
      throw result.error;
    }
  }

  throw fallbackError ?? new Error("Failed to create session");
}

export async function syncSessionFreeLimit(sessionId: string, freeLimit: number): Promise<void> {
  if (!sessionId || !Number.isFinite(freeLimit) || freeLimit <= 0) {
    return;
  }

  const normalizedLimit = Math.floor(freeLimit);
  let fallbackError: unknown = null;

  for (const table of usageTableOrder()) {
    const update = await supabaseAdmin
      .from(table)
      .update({ free_limit: normalizedLimit, updated_at: new Date().toISOString() })
      .eq("session_id", sessionId)
      .neq("free_limit", normalizedLimit);

    if (!update.error) {
      rememberUsageTable(table);
      return;
    }

    if (isMissingTableOrColumnError(update.error)) {
      const fallbackUpdate = await supabaseAdmin
        .from(table)
        .update({ free_limit: normalizedLimit })
        .eq("session_id", sessionId)
        .neq("free_limit", normalizedLimit);

      if (!fallbackUpdate.error) {
        rememberUsageTable(table);
        return;
      }

      if (isMissingTableOrColumnError(fallbackUpdate.error)) {
        fallbackError = fallbackUpdate.error;
        continue;
      }

      throw fallbackUpdate.error;
    }

    throw update.error;
  }

  if (fallbackError) {
    throw fallbackError;
  }
}

async function manualRefreshSessionUsage(sessionId: string): Promise<AnonymousSession | null> {
  const current = await findSessionById(sessionId);
  if (!current) return null;

  const now = new Date();
  if (isSameJstDate(current.last_reset_at, now)) {
    return current;
  }

  for (const table of usageTableOrder()) {
    const updateWithReset = await supabaseAdmin
      .from(table)
      .update({
        used_count: 0,
        last_reset_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq("session_id", sessionId)
      .select("*")
      .maybeSingle<Record<string, unknown>>();

    if (!updateWithReset.error) {
      const normalized = normalizeSessionRow(updateWithReset.data);
      if (normalized) {
        rememberUsageTable(table);
        return normalized;
      }
      continue;
    }

    if (isMissingTableOrColumnError(updateWithReset.error)) {
      const fallbackUpdate = await supabaseAdmin
        .from(table)
        .update({
          used_count: 0,
          updated_at: now.toISOString()
        })
        .eq("session_id", sessionId)
        .select("*")
        .maybeSingle<Record<string, unknown>>();

      if (!fallbackUpdate.error) {
        const normalized = normalizeSessionRow(fallbackUpdate.data) ?? current;
        rememberUsageTable(table);
        return normalized;
      }

      if (isMissingTableOrColumnError(fallbackUpdate.error)) {
        continue;
      }

      throw fallbackUpdate.error;
    }

    throw updateWithReset.error;
  }

  return current;
}

export async function refreshSessionUsage(sessionId: string): Promise<AnonymousSession | null> {
  try {
    const viaRpc = await supabaseAdmin
      .rpc("refresh_daily_usage", { p_session_id: sessionId })
      .maybeSingle<Record<string, unknown>>();

    if (!viaRpc.error) {
      const normalized = normalizeSessionRow(viaRpc.data);
      if (normalized) {
        return normalized;
      }
    } else {
      console.error("refresh_daily_usage RPC failed, fallback to manual", viaRpc.error);
    }
  } catch (error) {
    console.error("refresh_daily_usage RPC threw, fallback to manual", error);
  }

  return manualRefreshSessionUsage(sessionId);
}

async function consumeByUpdate(sessionId: string, cost: number): Promise<AnonymousSession | null> {
  const retries = 3;

  for (let i = 0; i < retries; i += 1) {
    const current = await findSessionById(sessionId);
    if (!current) return null;

    if (current.used_count + cost > current.free_limit) {
      return null;
    }

    for (const table of usageTableOrder()) {
      const update = await supabaseAdmin
        .from(table)
        .update({
          used_count: current.used_count + cost,
          updated_at: new Date().toISOString()
        })
        .eq("session_id", sessionId)
        .eq("used_count", current.used_count)
        .select("*")
        .maybeSingle<Record<string, unknown>>();

      if (!update.error) {
        const normalized = normalizeSessionRow(update.data);
        if (normalized) {
          rememberUsageTable(table);
          return normalized;
        }
        continue;
      }

      if (isMissingTableOrColumnError(update.error)) {
        const fallbackUpdate = await supabaseAdmin
          .from(table)
          .update({ used_count: current.used_count + cost })
          .eq("session_id", sessionId)
          .eq("used_count", current.used_count)
          .select("*")
          .maybeSingle<Record<string, unknown>>();

        if (!fallbackUpdate.error) {
          const normalized = normalizeSessionRow(fallbackUpdate.data);
          if (normalized) {
            rememberUsageTable(table);
            return normalized;
          }
          continue;
        }

        if (isMissingTableOrColumnError(fallbackUpdate.error)) {
          continue;
        }

        throw fallbackUpdate.error;
      }

      throw update.error;
    }
  }

  return null;
}

export async function consumeSessionQuota(sessionId: string, cost: number): Promise<AnonymousSession | null> {
  const normalizedCost = Math.max(0, Math.floor(cost));
  if (normalizedCost <= 0) {
    return findSessionById(sessionId);
  }

  try {
    const viaRpc = await supabaseAdmin
      .rpc("consume_free_quota", { p_session_id: sessionId, p_cost: normalizedCost })
      .maybeSingle<Record<string, unknown>>();

    if (!viaRpc.error) {
      return normalizeSessionRow(viaRpc.data);
    }

    console.error("consume_free_quota RPC failed, fallback to manual", viaRpc.error);
  } catch (error) {
    console.error("consume_free_quota RPC threw, fallback to manual", error);
  }

  return consumeByUpdate(sessionId, normalizedCost);
}

export async function logFortune(input: {
  sessionId: string;
  mode: FortuneMode;
  depth: ResponseDepth;
  userInput: string;
  aiResponse: string;
  selfBirthday?: string;
  selfBirthTime?: string;
  selfBirthPlace?: string;
  partnerBirthday?: string;
  partnerBirthTime?: string;
  partnerBirthPlace?: string;
  computedSummary?: FortuneComputationResult;
  inputPayload?: Record<string, unknown>;
  analysisPayload?: Record<string, unknown>;
  userId?: string | null;
}): Promise<FortuneLog> {
  const richInsert = await supabaseAdmin
    .from("fortune_logs")
    .insert({
      session_id: input.sessionId,
      user_id: input.userId ?? null,
      mode: input.mode,
      depth: input.depth,
      category: input.mode,
      subcategory: input.depth,
      user_input: input.userInput,
      ai_response: input.aiResponse,
      self_birthday: input.selfBirthday ?? null,
      self_birth_time: input.selfBirthTime ?? null,
      self_birth_place: input.selfBirthPlace ?? null,
      partner_birthday: input.partnerBirthday ?? null,
      partner_birth_time: input.partnerBirthTime ?? null,
      partner_birth_place: input.partnerBirthPlace ?? null,
      computed_summary: input.computedSummary ?? null,
      input_payload: input.inputPayload ?? null,
      analysis_payload: input.analysisPayload ?? null
    })
    .select("*")
    .single<FortuneLog>();

  if (!richInsert.error && richInsert.data) {
    return richInsert.data;
  }

  if (richInsert.error && !isMissingTableOrColumnError(richInsert.error)) {
    throw richInsert.error;
  }

  const legacyInsert = await supabaseAdmin
    .from("fortune_logs")
    .insert({
      session_id: input.sessionId,
      mode: input.mode,
      depth: input.depth,
      user_input: input.userInput,
      ai_response: input.aiResponse,
      self_birthday: input.selfBirthday ?? null,
      partner_birthday: input.partnerBirthday ?? null,
      computed_summary: input.computedSummary ?? null,
      user_id: input.userId ?? null
    })
    .select("*")
    .single<FortuneLog>();

  if (legacyInsert.error || !legacyInsert.data) {
    throw legacyInsert.error ?? new Error("Failed to log fortune");
  }

  return legacyInsert.data;
}

export async function findFortuneById(id: string, sessionId: string): Promise<FortuneLog | null> {
  const { data, error } = await supabaseAdmin
    .from("fortune_logs")
    .select("*")
    .eq("id", id)
    .eq("session_id", sessionId)
    .maybeSingle<FortuneLog>();

  if (error) throw error;
  return data;
}

export async function listFortunesByUser(userId: string): Promise<FortuneLog[]> {
  const { data, error } = await supabaseAdmin
    .from("fortune_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as FortuneLog[];
}

export async function linkAnonymousDataToUser(params: {
  userId: string;
  sessionId: string;
}): Promise<{ linkedLogs: number; linkedUsage: number }> {
  const { data: logRows, error: logError } = await supabaseAdmin
    .from("fortune_logs")
    .update({ user_id: params.userId })
    .eq("session_id", params.sessionId)
    .is("user_id", null)
    .select("id");

  if (logError) throw logError;

  let linkedUsage = 0;

  for (const table of usageTableOrder()) {
    const usageUpdate = await supabaseAdmin
      .from(table)
      .update({ user_id: params.userId, updated_at: new Date().toISOString() })
      .eq("session_id", params.sessionId)
      .is("user_id", null)
      .select("id");

    if (!usageUpdate.error) {
      rememberUsageTable(table);
      linkedUsage = usageUpdate.data?.length ?? 0;
      break;
    }

    if (isMissingTableOrColumnError(usageUpdate.error)) {
      const fallbackUpdate = await supabaseAdmin
        .from(table)
        .update({ user_id: params.userId })
        .eq("session_id", params.sessionId)
        .is("user_id", null)
        .select("id");

      if (!fallbackUpdate.error) {
        rememberUsageTable(table);
        linkedUsage = fallbackUpdate.data?.length ?? 0;
        break;
      }

      if (isMissingTableOrColumnError(fallbackUpdate.error)) {
        continue;
      }

      throw fallbackUpdate.error;
    }

    throw usageUpdate.error;
  }

  return {
    linkedLogs: logRows?.length ?? 0,
    linkedUsage
  };
}

