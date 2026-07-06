-- =============================================================================
-- Migration 0005: ai_summaries + RLS
-- =============================================================================

create table public.ai_summaries (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  summary_text text not null,
  generated_at timestamptz not null default now(),
  unique (period_start, period_end)
);

create index idx_ai_summaries_period on public.ai_summaries(period_start desc, period_end desc);

alter table public.ai_summaries enable row level security;

-- Owner only (uses current_user_role() to avoid recursion)
create policy "owner_full_ai_summaries" on public.ai_summaries
  for all using (public.current_user_role() = 'owner');
