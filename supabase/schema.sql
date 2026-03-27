create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- users (DB role / plan)
-- =========================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  plan text not null default 'free' check (plan in ('free', 'premium')),
  daily_limit integer,
  deep_daily_limit integer,
  is_unlimited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_unique_idx on public.users(email) where email is not null;
create index if not exists users_role_idx on public.users(role);
create index if not exists users_plan_idx on public.users(plan);

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create or replace function public.sync_public_user_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role, plan)
  values (new.id, new.email, 'user', 'free')
  on conflict (id)
  do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_synced_to_public_users on auth.users;
create trigger on_auth_user_synced_to_public_users
after insert or update on auth.users
for each row
execute function public.sync_public_user_from_auth();

insert into public.users (id, email, role, plan)
select au.id, au.email, 'user', 'free'
from auth.users au
left join public.users u on u.id = au.id
where u.id is null;

-- =========================================================
-- usage_logs (primary quota)
-- =========================================================
create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  used_count integer not null default 0,
  free_limit integer not null default 3,
  last_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.usage_logs add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.usage_logs add column if not exists session_id text;
alter table public.usage_logs add column if not exists used_count integer;
alter table public.usage_logs add column if not exists free_limit integer;
alter table public.usage_logs add column if not exists last_reset_at timestamptz not null default now();

update public.usage_logs
set
  session_id = coalesce(session_id, gen_random_uuid()::text),
  used_count = coalesce(used_count, 0),
  free_limit = coalesce(free_limit, 3),
  last_reset_at = coalesce(last_reset_at, now());

alter table public.usage_logs alter column session_id set not null;
alter table public.usage_logs alter column used_count set not null;
alter table public.usage_logs alter column free_limit set not null;
alter table public.usage_logs alter column used_count set default 0;
alter table public.usage_logs alter column free_limit set default 3;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'usage_logs_session_id_key'
      and conrelid = 'public.usage_logs'::regclass
  ) then
    alter table public.usage_logs
      add constraint usage_logs_session_id_key unique (session_id);
  end if;
end;
$$;

create index if not exists usage_logs_user_id_idx on public.usage_logs(user_id);
create index if not exists usage_logs_last_reset_idx on public.usage_logs(last_reset_at);

drop trigger if exists trg_usage_logs_updated_at on public.usage_logs;
create trigger trg_usage_logs_updated_at
before update on public.usage_logs
for each row
execute function public.set_updated_at();

-- =========================================================
-- anonymous_sessions (legacy fallback)
-- =========================================================
create table if not exists public.anonymous_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  used_count integer not null default 0,
  free_limit integer not null default 3,
  last_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.anonymous_sessions add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.anonymous_sessions add column if not exists last_reset_at timestamptz not null default now();

create index if not exists anonymous_sessions_user_id_idx on public.anonymous_sessions(user_id);
create index if not exists anonymous_sessions_session_id_idx on public.anonymous_sessions(session_id);

drop trigger if exists trg_anonymous_sessions_updated_at on public.anonymous_sessions;
create trigger trg_anonymous_sessions_updated_at
before update on public.anonymous_sessions
for each row
execute function public.set_updated_at();

-- Migrate legacy quota rows into usage_logs
insert into public.usage_logs (
  session_id,
  user_id,
  used_count,
  free_limit,
  last_reset_at,
  created_at,
  updated_at
)
select
  s.session_id,
  s.user_id,
  s.used_count,
  s.free_limit,
  coalesce(s.last_reset_at, now()),
  s.created_at,
  s.updated_at
from public.anonymous_sessions s
on conflict (session_id) do update
set
  user_id = coalesce(public.usage_logs.user_id, excluded.user_id),
  used_count = greatest(public.usage_logs.used_count, excluded.used_count),
  free_limit = greatest(public.usage_logs.free_limit, excluded.free_limit),
  last_reset_at = greatest(public.usage_logs.last_reset_at, excluded.last_reset_at),
  updated_at = now();

-- =========================================================
-- fortune_logs
-- =========================================================
create table if not exists public.fortune_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  user_id uuid references auth.users(id) on delete set null,
  mode text not null default 'general',
  depth text not null default 'light',
  category text,
  subcategory text,
  user_input text not null,
  ai_response text not null,
  self_birthday date,
  self_birth_time text,
  self_birth_place text,
  partner_birthday date,
  partner_birth_time text,
  partner_birth_place text,
  computed_summary jsonb,
  input_payload jsonb,
  analysis_payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.fortune_logs add column if not exists session_id text;
alter table public.fortune_logs add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.fortune_logs add column if not exists mode text;
alter table public.fortune_logs add column if not exists depth text;
alter table public.fortune_logs add column if not exists category text;
alter table public.fortune_logs add column if not exists subcategory text;
alter table public.fortune_logs add column if not exists self_birthday date;
alter table public.fortune_logs add column if not exists self_birth_time text;
alter table public.fortune_logs add column if not exists self_birth_place text;
alter table public.fortune_logs add column if not exists partner_birthday date;
alter table public.fortune_logs add column if not exists partner_birth_time text;
alter table public.fortune_logs add column if not exists partner_birth_place text;
alter table public.fortune_logs add column if not exists computed_summary jsonb;
alter table public.fortune_logs add column if not exists input_payload jsonb;
alter table public.fortune_logs add column if not exists analysis_payload jsonb;

update public.fortune_logs
set
  mode = coalesce(mode, category, 'general'),
  depth = coalesce(depth, 'light'),
  session_id = coalesce(session_id, gen_random_uuid()::text);

create index if not exists fortune_logs_user_id_created_idx on public.fortune_logs(user_id, created_at desc);
create index if not exists fortune_logs_session_created_idx on public.fortune_logs(session_id, created_at desc);

-- =========================================================
-- RPC: usage refresh / consume
-- =========================================================
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
declare
  v_rows integer := 0;
begin
  update public.usage_logs as u
     set used_count = case
       when ((now() at time zone 'Asia/Tokyo')::date > (coalesce(u.last_reset_at, now()) at time zone 'Asia/Tokyo')::date)
         then 0
       else u.used_count
     end,
         last_reset_at = case
       when ((now() at time zone 'Asia/Tokyo')::date > (coalesce(u.last_reset_at, now()) at time zone 'Asia/Tokyo')::date)
         then now()
       else u.last_reset_at
     end,
         updated_at = now()
   where u.session_id = p_session_id;

  get diagnostics v_rows = row_count;

  if v_rows = 0 then
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
  end if;

  return query
  select u.id, u.session_id, u.used_count, u.free_limit, u.last_reset_at, u.created_at, u.updated_at
  from public.usage_logs u
  where u.session_id = p_session_id
  limit 1;

  if not found then
    return query
    select s.id, s.session_id, s.used_count, s.free_limit, s.last_reset_at, s.created_at, s.updated_at
    from public.anonymous_sessions s
    where s.session_id = p_session_id
    limit 1;
  end if;
end;
$$;

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
  update public.usage_logs as u
     set used_count = u.used_count + v_cost,
         updated_at = now()
   where u.session_id = p_session_id
     and u.used_count + v_cost <= u.free_limit
   returning u.id, u.session_id, u.used_count, u.free_limit, u.last_reset_at, u.created_at, u.updated_at;

  if not found then
    return query
    update public.anonymous_sessions as s
       set used_count = s.used_count + v_cost,
           updated_at = now()
     where s.session_id = p_session_id
       and s.used_count + v_cost <= s.free_limit
     returning s.id, s.session_id, s.used_count, s.free_limit, s.last_reset_at, s.created_at, s.updated_at;
  end if;
end;
$$;

revoke execute on function public.refresh_daily_usage(text) from public, anon, authenticated;
revoke execute on function public.consume_free_quota(text, integer) from public, anon, authenticated;
grant execute on function public.refresh_daily_usage(text) to service_role;
grant execute on function public.consume_free_quota(text, integer) to service_role;

-- =========================================================
-- RLS hardening
-- =========================================================
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table %I.%I enable row level security', r.schemaname, r.tablename);
  end loop;
end;
$$;

-- Minimal grants
revoke all on all tables in schema public from anon, authenticated;
grant select, update on public.users to authenticated;
grant select, update on public.usage_logs to authenticated;
grant select, update on public.anonymous_sessions to authenticated;
grant select, insert on public.fortune_logs to authenticated;

-- users policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'users' and policyname = 'users_select_own'
  ) then
    create policy users_select_own
      on public.users
      for select
      to authenticated
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'users' and policyname = 'users_update_own'
  ) then
    create policy users_update_own
      on public.users
      for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end;
$$;

-- usage_logs policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'usage_logs' and policyname = 'usage_logs_select_own'
  ) then
    create policy usage_logs_select_own
      on public.usage_logs
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'usage_logs' and policyname = 'usage_logs_update_own'
  ) then
    create policy usage_logs_update_own
      on public.usage_logs
      for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end;
$$;

-- anonymous_sessions policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'anonymous_sessions' and policyname = 'anonymous_sessions_select_own'
  ) then
    create policy anonymous_sessions_select_own
      on public.anonymous_sessions
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'anonymous_sessions' and policyname = 'anonymous_sessions_update_own'
  ) then
    create policy anonymous_sessions_update_own
      on public.anonymous_sessions
      for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end;
$$;

-- fortune_logs policies
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'fortune_logs' and policyname = 'fortune_logs_select_own'
  ) then
    create policy fortune_logs_select_own
      on public.fortune_logs
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'fortune_logs' and policyname = 'fortune_logs_insert_own'
  ) then
    create policy fortune_logs_insert_own
      on public.fortune_logs
      for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;
end;
$$;
