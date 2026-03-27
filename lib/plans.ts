export const APP_ROLES = ["guest", "user", "admin"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const APP_PLANS = ["free", "premium"] as const;
export type AppPlan = (typeof APP_PLANS)[number];

export const FREE_DAILY_LIMIT = 3;
export const PREMIUM_DAILY_LIMIT = 20;

export const LIGHT_COST = 1;
export const FREE_DEEP_COST = 3;
export const PREMIUM_DEEP_COST = 1;

export type PlanLimits = {
  role: AppRole;
  plan: AppPlan;
  dailyLimit: number;
  deepCost: number;
  unlimited: boolean;
  label: string;
};

export function isAdminLikeRole(role: AppRole): boolean {
  return role === "admin";
}

export function isUnlimitedRoleOrPlan(role: AppRole, plan: AppPlan, flag?: boolean | null): boolean {
  if (flag === true) return true;
  if (isAdminLikeRole(role)) return true;
  return false;
}

export function normalizeRole(value?: string | null): AppRole {
  if (!value) return "user";
  const role = value.trim().toLowerCase();
  if (APP_ROLES.includes(role as AppRole)) {
    return role as AppRole;
  }
  return "user";
}

export function normalizePlan(value?: string | null): AppPlan {
  if (!value) return "free";
  const plan = value.trim().toLowerCase();
  if (APP_PLANS.includes(plan as AppPlan)) {
    return plan as AppPlan;
  }
  return "free";
}

export function resolvePlanLimits(input: {
  role?: string | null;
  plan?: string | null;
  dailyLimit?: number | null;
  isUnlimited?: boolean | null;
}): PlanLimits {
  const role = normalizeRole(input.role);
  const plan = normalizePlan(input.plan);
  const unlimited = isUnlimitedRoleOrPlan(role, plan, input.isUnlimited);

  const baseDailyLimit =
    typeof input.dailyLimit === "number" && Number.isFinite(input.dailyLimit) && input.dailyLimit > 0
      ? Math.floor(input.dailyLimit)
      : plan === "premium"
        ? PREMIUM_DAILY_LIMIT
        : FREE_DAILY_LIMIT;

  const deepCost = plan === "premium" ? PREMIUM_DEEP_COST : FREE_DEEP_COST;

  if (unlimited) {
    return {
      role,
      plan,
      unlimited: true,
      dailyLimit: Number.MAX_SAFE_INTEGER,
      deepCost: LIGHT_COST,
      label: "運営者モード（無制限）"
    };
  }

  if (plan === "premium") {
    return {
      role,
      plan,
      unlimited: false,
      dailyLimit: baseDailyLimit,
      deepCost,
      label: "プレミアムプラン利用中"
    };
  }

  return {
    role,
    plan: "free",
    unlimited: false,
    dailyLimit: baseDailyLimit,
    deepCost,
    label: "無料プラン"
  };
}

export function getCostByDepth(depth: "ライト" | "ディープ", deepCost: number): number {
  return depth === "ディープ" ? deepCost : LIGHT_COST;
}
