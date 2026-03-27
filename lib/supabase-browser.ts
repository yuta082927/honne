import { createClient } from "@supabase/supabase-js";

export type BrowserSupabaseClient = ReturnType<typeof createClient>;

let browserClient: BrowserSupabaseClient | null = null;

export function createSupabaseBrowserClient(): BrowserSupabaseClient | null {
  if (browserClient) {
    return browserClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定のため認証機能は無効です。");
    return null;
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return browserClient;
}

