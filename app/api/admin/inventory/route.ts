import { requireActiveUser, requireRole } from '@/lib/admin/auth';
import { createClient } from '@/lib/admin/supabase/server';
import { apiData, logApiError } from '@/lib/http/responses';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireActiveUser(supabase);
    if (!auth.ok) {
      return auth.response;
    }
    const roleResponse = requireRole(auth.profile, ['owner']);
    if (roleResponse) return roleResponse;

    // Default branch fallback (if not provided in query)
    const url = new URL(request.url);
    const branchId = url.searchParams.get('branch_id') || '00000000-0000-0000-0000-000000000001';

    const { data, error } = await supabase
      .from('inventory')
      .select('id, branch_id, name, category, stock, unit, cost_per_unit, min_stock_alert, last_restock')
      .eq('branch_id', branchId)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      return logApiError('api/admin/inventory.query', error, {
        message: 'Gagal memuat inventaris.',
      });
    }

    return apiData(data ?? []);
  } catch (error: unknown) {
    return logApiError('api/admin/inventory', error, {
      message: 'Gagal memuat inventaris.',
    });
  }
}
