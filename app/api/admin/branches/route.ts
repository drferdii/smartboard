import { NextResponse } from 'next/server'

import { createClient } from '@/lib/admin/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { name, address } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama outlet wajib diisi.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('branches')
      .insert({
        name: name.trim(),
        address: address?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
