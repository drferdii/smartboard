-- =============================================================================
-- Migration 0003: transactions + transaction_items + RLS
-- =============================================================================

-- transactions: POS header
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.profiles,
  total_cents int not null check (total_cents >= 0),
  paid_cents int not null check (paid_cents >= 0),
  change_cents int not null generated always as (paid_cents - total_cents) stored,
  payment_method text not null default 'cash' check (payment_method = 'cash'),
  note text,
  created_at timestamptz not null default now()
);

create index idx_tx_created_at on public.transactions(created_at desc);
create index idx_tx_staff on public.transactions(staff_id, created_at desc);

alter table public.transactions enable row level security;

-- Both owner and active staff can insert
create policy "tx_insert" on public.transactions
  for insert with check (
    staff_id = auth.uid() and
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_active = true
        and p.role in ('staff', 'owner')
    )
  );

-- Owner reads all
create policy "owner_read_all_tx" on public.transactions
  for select using (public.current_user_role() = 'owner');

-- Staff reads own
create policy "staff_read_own_tx" on public.transactions
  for select using (
    staff_id = auth.uid() and
    public.current_user_role() in ('staff', 'owner')
  );

-- transaction_items: POS line items with snapshot
create table public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions on delete cascade,
  menu_item_id uuid not null references public.menu_items,
  name_snapshot text not null,
  price_cents_snapshot int not null check (price_cents_snapshot >= 0),
  quantity int not null check (quantity > 0),
  subtotal_cents int not null check (subtotal_cents >= 0)
);

create index idx_txitems_tx on public.transaction_items(transaction_id);
create index idx_txitems_menu on public.transaction_items(menu_item_id);

alter table public.transaction_items enable row level security;

-- Insert: only via authenticated active users
create policy "txitems_insert" on public.transaction_items
  for insert with check (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_items.transaction_id
        and t.staff_id = auth.uid()
        and exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.is_active = true
        )
    )
  );

-- Read: same access as parent transaction (owner all, staff own)
create policy "txitems_read" on public.transaction_items
  for select using (
    exists (
      select 1 from public.transactions t
      where t.id = transaction_items.transaction_id
        and (
          public.current_user_role() = 'owner'
          or t.staff_id = auth.uid()
        )
    )
  );
