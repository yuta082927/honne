-- DB role/plan based access control (no ADMIN_EMAILS)
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

-- Backfill existing auth users
insert into public.users (id, email, role, plan)
select au.id, au.email, 'user', 'free'
from auth.users au
left join public.users u on u.id = au.id
where u.id is null;

-- RLS (minimum)
alter table public.users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'users' and policyname = 'users_select_own'
  ) then
    create policy users_select_own
      on public.users
      for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'users' and policyname = 'users_update_own'
  ) then
    create policy users_update_own
      on public.users
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end;
$$;
