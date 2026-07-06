-- =============================================================================
-- Migration 0004: expenses + RLS
-- =============================================================================

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('bahan','operasional','gaji','lain')),
  amount_cents int not null check (amount_cents >= 0),
  description text,
  incurred_by uuid references public.profiles,
  incurred_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_expenses_incurred_at on public.expenses(incurred_at desc);
create index idx_expenses_category on public.expenses(category, incurred_at desc);

alter table public.expenses enable row level security;

-- Owner only (uses current_user_role() to avoid recursion)
create policy "owner_full_expenses" on public.expenses
  for all using (public.current_user_role() = 'owner');
