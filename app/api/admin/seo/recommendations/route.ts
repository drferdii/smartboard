import { NextResponse } from 'next/server';
import { createClient } from '@/lib/admin/supabase/server';
import { getAllRecommendations } from '@/lib/admin/seo/recs';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } }, { status: 401 });
  }
  const { data: role } = await supabase.rpc('current_user_role');
  if (role !== 'owner') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Hanya owner.' } }, { status: 403 });
  }

  const recs = getAllRecommendations();
  return NextResponse.json({ data: recs });
}
