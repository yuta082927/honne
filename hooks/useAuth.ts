"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function useAuth() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthUser(null);
      setAccessToken(null);
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setAuthUser(data.session?.user ?? null);
      setAccessToken(data.session?.access_token ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { authUser, accessToken };
}
