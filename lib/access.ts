import { NextRequest } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { ensureDbUser, getDbUserById } from "@/lib/users";
import { resolvePlanLimits, type AppPlan, type AppRole } from "@/lib/plans";

export type UserAccess = {
  userId: string | null;
  email: string | null;
  role: AppRole;
  plan: AppPlan;
  dailyLimit: number;
  deepCost: number;
  isUnlimited: boolean;
  accessLabel: string;
};

export function isAdminLikeUser(access: UserAccess): boolean {
  return access.role === "admin";
}

export function isUnlimitedUser(access: UserAccess): boolean {
  return access.isUnlimited;
}

export function getAccessPolicy(access: UserAccess): {
  role: AppRole;
  plan: AppPlan;
  unlimited: boolean;
  dailyLimit: number;
  deepCost: number;
} {
  return {
    role: access.role,
    plan: access.plan,
    unlimited: access.isUnlimited,
    dailyLimit: access.dailyLimit,
    deepCost: access.deepCost
  };
}

export async function getCurrentUserAccess(request: NextRequest): Promise<UserAccess> {
  const authUser = await getAuthUserFromRequest(request);

  if (!authUser) {
    const guestResolved = resolvePlanLimits({ role: "guest", plan: "free" });
    return {
      userId: null,
      email: null,
      role: "guest",
      plan: "free",
      dailyLimit: guestResolved.dailyLimit,
      deepCost: guestResolved.deepCost,
      isUnlimited: guestResolved.unlimited,
      accessLabel: "ゲスト利用"
    };
  }

  try {
    await ensureDbUser({ id: authUser.id, email: authUser.email });
  } catch (error) {
    console.error("ensureDbUser failed", error);
  }

  let dbUser: Awaited<ReturnType<typeof getDbUserById>> | null = null;
  try {
    dbUser = await getDbUserById(authUser.id);
  } catch (error) {
    console.error("getDbUserById failed", error);
    dbUser = null;
  }

  const resolved = resolvePlanLimits({
    role: dbUser?.role ?? "user",
    plan: dbUser?.plan ?? "free",
    dailyLimit: dbUser?.daily_limit,
    isUnlimited: dbUser?.is_unlimited
  });

  return {
    userId: authUser.id,
    email: authUser.email,
    role: resolved.role,
    plan: resolved.plan,
    dailyLimit: resolved.dailyLimit,
    deepCost: resolved.deepCost,
    isUnlimited: resolved.unlimited,
    accessLabel: resolved.label
  };
}
