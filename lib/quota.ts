import type { ResponseDepth } from "@/lib/constants";
import type { UserAccess } from "@/lib/access";
import { consumeSessionQuota } from "@/lib/db";
import { getCostByDepth } from "@/lib/plans";
import type { AnonymousSession } from "@/types/fortune";

export type UsageStatus = {
  usedCount: number;
  freeLimit: number;
  remaining: number;
  resetAt: string | null;
  unlimited: boolean;
  role: UserAccess["role"];
  plan: UserAccess["plan"];
  deepCost: number;
  accessLabel: string;
};

function safeInt(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  return Math.floor(fallback);
}

export function getUserPlanLimits(access: UserAccess): { dailyLimit: number; deepCost: number; unlimited: boolean } {
  return {
    dailyLimit: access.dailyLimit,
    deepCost: access.deepCost,
    unlimited: access.isUnlimited
  };
}

export function getUsageStatus(access: UserAccess, session: AnonymousSession): UsageStatus {
  const planLimits = getUserPlanLimits(access);
  const usedCount = Math.max(0, safeInt(session.used_count, 0));

  if (planLimits.unlimited) {
    return {
      usedCount,
      freeLimit: Number.MAX_SAFE_INTEGER,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt: session.last_reset_at ?? null,
      unlimited: true,
      role: access.role,
      plan: access.plan,
      deepCost: planLimits.deepCost,
      accessLabel: access.accessLabel
    };
  }

  const freeLimit = Math.max(1, safeInt(session.free_limit, planLimits.dailyLimit));
  const remaining = Math.max(0, freeLimit - usedCount);

  return {
    usedCount,
    freeLimit,
    remaining,
    resetAt: session.last_reset_at ?? null,
    unlimited: false,
    role: access.role,
    plan: access.plan,
    deepCost: planLimits.deepCost,
    accessLabel: access.accessLabel
  };
}

export function canConsumeFreeQuota(status: UsageStatus, cost: number): boolean {
  if (status.unlimited) {
    return true;
  }

  return status.usedCount + Math.max(0, Math.floor(cost)) <= status.freeLimit;
}

export function canUseLightFortune(status: UsageStatus): boolean {
  return canConsumeFreeQuota(status, 1);
}

export function canUseDeepFortune(status: UsageStatus): boolean {
  return canConsumeFreeQuota(status, status.deepCost);
}

export async function consumeQuotaIfNeeded(params: {
  sessionId: string;
  access: UserAccess;
  cost: number;
  fallbackStatus: UsageStatus;
}): Promise<{ updatedSession: AnonymousSession | null; skipped: boolean }> {
  if (params.access.isUnlimited) {
    return { updatedSession: null, skipped: true };
  }

  if (!canConsumeFreeQuota(params.fallbackStatus, params.cost)) {
    return { updatedSession: null, skipped: false };
  }

  const updatedSession = await consumeSessionQuota(params.sessionId, params.cost);
  return { updatedSession, skipped: false };
}

export async function consumeQuotaSafely(params: {
  sessionId: string;
  access: UserAccess;
  depth: ResponseDepth;
  fallbackStatus: UsageStatus;
}): Promise<{ updatedSession: AnonymousSession | null; cost: number; skipped: boolean }> {
  const cost = getCostByDepth(params.depth, params.access.deepCost);
  const consumed = await consumeQuotaIfNeeded({
    sessionId: params.sessionId,
    access: params.access,
    cost,
    fallbackStatus: params.fallbackStatus
  });

  return {
    updatedSession: consumed.updatedSession,
    cost,
    skipped: consumed.skipped
  };
}
