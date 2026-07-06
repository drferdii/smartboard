import { NextResponse } from 'next/server';
import { createClient } from '@/lib/admin/supabase/server';
import { expenseCreateSchema } from '@/lib/admin/schemas/expense';

async function requireOwner(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: role, error } = await supabase.rpc('current_user_role');
  if (error) return { ok: false as const, status: 500, message: 'Gagal cek role.' };
  if (role !== 'owner') return { ok: false as const, status: 403, message: 'Akses ditolak. Hanya owner.' };
  return { ok: true as const };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } },
      { status: 401 }
    );
  }
  const guard = await requireOwner(supabase);
  if (!guard.ok) {
    return NextResponse.json(
      { error: { code: guard.status === 403 ? 'FORBIDDEN' : 'DB_ERROR', message: guard.message } },
      { status: guard.status }
    );
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500);

  let query = supabase
    .from('expenses')
    .select('*')
    .order('incurred_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (from) query = query.gte('incurred_at', from);
  if (to) query = query.lte('incurred_at', to);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal memuat expenses.' } },
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
  const guard = await requireOwner(supabase);
  if (!guard.ok) {
    return NextResponse.json(
      { error: { code: guard.status === 403 ? 'FORBIDDEN' : 'DB_ERROR', message: guard.message } },
      { status: guard.status }
    );
  }

  const body = await request.json();
  const parsed = expenseCreateSchema.safeParse(body);
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

  const { category, amount_cents, description, incurred_at } = parsed.data;

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      category,
      amount_cents,
      description: description || null,
      incurred_at: incurred_at ?? new Date().toISOString().slice(0, 10),
      incurred_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal menambah expense.' } },
      { status: 500 }
    );
  }
  return NextResponse.json({ data }, { status: 201 });
}
