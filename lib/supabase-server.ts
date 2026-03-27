import "server-only";
import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createSupabaseServerClient(request: NextRequest) {
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value
        }));
      },
      setAll() {
        // No-op in route handlers for auth.getUser() use case.
      }
    }
  });
}

