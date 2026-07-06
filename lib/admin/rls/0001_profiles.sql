-- =============================================================================
-- Migration 0001: profiles table + RLS (FIXED: break infinite recursion)
-- =============================================================================

-- profiles: extend auth.users
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role text not null check (role in ('owner', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role) where is_active = true;

alter table public.profiles enable row level security;

-- Helper function: SECURITY DEFINER breaks the recursion (runs with table owner
-- permissions, bypassing RLS). Without this, owner_full_profiles policy would
-- recursively check itself infinitely.
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

-- Policies
create policy "owner_full_profiles" on public.profiles
  for all using (public.current_user_role() = 'owner');

create policy "user_read_own_profile" on public.profiles
  for select using (id = auth.uid());

-- Trigger: auto-create profile when new auth.users row inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'staff'),
    true
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
