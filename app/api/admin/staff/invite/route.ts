import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient, createAdminClient } from '@/lib/admin/supabase/server'

const inviteSchema = z.object({
  email: z.string().email('Email tidak valid'),
  full_name: z.string().min(1, 'Nama wajib diisi').max(100),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Sesi habis.' } },
      { status: 401 }
    )
  }
  const { data: role, error: roleErr } = await supabase.rpc('current_user_role')
  if (roleErr || role !== 'owner') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Hanya owner.' } },
      { status: 403 }
    )
  }

  const body = await request.json()
  const parsed = inviteSchema.safeParse(body)
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
    )
  }

  const adminSupabase = await createAdminClient()

  // Invite user via Supabase admin API
  const { data: invited, error: inviteErr } = await adminSupabase.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: { full_name: parsed.data.full_name, role: 'staff' },
      // The handle_new_user trigger will create the profile with role='staff' fallback
    }
  )

  if (inviteErr) {
    return NextResponse.json(
      { error: { code: 'INVITE_ERROR', message: inviteErr.message } },
      { status: 400 }
    )
  }

  // Wait briefly for the trigger to fire and create the profile
  // (the trigger uses NEW.raw_user_meta_data → fallback to 'staff' if not set)
  await new Promise((r) => setTimeout(r, 1500))

  // Verify the profile was created (or create it manually as fallback)
  const { data: existingProfile } = await adminSupabase
    .from('profiles')
    .select('id, role')
    .eq('id', invited.user.id)
    .maybeSingle()

  if (!existingProfile) {
    // Fallback: create profile manually
    await adminSupabase.from('profiles').insert({
      id: invited.user.id,
      full_name: parsed.data.full_name,
      role: 'staff',
      is_active: true,
    })
  }

  return NextResponse.json(
    { data: { id: invited.user.id, email: invited.user.email } },
    { status: 201 }
  )
}
