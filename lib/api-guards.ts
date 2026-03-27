import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserAccess } from "@/lib/access";
import { type AuthUser, resolveAuthFromRequest } from "@/lib/auth-server";

type GuardError = {
  response: NextResponse;
};

export async function assertOptionalAuthTokenIsValid(request: NextRequest): Promise<GuardError | null> {
  const resolved = await resolveAuthFromRequest(request);
  if (resolved.hasBearerToken && !resolved.user) {
    return {
      response: NextResponse.json({ error: "Invalid auth token. Please sign in again." }, { status: 401 })
    };
  }
  return null;
}

export async function requireAuthenticatedUser(request: NextRequest): Promise<{ user: AuthUser } | GuardError> {
  const resolved = await resolveAuthFromRequest(request);
  if (!resolved.user) {
    return {
      response: NextResponse.json({ error: "Authentication required." }, { status: 401 })
    };
  }

  return { user: resolved.user };
}

export async function requireAdminAccess(request: NextRequest): Promise<{ userId: string } | GuardError> {
  const auth = await requireAuthenticatedUser(request);
  if ("response" in auth) {
    return auth;
  }

  const access = await getCurrentUserAccess(request);
  if (!access.userId || access.role !== "admin") {
    return {
      response: NextResponse.json({ error: "Admin role required." }, { status: 403 })
    };
  }

  return {
    userId: access.userId
  };
}

