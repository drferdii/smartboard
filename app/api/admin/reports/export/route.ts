import { createClient } from '@/lib/admin/supabase/server';
import { requireActiveUser, requireRole } from '@/lib/admin/auth';
import {
  buildBusinessDateRange,
  formatDateInTimeZone,
  getTodayID,
  isIsoCalendarDate,
} from '@/lib/admin/format/date';
import { escapeCsv } from '@/lib/http/errors';
import { apiError, logApiError } from '@/lib/http/responses';

const BUSINESS_TIMEZONE = 'Asia/Jakarta';

function formatDate(d: string | Date): string {
  return formatDateInTimeZone(d, BUSINESS_TIMEZONE);
}

function formatRupiah(cents: number): string {
  return 'Rp ' + (cents / 100).toLocaleString('id-ID');
}

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
        'Ekspor per outlet belum tersedia pada data biaya saat ini.'
      );
    }

    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const fromDate = from ?? getTodayID({ timeZone: BUSINESS_TIMEZONE });
    if (!isIsoCalendarDate(fromDate)) {
      return apiError(400, 'VALIDATION_ERROR', 'Parameter from tidak valid.');
    }
    if (to && !isIsoCalendarDate(to)) {
      return apiError(400, 'VALIDATION_ERROR', 'Parameter to tidak valid.');
    }

    const toDate = to ?? fromDate;
    if (fromDate > toDate) {
      return apiError(400, 'VALIDATION_ERROR', 'Rentang tanggal laporan tidak valid.');
    }
    const fromRange = buildBusinessDateRange(fromDate, BUSINESS_TIMEZONE);
    const toRange = buildBusinessDateRange(toDate, BUSINESS_TIMEZONE);

    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('id, total_cents, paid_cents, change_cents, created_at')
      .gte('created_at', fromRange.start)
      .lt('created_at', toRange.endExclusive)
      .order('created_at');

    if (txError) {
      throw txError;
    }

    const { data: exps, error: expError } = await supabase
      .from('expenses')
      .select('id, category, amount_cents, description, incurred_at')
      .gte('incurred_at', fromDate)
      .lt('incurred_at', toRange.endExclusive.slice(0, 10))
      .order('incurred_at');

    if (expError) {
      throw expError;
    }

    const lines: string[] = [];
    lines.push('Tanggal,Tipe,Kategori/Metode,Deskripsi,Amount (Rp)');

    const paidTransactions = (txs ?? []).filter((transaction) => transaction.paid_cents >= transaction.total_cents);

    for (const t of paidTransactions) {
      lines.push([
        escapeCsv(formatDate(t.created_at)),
        escapeCsv('Penjualan'),
        escapeCsv('Tunai'),
        escapeCsv(`Tx ${t.id.slice(0, 8)}`),
        escapeCsv(formatRupiah(t.total_cents)),
      ].join(','));
    }
    for (const e of exps ?? []) {
      lines.push([
        escapeCsv(e.incurred_at),
        escapeCsv('Pengeluaran'),
        escapeCsv(e.category),
        escapeCsv(e.description ?? ''),
        escapeCsv('-' + formatRupiah(e.amount_cents)),
      ].join(','));
    }

    const csv = lines.join('\n');
    const filename = `laporan-${fromDate}-to-${toDate}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    return logApiError('api/admin/reports/export', error, {
      message: 'Ekspor laporan belum tersedia saat ini.',
    });
  }
}
