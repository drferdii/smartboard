import { NextResponse } from 'next/server';
import { createClient } from '@/lib/admin/supabase/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } },
      { status: 401 }
    );
  }

  // RLS auto-enforces: owner sees all, staff sees own only.
  // Single .single() with items via FK relation works.
  const { data, error } = await supabase
    .from('transactions')
    .select('*, transaction_items(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Transaksi tidak ditemukan atau akses ditolak.' } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal memuat transaksi.' } },
      { status: 500 }
    );
  }
  return NextResponse.json({ data });
}
