import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export async function getBrowserSession(): Promise<Session | null> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function getBrowserUser(): Promise<User | null> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function signOutBrowser(): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.auth.signOut();
}
