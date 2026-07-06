-- =============================================================================
-- Migration 0007: Migrate monetary cents columns to bigint
-- Fixes integer overflow limits (2.1B cents = ~21.4M IDR) to allow transactions
-- and expenses above 21.4 Million IDR.
-- =============================================================================

-- 1. expenses table
ALTER TABLE public.expenses ALTER COLUMN amount_cents TYPE bigint;

-- 2. menu_items table
ALTER TABLE public.menu_items ALTER COLUMN price_cents TYPE bigint;

-- 3. transactions table
-- Drop the generated change_cents column first since it depends on paid_cents and total_cents
ALTER TABLE public.transactions DROP COLUMN change_cents;

ALTER TABLE public.transactions ALTER COLUMN total_cents TYPE bigint;
ALTER TABLE public.transactions ALTER COLUMN paid_cents TYPE bigint;

-- Re-add the generated column with bigint type
ALTER TABLE public.transactions ADD COLUMN change_cents bigint generated always as (paid_cents - total_cents) stored;

-- 4. transaction_items table
ALTER TABLE public.transaction_items ALTER COLUMN price_cents_snapshot TYPE bigint;
ALTER TABLE public.transaction_items ALTER COLUMN subtotal_cents TYPE bigint;
