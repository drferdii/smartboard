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

    const { data, error } = await supabase
      .from('customers')
      .select('id, phone, name, points, total_visits, total_spent, last_visit')
      .order('points', { ascending: false });

    if (error) {
      return logApiError('api/admin/customers.query', error, {
        message: 'Gagal memuat pelanggan.',
      });
    }

    return apiData(data ?? []);
  } catch (error: unknown) {
    return logApiError('api/admin/customers', error, {
      message: 'Gagal memuat pelanggan.',
    });
  }
}
