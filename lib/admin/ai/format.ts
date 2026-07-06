/**
 * Format integer cents as Indonesian Rupiah string for AI prompt input.
 *
 * Re-exports the canonical `formatRupiah` from `format/money` so AI output
 * stays consistent with the rest of the admin UI.
 *
 * Note: `*_cents` fields in this codebase store actual cents (1/100 rupiah),
 * NOT rupiah directly. See `lib/admin/rls/0003_transactions.sql` and
 * `lib/admin/format/money.ts`.
 */
export { formatRupiah as formatRupiahPlain } from '@/lib/admin/format/money';
