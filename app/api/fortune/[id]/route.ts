import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserAccess } from "@/lib/access";
import { requireAuthenticatedUser } from "@/lib/api-guards";
import { findFortuneById, refreshSessionUsage, syncSessionFreeLimit } from "@/lib/db";
import { getUsageStatus } from "@/lib/quota";
import { applySessionCookie, getOrCreateSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type StoredComputed = {
  self?: {
    animal?: { name?: string };
    zodiac?: { sign?: string };
  };
  compatibility?: {
    totalScore?: number;
  };
};

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const auth = await requireAuthenticatedUser(request);
    if ("response" in auth) {
      return auth.response;
    }

    const { id } = await context.params;
    const access = await getCurrentUserAccess(request);

    const { session, cookieToSet } = await getOrCreateSession(request, {
      allowEphemeral: access.isUnlimited,
      freeLimit: access.dailyLimit
    });

    if (!session.session_id) {
      const invalid = NextResponse.json({ error: "Invalid session_id." }, { status: 500 });
      if (cookieToSet) applySessionCookie(invalid, cookieToSet);
      return invalid;
    }

    const log = await findFortuneById(id, session.session_id);

    if (!log) {
      const notFound = NextResponse.json({ error: "Fortune not found." }, { status: 404 });
      if (cookieToSet) applySessionCookie(notFound, cookieToSet);
      return notFound;
    }

    let latestSession = session;

    if (!access.isUnlimited) {
      try {
        await syncSessionFreeLimit(session.session_id, access.dailyLimit);
      } catch (syncError) {
        console.error("GET /api/fortune/[id] sync free_limit failed", syncError);
      }

      try {
        latestSession = (await refreshSessionUsage(session.session_id)) ?? session;
      } catch (refreshError) {
        console.error("GET /api/fortune/[id] refresh failed", refreshError);
      }
    }

    const usage = getUsageStatus(access, latestSession);
    const computed = (log.computed_summary ?? null) as StoredComputed | null;

    const response = NextResponse.json(
      {
        id: log.id,
        mode: log.mode,
        depth: log.depth,
        concern: log.user_input,
        response: log.ai_response,
        createdAt: log.created_at,
        usedCount: usage.usedCount,
        freeLimit: usage.freeLimit,
        remaining: usage.remaining,
        unlimited: usage.unlimited,
        role: usage.role,
        plan: usage.plan,
        accessLabel: usage.accessLabel,
        deepCost: usage.deepCost,
        selfBirthday: log.self_birthday,
        selfBirthTime: log.self_birth_time ?? null,
        selfBirthPlace: log.self_birth_place ?? null,
        partnerBirthday: log.partner_birthday,
        partnerBirthTime: log.partner_birth_time ?? null,
        partnerBirthPlace: log.partner_birth_place ?? null,
        computed,
        computedSummary: computed
          ? {
              selfAnimal: computed.self?.animal?.name ?? null,
              selfZodiac: computed.self?.zodiac?.sign ?? null,
              compatibilityScore: computed.compatibility?.totalScore ?? null
            }
          : null
      },
      { status: 200 }
    );

    if (cookieToSet) {
      applySessionCookie(response, cookieToSet);
    }

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("GET /api/fortune/[id] failed", error);
    return NextResponse.json({ error: "Failed to load fortune." }, { status: 500 });
  }
}
