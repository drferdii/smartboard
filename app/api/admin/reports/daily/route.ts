import { createClient } from '@/lib/admin/supabase/server';
import { requireActiveUser, requireRole } from '@/lib/admin/auth';
import { buildBusinessDateRange, getTodayID, isIsoCalendarDate } from '@/lib/admin/format/date';
import { apiData, apiError, logApiError } from '@/lib/http/responses';

const BUSINESS_TIMEZONE = 'Asia/Jakarta';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireActiveUser(supabase);
    if (!auth.ok) {
      return auth.response;
    }

    const roleError = requireRole(auth.profile, ['owner']);
    if (roleError) {
      return roleError;
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId')?.trim();
    if (branchId) {
      return apiError(
        409,
        'REPORT_SCOPE_UNAVAILABLE',
        'Laporan per outlet belum tersedia pada data biaya saat ini.'
      );
    }

    const date = searchParams.get('date') ?? getTodayID({ timeZone: BUSINESS_TIMEZONE });
    if (!isIsoCalendarDate(date)) {
      return apiError(400, 'VALIDATION_ERROR', 'Parameter tanggal tidak valid.');
    }
    const range = buildBusinessDateRange(date, BUSINESS_TIMEZONE);

    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('id, total_cents, paid_cents, change_cents, created_at')
      .gte('created_at', range.start)
      .lt('created_at', range.endExclusive);

    if (txError) {
      throw txError;
    }

    const { data: exps, error: expError } = await supabase
      .from('expenses')
      .select('id, category, amount_cents')
      .eq('incurred_at', date);

    if (expError) {
      throw expError;
    }

    const paidTransactions = (txs ?? []).filter((transaction) => transaction.paid_cents >= transaction.total_cents);
    const txCount = paidTransactions.length;
    const revenueCents = paidTransactions.reduce((sum, transaction) => sum + transaction.total_cents, 0);
    const expenseTotalCents = (exps ?? []).reduce((sum, expense) => sum + expense.amount_cents, 0);
    const profitCents = revenueCents - expenseTotalCents;

    const expensesByCategory = (exps ?? []).reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount_cents;
      return acc;
    }, {});

    return apiData({
      date,
      scope: 'all_outlets',
      transaction_count: txCount,
      revenue_cents: revenueCents,
      expense_total_cents: expenseTotalCents,
      profit_cents: profitCents,
      expenses_by_category: expensesByCategory,
      transactions: paidTransactions,
      expenses: exps ?? [],
    });
  } catch (error: unknown) {
    return logApiError('api/admin/reports/daily', error, {
      message: 'Rangkuman harian belum tersedia saat ini.',
    });
  }
}
