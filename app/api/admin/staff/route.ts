import { NextResponse } from 'next/server';
import { createClient } from '@/lib/admin/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } }, { status: 401 });
  }
  const { data: role, error: roleErr } = await supabase.rpc('current_user_role');
  if (roleErr || role !== 'owner') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Hanya owner.' } }, { status: 403 });
  }

  // List all profiles (owner + staff)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal memuat staff.' } },
      { status: 500 }
    );
  }
  return NextResponse.json({ data });
}
