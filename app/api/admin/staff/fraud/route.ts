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
      .from('fraud_logs')
      .select('id, action_type, description, created_at, profiles:user_id(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      return logApiError('api/admin/staff/fraud.query', error, {
        message: 'Gagal memuat log keamanan staf.',
      });
    }

    return apiData(data ?? []);
  } catch (error: unknown) {
    return logApiError('api/admin/staff/fraud', error, {
      message: 'Gagal memuat log keamanan staf.',
    });
  }
}
