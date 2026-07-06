import { requireActiveUser } from '@/lib/admin/auth';
import { loadDashboardOverviewSummary } from '@/lib/admin/overview/summary';
import { createClient } from '@/lib/admin/supabase/server';
import { apiData, apiError, logApiError } from '@/lib/http/responses';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireActiveUser(supabase);
    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    const data = await loadDashboardOverviewSummary({
      branchId,
      canSelectBranch: auth.profile.role === 'owner',
      supabase,
    });

    return apiData(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_OVERVIEW_BRANCH') {
      return apiError(400, 'INVALID_BRANCH', 'Cabang dashboard tidak valid.');
    }

    return logApiError('api/admin/overview/summary', error, {
      message: 'Gagal memuat ringkasan dashboard.',
    });
  }
}
