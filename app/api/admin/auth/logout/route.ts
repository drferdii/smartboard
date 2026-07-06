import { NextResponse } from 'next/server';
import { createClient } from '@/lib/admin/supabase/server';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
