import { NextResponse } from 'next/server';
import { createClient } from '@/lib/admin/supabase/server';
import { menuItemCreateSchema } from '@/lib/admin/schemas/menu';

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
  const includeInactive = searchParams.get('include_inactive') === 'true';

  let query = supabase.from('menu_items').select('*').order('category', { ascending: true }).order('name', { ascending: true });
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal memuat menu.' } },
      { status: 500 }
    );
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } },
      { status: 401 }
    );
  }

  // Check owner role (use current_user_role() function from migration 0001)
  const { data: roleData, error: roleErr } = await supabase.rpc('current_user_role');
  if (roleErr) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal cek role.' } },
      { status: 500 }
    );
  }
  if (roleData !== 'owner') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Akses ditolak. Hanya owner yang bisa menambah menu.' } },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = menuItemCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data tidak valid.',
          details: parsed.error.issues.map((i) => ({ path: i.path.join('.'), issue: i.message })),
        },
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      ...parsed.data,
      photo_url: parsed.data.photo_url || null,
      badge: parsed.data.badge || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal menambah menu.' } },
      { status: 500 }
    );
  }
  return NextResponse.json({ data }, { status: 201 });
}
