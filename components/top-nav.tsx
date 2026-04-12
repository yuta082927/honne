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
    <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-3 py-2 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-ink">
          ホンネ
        </Link>

        <nav className="flex items-center gap-2 text-xs sm:text-sm">
          <Link href="/chat" className="rounded-full px-3 py-1 text-ink/80 hover:bg-rose hover:text-ink">
            チャット
          </Link>

          {loading ? (
            <span className="rounded-full px-3 py-1 text-ink/50">確認中...</span>
          ) : user ? (
            <>
              <Link href="/history" className="rounded-full px-3 py-1 text-ink/80 hover:bg-rose hover:text-ink">
                履歴
              </Link>
              <Link href="/account" className="rounded-full px-3 py-1 text-ink/80 hover:bg-rose hover:text-ink">
                アカウント
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-rose-200 px-3 py-1 text-ink/80 hover:bg-rose"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-1 text-ink/80 hover:bg-rose hover:text-ink">
                ログイン
              </Link>
              <Link href="/signup" className="rounded-full border border-wine px-3 py-1 font-semibold text-wine hover:bg-rose">
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

