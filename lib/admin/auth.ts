import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database, UserRole } from '@/lib/admin/supabase/types';
import { apiError } from '@/lib/http/responses';

type AdminSupabase = SupabaseClient<Database>;

export type ActiveProfile = {
  id: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
};

export async function requireActiveUser(
  supabase: AdminSupabase
): Promise<
  | { ok: true; user: User; profile: ActiveProfile }
  | { ok: false; response: Response }
> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      response: apiError(401, 'UNAUTHORIZED', 'Sesi habis.'),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      ok: false,
      response: apiError(403, 'FORBIDDEN', 'Profil pengguna tidak valid.'),
    };
  }

  if (!profile.is_active) {
    return {
      ok: false,
      response: apiError(403, 'FORBIDDEN', 'Akun tidak aktif.'),
    };
  }

  return {
    ok: true,
    user,
    profile,
  };
}

export function requireRole(
  profile: ActiveProfile,
  allowedRoles: UserRole[]
): Response | null {
  if (!allowedRoles.includes(profile.role)) {
    return apiError(403, 'FORBIDDEN', 'Akses ditolak.');
  }

  return null;
}
