import { NextResponse } from 'next/server';
import { createClient } from '@/lib/admin/supabase/server';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } }, { status: 401 });
  }
  const { data: role, error: roleErr } = await supabase.rpc('current_user_role');
  if (roleErr || role !== 'owner') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Hanya owner.' } }, { status: 403 });
  }

  // Don't let owner deactivate themselves
  if (id === user.id) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Tidak bisa menonaktifkan akun sendiri.' } },
      { status: 403 }
    );
  }

  // Soft deactivate: set is_active=false
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal menonaktifkan.' } },
      { status: 500 }
    );
  }
  return NextResponse.json({ data: { id, deactivated: true } });
}
