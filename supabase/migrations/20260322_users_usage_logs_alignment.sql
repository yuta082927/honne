-- Align app logic with current Supabase tables:
-- public.users / public.usage_logs / public.fortune_logs
-- Safe to run multiple times.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user',
  plan text not null default 'free',
  daily_limit integer,
  deep_daily_limit integer,
  is_unlimited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_role_check check (role in ('user', 'admin')),
  constraint users_plan_check check (plan in ('free', 'premium'))
);

create unique index if not exists users_email_unique_idx on public.users(email) where email is not null;
create index if not exists users_role_idx on public.users(role);
create index if not exists users_plan_idx on public.users(plan);

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
alter table public.usage_logs add column if not exists last_reset_at timestamptz not null default now();
alter table public.usage_logs alter column used_count set default 0;
alter table public.usage_logs alter column free_limit set default 3;
create index if not exists usage_logs_user_id_idx on public.usage_logs(user_id);

alter table public.fortune_logs add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.fortune_logs add column if not exists session_id text;
alter table public.fortune_logs add column if not exists mode text;
alter table public.fortune_logs add column if not exists depth text;
create index if not exists fortune_logs_user_id_created_idx on public.fortune_logs(user_id, created_at desc);
create index if not exists fortune_logs_session_created_idx on public.fortune_logs(session_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists trg_usage_logs_updated_at on public.usage_logs;
create trigger trg_usage_logs_updated_at
before update on public.usage_logs
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
  do update set email = excluded.email, updated_at = now();

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

  return query
  select u.id, u.session_id, u.used_count, u.free_limit, u.last_reset_at, u.created_at, u.updated_at
  from public.usage_logs as u
  where u.session_id = p_session_id
  limit 1;
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
end;
$$;
