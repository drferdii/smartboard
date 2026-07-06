import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/admin/supabase/server';
import { updateStatus } from '@/lib/admin/seo/recs';

const updateSchema = z.object({
  status: z.enum(['pending', 'applied', 'skipped']),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } }, { status: 401 });
  }
  const { data: role } = await supabase.rpc('current_user_role');
  if (role !== 'owner') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Hanya owner.' } }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Status tidak valid.' } },
      { status: 400 }
    );
  }

  const updated = updateStatus(id, parsed.data.status);
  if (!updated) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Rekomendasi tidak ditemukan.' } },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: updated });
}
