"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function TopNav() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function onLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-violet/25 bg-void/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3 py-3 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-star">
          ホンネ
        </Link>

        <nav className="flex items-center gap-2 text-xs sm:text-sm">
          <Link href="/chat" className="rounded-full px-3 py-1 text-starsub transition hover:bg-violet/10 hover:text-star">
            チャット
          </Link>

          {loading ? (
            <span className="rounded-full px-3 py-1 text-starsub/80">確認中...</span>
          ) : user ? (
            <>
              <Link href="/history" className="rounded-full px-3 py-1 text-starsub transition hover:bg-violet/10 hover:text-star">
                履歴
              </Link>
              <Link href="/account" className="rounded-full px-3 py-1 text-starsub transition hover:bg-violet/10 hover:text-star">
                アカウント
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-violet/40 px-3 py-1 text-starsub transition hover:bg-violet/10 hover:text-star"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-1 text-starsub transition hover:bg-violet/10 hover:text-star">
                ログイン
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-violet/50 bg-violet/10 px-3 py-1 font-semibold text-violet-glow transition hover:bg-violet/20"
              >
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

