import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserAccess } from "@/lib/access";
import { requireAuthenticatedUser } from "@/lib/api-guards";
import { refreshSessionUsage, syncSessionFreeLimit } from "@/lib/db";
import { getUsageStatus } from "@/lib/quota";
import { applySessionCookie, getOrCreateSession } from "@/lib/session";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuthenticatedUser(request);
    if ("response" in auth) {
      return auth.response;
    }

    const access = await getCurrentUserAccess(request);
    const { session, cookieToSet } = await getOrCreateSession(request, {
      allowEphemeral: access.isUnlimited,
      freeLimit: access.dailyLimit
    });

    if (!session.session_id) {
      const invalid = NextResponse.json({ error: "Failed to issue session_id." }, { status: 500 });
      if (cookieToSet) applySessionCookie(invalid, cookieToSet);
      return invalid;
    }

    let latest = session;

    if (!access.isUnlimited) {
      try {
        await syncSessionFreeLimit(session.session_id, access.dailyLimit);
      } catch (syncError) {
        console.error("GET /api/usage sync free_limit failed", syncError);
      }

      try {
        latest = (await refreshSessionUsage(session.session_id)) ?? session;
      } catch (refreshError) {
        console.error("GET /api/usage refresh failed", refreshError);
        latest = session;
      }
    }

    const usage = getUsageStatus(access, latest);

    const response = NextResponse.json(
      {
        sessionId: latest.session_id ?? session.session_id,
        usedCount: usage.usedCount,
        freeLimit: usage.freeLimit,
        remaining: usage.remaining,
        resetAt: usage.resetAt,
        role: usage.role,
        plan: usage.plan,
        unlimited: usage.unlimited,
        deepCost: usage.deepCost,
        accessLabel: usage.accessLabel
      },
      { status: 200 }
    );

    if (cookieToSet) {
      applySessionCookie(response, cookieToSet);
    }

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("GET /api/usage failed", error);
    return NextResponse.json({ error: "Failed to fetch usage." }, { status: 500 });
  }
}
