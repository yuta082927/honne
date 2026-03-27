import { supabaseAdmin } from "@/lib/supabase";

export const DB_USER_ROLES = ["user", "admin"] as const;
export type DbUserRole = (typeof DB_USER_ROLES)[number];

export const DB_USER_PLANS = ["free", "premium"] as const;
export type DbUserPlan = (typeof DB_USER_PLANS)[number];

export type DbUserRecord = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: DbUserRole;
  plan: DbUserPlan;
  daily_limit: number | null;
  deep_daily_limit: number | null;
  is_unlimited: boolean | null;
  created_at: string;
  updated_at: string;
};

function isMissingTableOrColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "42P01" || code === "42703";
}

function normalizeRole(value: unknown): DbUserRole {
  return value === "admin" ? "admin" : "user";
}

function normalizePlan(value: unknown): DbUserPlan {
  return value === "premium" ? "premium" : "free";
}

function mapDbUserRecord(data: Record<string, unknown>): DbUserRecord {
  return {
    id: String(data.id ?? ""),
    email: typeof data.email === "string" ? data.email : null,
    display_name: typeof data.display_name === "string" ? data.display_name : null,
    role: normalizeRole(data.role),
    plan: normalizePlan(data.plan),
    daily_limit: typeof data.daily_limit === "number" ? data.daily_limit : null,
    deep_daily_limit: typeof data.deep_daily_limit === "number" ? data.deep_daily_limit : null,
    is_unlimited: typeof data.is_unlimited === "boolean" ? data.is_unlimited : null,
    created_at: typeof data.created_at === "string" ? data.created_at : new Date(0).toISOString(),
    updated_at: typeof data.updated_at === "string" ? data.updated_at : new Date(0).toISOString()
  };
}

export async function getDbUserById(userId: string): Promise<DbUserRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Record<string, unknown>>();

  if (error) {
    if (isMissingTableOrColumnError(error)) {
      return null;
    }
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapDbUserRecord(data);
}

export async function ensureDbUser(input: { id: string; email?: string | null }): Promise<DbUserRecord | null> {
  const payload = {
    id: input.id,
    email: input.email ?? null,
    role: "user",
    plan: "free",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single<Record<string, unknown>>();

  if (error) {
    if (isMissingTableOrColumnError(error)) {
      return null;
    }
    throw error;
  }

  return mapDbUserRecord(data);
}

export async function upsertDbUserProfile(input: {
  id: string;
  email?: string | null;
  displayName?: string | null;
}): Promise<DbUserRecord | null> {
  const payload = {
    id: input.id,
    email: input.email ?? null,
    display_name: input.displayName ?? null,
    role: "user",
    plan: "free",
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single<Record<string, unknown>>();

  if (error) {
    if (isMissingTableOrColumnError(error)) {
      return null;
    }
    throw error;
  }

  return mapDbUserRecord(data);
}

export async function getCurrentUserRole(userId: string): Promise<DbUserRole> {
  const dbUser = await getDbUserById(userId);
  return dbUser?.role ?? "user";
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const role = await getCurrentUserRole(userId);
  return role === "admin";
}
