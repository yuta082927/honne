import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserAccess } from "@/lib/access";
import { requireAuthenticatedUser } from "@/lib/api-guards";
import { computeFortuneData } from "@/lib/fortune-logic";
import { logFortune, refreshSessionUsage, syncSessionFreeLimit } from "@/lib/db";
import { generateFortune } from "@/lib/openai";
import { getCostByDepth } from "@/lib/plans";
import { canConsumeFreeQuota, consumeQuotaSafely, getUsageStatus } from "@/lib/quota";
import { applySessionCookie, getOrCreateSession } from "@/lib/session";
import { fortuneRequestSchema } from "@/lib/validation/fortune";

const debugOpenAI = process.env.OPENAI_DEBUG === "1";

function summarizeIncomingPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return { kind: typeof payload };
  }

  const record = payload as Record<string, unknown>;
  const concern = typeof record.concern === "string" ? record.concern : "";
  const history = Array.isArray(record.history) ? record.history : [];
  const cards = Array.isArray(record.cards) ? record.cards : [];

  return {
    keys: Object.keys(record),
    mode: typeof record.mode === "string" ? record.mode : null,
    depth: typeof record.depth === "string" ? record.depth : null,
    concernLength: concern.length,
    concernPreview: concern.slice(0, 20),
    historyCount: history.length,
    cardsCount: cards.length,
    hasSelfBirthDate: typeof record.selfBirthDate === "string" && record.selfBirthDate.length > 0,
    hasPartnerBirthDate: typeof record.partnerBirthDate === "string" && record.partnerBirthDate.length > 0
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const debugRequestId =
      request.headers.get("x-debug-request-id") ??
      `srv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const auth = await requireAuthenticatedUser(request);
    if ("response" in auth) {
      return auth.response;
    }

    const json = await request.json();
    if (debugOpenAI) {
      console.log("[POST /api/fortune] raw payload", {
        debugRequestId,
        ...summarizeIncomingPayload(json)
      });
    }

    const parsed = fortuneRequestSchema.safeParse(json);

    if (!parsed.success) {
      if (debugOpenAI) {
        console.warn("[POST /api/fortune] payload validation failed", {
          debugRequestId,
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          })),
          ...summarizeIncomingPayload(json)
        });
      }

      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request payload." },
        { status: 400 }
      );
    }

    const {
      type,
      mode,
      depth,
      concern,
      history,
      selfBirthDate,
      selfBirthTime,
      selfBirthPlace,
      partnerBirthDate,
      partnerBirthTime,
      partnerBirthPlace,
      gender,
      cards
    } = parsed.data;

    if (debugOpenAI) {
      console.log("[POST /api/fortune] payload summary", {
        debugRequestId,
        mode,
        depth,
        concernLength: concern.length,
        concernPreview: concern.slice(0, 20),
        historyCount: history?.length ?? 0,
        cardsCount: cards?.length ?? 0,
        hasSelfBirthDate: Boolean(selfBirthDate),
        hasPartnerBirthDate: Boolean(partnerBirthDate)
      });
    }

    const access = await getCurrentUserAccess(request);
    const cost = getCostByDepth(depth, access.deepCost);

    const { session, cookieToSet } = await getOrCreateSession(request, {
      allowEphemeral: access.isUnlimited,
      freeLimit: access.dailyLimit
    });

    if (!session.session_id) {
      return NextResponse.json({ error: "Failed to issue session_id." }, { status: 500 });
    }

    let latestSession = session;

    if (!access.isUnlimited) {
      try {
        await syncSessionFreeLimit(session.session_id, access.dailyLimit);
      } catch (syncError) {
        console.error("POST /api/fortune sync free_limit failed", syncError);
      }

      try {
        latestSession = (await refreshSessionUsage(session.session_id)) ?? session;
      } catch (refreshError) {
        console.error("POST /api/fortune refresh failed", refreshError);
        latestSession = session;
      }
    }

    const usageBefore = getUsageStatus(access, latestSession);

    if (!canConsumeFreeQuota(usageBefore, cost)) {
      const limited = NextResponse.json(
        { code: "FREE_LIMIT_REACHED", error: "Free quota reached." },
        { status: 429 }
      );
      if (cookieToSet) applySessionCookie(limited, cookieToSet);
      return limited;
    }

    // クォータをAI呼び出し前にアトミック消費する。
    // 消費後にAIが失敗した場合も回数は消費されるが、
    // 並行リクエストによる二重消費と無駄なAI呼び出しを防ぐ。
    let updatedSession = latestSession;

    if (!access.isUnlimited) {
      const consumed = await consumeQuotaSafely({
        sessionId: session.session_id,
        access,
        depth,
        fallbackStatus: usageBefore
      });

      if (!consumed.updatedSession) {
        const limited = NextResponse.json(
          { code: "FREE_LIMIT_REACHED", error: "Free quota reached." },
          { status: 429 }
        );
        if (cookieToSet) applySessionCookie(limited, cookieToSet);
        return limited;
      }

      updatedSession = consumed.updatedSession;
    }

    const computed = computeFortuneData({
      mode,
      depth,
      profile: {
        selfBirthDate,
        selfBirthTime,
        selfBirthPlace,
        partnerBirthDate,
        partnerBirthTime,
        partnerBirthPlace,
        gender
      },
      concern,
      history
    });

    const aiResponse = await generateFortune({
      type,
      mode,
      depth,
      concern,
      cards,
      history,
      computed
    });

    let fortuneId: string | null = null;

    try {
      const log = await logFortune({
        sessionId: session.session_id,
        mode,
        depth,
        userInput: concern,
        aiResponse,
        selfBirthday: selfBirthDate,
        selfBirthTime,
        selfBirthPlace,
        partnerBirthday: partnerBirthDate,
        partnerBirthTime,
        partnerBirthPlace,
        computedSummary: computed,
        inputPayload: {
          concern,
          mode,
          depth,
          history,
          selfBirthDate,
          selfBirthTime,
          selfBirthPlace,
          partnerBirthDate,
          partnerBirthTime,
          partnerBirthPlace,
          gender,
          cards
        },
        analysisPayload: computed,
        userId: access.userId
      });
      fortuneId = log.id;
    } catch (logError) {
      console.error("logFortune failed", logError);
    }

    const usageAfter = getUsageStatus(access, updatedSession);

    const response = NextResponse.json(
      {
        fortuneId,
        mode,
        depth,
        cost,
        response: aiResponse,
        usedCount: usageAfter.usedCount,
        freeLimit: usageAfter.freeLimit,
        remaining: usageAfter.remaining,
        isLoggedIn: Boolean(access.userId),
        role: usageAfter.role,
        plan: usageAfter.plan,
        unlimited: usageAfter.unlimited,
        deepCost: usageAfter.deepCost,
        accessLabel: usageAfter.accessLabel,
        computedSummary: {
          selfAnimal: computed.self.animal?.name ?? null,
          selfZodiac: computed.self.zodiac?.sign ?? null,
          compatibilityScore: computed.compatibility?.totalScore ?? null
        },
        computed
      },
      { status: 200 }
    );

    if (cookieToSet) {
      applySessionCookie(response, cookieToSet);
    }

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("POST /api/fortune failed", error);
    return NextResponse.json(
      {
        error: "Failed to generate fortune. Please try again later."
      },
      { status: 500 }
    );
  }
}
