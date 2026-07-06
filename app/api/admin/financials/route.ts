import { requireActiveUser, requireRole } from '@/lib/admin/auth';
import { createClient } from '@/lib/admin/supabase/server';
import { apiData, logApiError } from '@/lib/http/responses';

export async function GET() {
  try {
    const supabase = await createClient();
    const auth = await requireActiveUser(supabase);
    if (!auth.ok) {
      return auth.response;
    }
    const roleResponse = requireRole(auth.profile, ['owner']);
    if (roleResponse) return roleResponse;

    // Get current month's transactions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('total_cents')
      .gte('created_at', startOfMonth.toISOString());
      
    if (txError) throw txError;

    const { data: expenses, error: expError } = await supabase
      .from('expenses')
      .select('amount_cents')
      .gte('incurred_at', startOfMonth.toISOString().split('T')[0]);

    if (expError) throw expError;

    const revenueCents = (txs ?? []).reduce((sum, t) => sum + t.total_cents, 0);
    const opexCents = (expenses ?? []).reduce((sum, e) => sum + e.amount_cents, 0);

    // For MVP, approximate COGS as 40% of revenue
    const cogsCents = Math.floor(revenueCents * 0.4);

    const netProfitCents = revenueCents - cogsCents - opexCents;

    return apiData({
        revenue: revenueCents,
        cogs: cogsCents,
        opex: opexCents,
        net_profit: netProfitCents,
    });
  } catch (error: unknown) {
    return logApiError('api/admin/financials', error, {
      message: 'Gagal memuat ringkasan finansial.',
    });
  }
}
