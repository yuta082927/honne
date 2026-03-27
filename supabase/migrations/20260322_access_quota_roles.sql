-- Phase: access / quota normalization
-- Safe to run multiple times.

create extension if not exists pgcrypto;

-- ---------- profiles: role / plan / limits ----------
alter table if exists public.profiles
  add column if not exists role text;

alter table if exists public.profiles
  add column if not exists plan text;

alter table if exists public.profiles
  add column if not exists daily_limit integer;

alter table if exists public.profiles
  add column if not exists deep_daily_limit integer;

alter table if exists public.profiles
  add column if not exists is_unlimited boolean;

-- Ensure default values for existing/new rows.
update public.profiles
set role = coalesce(role, 'user')
where role is null;

update public.profiles
set plan = coalesce(plan, 'free')
where plan is null;

update public.profiles
set is_unlimited = coalesce(is_unlimited, false)
where is_unlimited is null;

alter table public.profiles
  alter column role set default 'user';

alter table public.profiles
  alter column plan set default 'free';

alter table public.profiles
  alter column is_unlimited set default false;

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_plan on public.profiles(plan);

-- ---------- anonymous_sessions ----------
alter table if exists public.anonymous_sessions
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table if exists public.anonymous_sessions
  add column if not exists last_reset_at timestamptz not null default now();

-- keep required columns stable
alter table public.anonymous_sessions
  alter column session_id set not null;

alter table public.anonymous_sessions
  alter column used_count set not null;

alter table public.anonymous_sessions
  alter column free_limit set not null;

create unique index if not exists uq_anonymous_sessions_session_id
  on public.anonymous_sessions(session_id);

create index if not exists idx_anonymous_sessions_user_id
  on public.anonymous_sessions(user_id);

-- ---------- fortune_logs ----------
alter table if exists public.fortune_logs
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table if exists public.fortune_logs
  add column if not exists mode text;

alter table if exists public.fortune_logs
  add column if not exists depth text;

alter table if exists public.fortune_logs
  add column if not exists self_birthday date;

alter table if exists public.fortune_logs
  add column if not exists partner_birthday date;

alter table if exists public.fortune_logs
  add column if not exists computed_summary jsonb;

-- Backfill mode from old category column if exists.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'fortune_logs' and column_name = 'category'
  ) then
    update public.fortune_logs
    set mode = coalesce(mode, category)
    where mode is null;
  end if;
end
$$;

update public.fortune_logs
set depth = coalesce(depth, 'ライト')
where depth is null;

create index if not exists idx_fortune_logs_user_created
  on public.fortune_logs(user_id, created_at desc);

create index if not exists idx_fortune_logs_session_created
  on public.fortune_logs(session_id, created_at desc);

-- ---------- JST daily refresh ----------
create or replace function public.refresh_daily_usage(p_session_id text)
returns table (
  id uuid,
  session_id text,
  used_count integer,
  free_limit integer,
  last_reset_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.anonymous_sessions as s
     set used_count = case
       when ((now() at time zone 'Asia/Tokyo')::date > (coalesce(s.last_reset_at, now()) at time zone 'Asia/Tokyo')::date)
         then 0
       else s.used_count
     end,
         last_reset_at = case
       when ((now() at time zone 'Asia/Tokyo')::date > (coalesce(s.last_reset_at, now()) at time zone 'Asia/Tokyo')::date)
         then now()
       else s.last_reset_at
     end,
         updated_at = now()
   where s.session_id = p_session_id;

  return query
  select s.id, s.session_id, s.used_count, s.free_limit, s.last_reset_at, s.created_at, s.updated_at
    from public.anonymous_sessions as s
   where s.session_id = p_session_id
   limit 1;
end;
$$;

-- ---------- Unified consume RPC ----------
create or replace function public.consume_free_quota(p_session_id text, p_cost integer default 1)
returns table (
  id uuid,
  session_id text,
  used_count integer,
  free_limit integer,
  last_reset_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cost integer;
begin
  v_cost := greatest(coalesce(p_cost, 1), 1);

  perform * from public.refresh_daily_usage(p_session_id);

  return query
  update public.anonymous_sessions as s
     set used_count = s.used_count + v_cost,
         updated_at = now()
   where s.session_id = p_session_id
     and s.used_count + v_cost <= s.free_limit
   returning s.id, s.session_id, s.used_count, s.free_limit, s.last_reset_at, s.created_at, s.updated_at;
end;
$$;

-- Backward compatible alias for old API callers.
create or replace function public.consume_usage(p_session_id text, p_cost integer default 1)
returns table (
  id uuid,
  session_id text,
  used_count integer,
  free_limit integer,
  last_reset_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select * from public.consume_free_quota(p_session_id, p_cost);
end;
$$;

-- ---------- RLS (minimal) ----------
alter table if exists public.profiles enable row level security;
alter table if exists public.fortune_logs enable row level security;

-- profiles: owner only
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_own'
  ) THEN
    CREATE POLICY profiles_select_own
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY profiles_update_own
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- fortune_logs: owner can read own records (anonymous records stay server-only via service role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'fortune_logs' AND policyname = 'fortune_logs_select_own'
  ) THEN
    CREATE POLICY fortune_logs_select_own
      ON public.fortune_logs
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;
