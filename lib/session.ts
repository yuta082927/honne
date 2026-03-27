import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createAnonymousSession, findSessionById } from "@/lib/db";
import type { AnonymousSession } from "@/types/fortune";

function signSessionId(sessionId: string): string {
  return crypto.createHmac("sha256", env.SESSION_COOKIE_SECRET).update(sessionId).digest("hex");
}

function encodeSessionToken(sessionId: string): string {
  return `${sessionId}.${signSessionId(sessionId)}`;
}

function decodeSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [sessionId, signature] = token.split(".");
  if (!sessionId || !signature) return null;

  const expected = signSessionId(sessionId);
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expected);

  if (sigBuffer.length !== expBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expBuffer)) return null;

  return sessionId;
}

function createSessionId(): string {
  return crypto.randomUUID();
}

function createEphemeralSession(freeLimit: number): { session: AnonymousSession; cookieToSet: string } {
  const sessionId = createSessionId();
  const now = new Date().toISOString();

  return {
    session: {
      id: `ephemeral-${sessionId}`,
      session_id: sessionId,
      used_count: 0,
      free_limit: Math.max(1, Math.floor(freeLimit)),
      last_reset_at: now,
      created_at: now,
      updated_at: now
    },
    cookieToSet: encodeSessionToken(sessionId)
  };
}

export async function getOrCreateSession(
  request: NextRequest,
  options?: {
    allowEphemeral?: boolean;
    freeLimit?: number;
  }
): Promise<{
  session: AnonymousSession;
  cookieToSet?: string;
}> {
  const allowEphemeral = options?.allowEphemeral ?? false;
  const fallbackLimit = options?.freeLimit ?? env.FREE_USAGE_LIMIT;

  const cookieValue = request.cookies.get(env.SESSION_COOKIE_NAME)?.value;
  const decodedSessionId = decodeSessionToken(cookieValue);

  if (decodedSessionId) {
    try {
      const existing = await findSessionById(decodedSessionId);
      if (existing?.session_id) {
        return { session: existing };
      }
    } catch (error) {
      if (!allowEphemeral) {
        throw error;
      }
    }
  }

  const sessionId = createSessionId();

  try {
    const session = await createAnonymousSession({
      sessionId,
      freeLimit: fallbackLimit
    });

    if (!session.session_id) {
      throw new Error("Failed to create valid session_id");
    }

    const cookieToSet = encodeSessionToken(session.session_id);

    return { session, cookieToSet };
  } catch (error) {
    if (!allowEphemeral) {
      throw error;
    }

    return createEphemeralSession(fallbackLimit);
  }
}

export function applySessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: env.SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180
  });
}
