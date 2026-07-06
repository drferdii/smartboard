import { NextResponse } from 'next/server';
import { createClient } from '@/lib/admin/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from'); // YYYY-MM-DD
  const to = searchParams.get('to'); // YYYY-MM-DD
  const staffId = searchParams.get('staff_id');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);

  // RLS already enforces owner-all / staff-own — query will auto-filter.
  let query = supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (from) {
    query = query.gte('created_at', `${from}T00:00:00`);
  }
  if (to) {
    query = query.lte('created_at', `${to}T23:59:59.999`);
  }
  if (staffId) {
    query = query.eq('staff_id', staffId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal memuat transaksi.' } },
      { status: 500 }
    );
  }
  return NextResponse.json({ data });
}
