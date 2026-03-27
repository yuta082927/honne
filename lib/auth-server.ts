import "server-only";
import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthResolution = {
  hasBearerToken: boolean;
  user: AuthUser | null;
};

function readBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authHeader.slice("Bearer ".length).trim();
  return accessToken || null;
}

export async function getUser(request: NextRequest): Promise<AuthUser | null> {
  const supabase = createSupabaseServerClient(request);
  const bearerToken = readBearerToken(request);

  const { data, error } = bearerToken
    ? await supabase.auth.getUser(bearerToken)
    : await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null
  };
}

export async function resolveAuthFromRequest(request: NextRequest): Promise<AuthResolution> {
  const hasBearerToken = Boolean(readBearerToken(request));
  const user = await getUser(request);
  return { hasBearerToken, user };
}

export async function getAuthUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const resolved = await resolveAuthFromRequest(request);
  return resolved.user;
}

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const user = await getAuthUserFromRequest(request);
  return user?.id ?? null;
}

