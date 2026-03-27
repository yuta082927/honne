-- RLS hardening: enable RLS and add missing policies for all public tables.
-- Safe to run multiple times (all changes are idempotent).
--
-- Architecture note:
--   All server-side DB writes go through supabaseAdmin (service_role), which
--   bypasses RLS entirely. These policies protect against direct client-side
--   access via the Supabase JS SDK using a user JWT.

-- =====================================================
-- Enable RLS on all public tables
-- =====================================================
alter table public.users enable row level security;
alter table public.usage_logs enable row level security;
alter table public.anonymous_sessions enable row level security;
alter table public.fortune_logs enable row level security;

-- =====================================================
-- Grants: revoke broad access, grant minimal read-only
-- to authenticated role (writes handled by service_role)
-- =====================================================
revoke all on public.usage_logs from anon;
revoke all on public.anonymous_sessions from anon;
revoke all on public.fortune_logs from anon;

grant select on public.usage_logs to authenticated;
grant select on public.anonymous_sessions to authenticated;
grant select on public.fortune_logs to authenticated;
grant select on public.users to authenticated;
-- Column-level grant: users may only update display_name.
-- role / plan are managed by service_role (admin operations) only.
grant update (display_name) on public.users to authenticated;

-- =====================================================
-- users: own row only
-- =====================================================
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'users' and policyname = 'users_select_own'
  ) then
    create policy users_select_own
      on public.users for select to authenticated
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'users' and policyname = 'users_update_own'
  ) then
    -- Allow updating display_name only. role/plan are managed by service_role.
    create policy users_update_own
      on public.users for update to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

-- =====================================================
-- usage_logs: read own rows only (writes via service_role)
-- =====================================================
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'usage_logs' and policyname = 'usage_logs_select_own'
  ) then
    create policy usage_logs_select_own
      on public.usage_logs for select to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- =====================================================
-- anonymous_sessions: read own rows only (writes via service_role)
-- =====================================================
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'anonymous_sessions' and policyname = 'anon_sessions_select_own'
  ) then
    create policy anon_sessions_select_own
      on public.anonymous_sessions for select to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

-- =====================================================
-- fortune_logs: read own rows only (writes via service_role)
-- =====================================================
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'fortune_logs' and policyname = 'fortune_logs_select_own'
  ) then
    create policy fortune_logs_select_own
      on public.fortune_logs for select to authenticated
      using (user_id = auth.uid());
  end if;
end $$;
