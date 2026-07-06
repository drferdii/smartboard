-- =============================================================================
-- Migration 0002: menu_items table + RLS + storage policies
-- Uses current_user_role() SECURITY DEFINER function from migration 0001
-- to avoid infinite recursion in owner-check policies.
-- =============================================================================

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  category text not null check (category in ('dayak','smoked','pedas','minuman')),
  photo_url text,
  badge text,
  is_active boolean not null default true,
  needs_owner_confirmation boolean not null default true,
  created_by uuid references public.profiles,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_menu_cat on public.menu_items(category) where is_active = true;
create index idx_menu_active on public.menu_items(is_active, created_at desc);

alter table public.menu_items enable row level security;

-- Owner: full CRUD (uses SECURITY DEFINER helper from migration 0001 to avoid recursion)
create policy "owner_full_menu" on public.menu_items
  for all using (public.current_user_role() = 'owner');

-- Staff: read active items only
create policy "staff_read_active_menu" on public.menu_items
  for select using (is_active = true and public.current_user_role() in ('staff', 'owner'));

-- Storage policies (menu-photos bucket)
-- Public read for the bucket
create policy "public_read_menu_photos" on storage.objects
  for select using (bucket_id = 'menu-photos');

-- Owner-only write (insert/update/delete)
create policy "owner_write_menu_photos" on storage.objects
  for all using (
    bucket_id = 'menu-photos' and
    public.current_user_role() = 'owner'
  );

-- Trigger: auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();
