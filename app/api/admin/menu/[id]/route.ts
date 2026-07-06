import { NextResponse } from 'next/server';
import { createClient } from '@/lib/admin/supabase/server';
import { menuItemUpdateSchema } from '@/lib/admin/schemas/menu';

async function checkOwner(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: roleData, error: roleErr } = await supabase.rpc('current_user_role');
  if (roleErr) return false;
  return roleData === 'owner';
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } }, { status: 401 });
  }
  if (!(await checkOwner(supabase, user.id))) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Akses ditolak. Hanya owner.' } }, { status: 403 });
  }

  const body = await request.json();
  const parsed = menuItemUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data tidak valid.',
          details: parsed.error.issues,
        },
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('menu_items')
    .update({
      ...parsed.data,
      photo_url: parsed.data.photo_url || null,
      badge: parsed.data.badge || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: 'Gagal update menu.' } }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } }, { status: 401 });
  }
  if (!(await checkOwner(supabase, user.id))) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Akses ditolak. Hanya owner.' } }, { status: 403 });
  }

  // Soft delete: set is_active = false
  const { error } = await supabase
    .from('menu_items')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: 'Gagal hapus menu.' } }, { status: 500 });
  }
  return NextResponse.json({ data: { id, deleted: true } });
}
