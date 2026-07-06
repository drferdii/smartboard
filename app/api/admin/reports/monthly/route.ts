import { createClient } from '@/lib/admin/supabase/server';
import { requireActiveUser, requireRole } from '@/lib/admin/auth';
import { buildBusinessDateRange, formatDateInTimeZone, getDateParts, isIsoCalendarDate } from '@/lib/admin/format/date';
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

    const today = getDateParts({ timeZone: BUSINESS_TIMEZONE });
    const year = Number(searchParams.get('year') ?? today.year);
    const month = Number(searchParams.get('month') ?? today.month);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return apiError(400, 'VALIDATION_ERROR', 'Parameter tahun tidak valid.');
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return apiError(400, 'VALIDATION_ERROR', 'Parameter bulan tidak valid.');
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
    if (!isIsoCalendarDate(startDate) || !isIsoCalendarDate(endDate)) {
      return apiError(400, 'VALIDATION_ERROR', 'Periode laporan tidak valid.');
    }
    const startRange = buildBusinessDateRange(startDate, BUSINESS_TIMEZONE);
    const endRange = buildBusinessDateRange(endDate, BUSINESS_TIMEZONE);

    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('id, total_cents, paid_cents, change_cents, created_at')
      .gte('created_at', startRange.start)
      .lt('created_at', endRange.start);

    if (txError) {
      throw txError;
    }

    const { data: exps, error: expError } = await supabase
      .from('expenses')
      .select('id, category, amount_cents, incurred_at')
      .gte('incurred_at', startDate)
      .lt('incurred_at', endDate);

    if (expError) {
      throw expError;
    }

    const paidTransactions = (txs ?? []).filter((transaction) => transaction.paid_cents >= transaction.total_cents);
    const txCount = paidTransactions.length;
    const revenueCents = paidTransactions.reduce((sum, transaction) => sum + transaction.total_cents, 0);
    const expenseTotalCents = (exps ?? []).reduce((sum, expense) => sum + expense.amount_cents, 0);
    const profitCents = revenueCents - expenseTotalCents;

    const dailyBreakdown: Record<string, { revenue_cents: number; expense_cents: number }> = {};

    for (const transaction of paidTransactions) {
      const day = formatDateInTimeZone(transaction.created_at, BUSINESS_TIMEZONE);
      if (!dailyBreakdown[day]) {
        dailyBreakdown[day] = { revenue_cents: 0, expense_cents: 0 };
      }
      dailyBreakdown[day].revenue_cents += transaction.total_cents;
    }

    for (const expense of exps ?? []) {
      if (!dailyBreakdown[expense.incurred_at]) {
        dailyBreakdown[expense.incurred_at] = { revenue_cents: 0, expense_cents: 0 };
      }
      dailyBreakdown[expense.incurred_at].expense_cents += expense.amount_cents;
    }

    return apiData({
      year,
      month,
      scope: 'all_outlets',
      transaction_count: txCount,
      revenue_cents: revenueCents,
      expense_total_cents: expenseTotalCents,
      profit_cents: profitCents,
      daily_breakdown: dailyBreakdown,
    });
  } catch (error: unknown) {
    return logApiError('api/admin/reports/monthly', error, {
      message: 'Rangkuman bulanan belum tersedia saat ini.',
    });
  }
}
