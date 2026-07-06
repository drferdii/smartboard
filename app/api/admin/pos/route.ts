import { NextResponse } from 'next/server'

import { posCreateSchema } from '@/lib/admin/schemas/pos'
import { createClient } from '@/lib/admin/supabase/server'

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

  // Check role (owner or active staff)
  const { data: roleData, error: roleErr } = await supabase.rpc('current_user_role')
  if (roleErr) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal cek role.' } },
      { status: 500 }
    )
  }
  if (roleData !== 'owner' && roleData !== 'staff') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Akses ditolak.' } },
      { status: 403 }
    )
  }

  // Verify user is active
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_active')
    .eq('id', user.id)
    .single()
  if (!profile?.is_active) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Akun tidak aktif.' } },
      { status: 403 }
    )
  }

  // Parse + validate body
  const body = await request.json()
  const parsed = posCreateSchema.safeParse(body)
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
    )
  }

  const {
    items,
    paid_cents,
    note,
    customer_phone,
    branch_id,
    order_type,
    table_number,
    tax_enabled,
    service_enabled,
    happy_hour_active,
  } = parsed.data

  // Fetch menu items for snapshot
  const itemIds = items.map((i) => i.menu_item_id)
  const { data: menuItems, error: menuErr } = await supabase
    .from('menu_items')
    .select('id, name, price_cents, category, is_active')
    .in('id', itemIds)
  if (menuErr) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal ambil data menu.' } },
      { status: 500 }
    )
  }
  if (!menuItems || menuItems.length !== itemIds.length) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Salah satu menu item tidak ditemukan.' } },
      { status: 404 }
    )
  }
  if (menuItems.some((m) => !m.is_active)) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Salah satu menu item tidak aktif.' } },
      { status: 403 }
    )
  }

  // Build a map for quick lookup
  const menuMap = new Map(menuItems.map((m) => [m.id, m]))

  // Calculate subtotal
  let subtotalCents = 0
  const txItems = items.map((item) => {
    const menu = menuMap.get(item.menu_item_id)
    if (!menu) throw new Error('unreachable')

    // Calculate actual price snapshot with Happy Hour & Complimentary logic
    let priceSnapshot = menu.price_cents
    if (item.is_complimentary) {
      priceSnapshot = 0
    } else if (happy_hour_active && menu.category === 'minuman') {
      priceSnapshot = Math.round(menu.price_cents * 0.8)
    }

    const subtotal = priceSnapshot * item.quantity
    subtotalCents += subtotal

    return {
      menu_item_id: menu.id,
      name_snapshot: menu.name + (item.is_complimentary ? ' [KOMPLIMEN]' : ''),
      price_cents_snapshot: priceSnapshot,
      quantity: item.quantity,
      subtotal_cents: subtotal,
    }
  })

  // Calculate F&B Extra Charges (Taxes, Service Charge, Packaging)
  const packagingFeeCents = order_type === 'takeaway' ? 200000 : 0
  const taxCents = tax_enabled !== false ? Math.round(subtotalCents * 0.1) : 0
  const serviceChargeCents = service_enabled !== false ? Math.round(subtotalCents * 0.05) : 0

  const totalCents = subtotalCents + packagingFeeCents + taxCents + serviceChargeCents

  if (paid_cents < totalCents) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Uang dibayar kurang dari total.' } },
      { status: 400 }
    )
  }

  // --- NEW: CRM & LOYALTY ---
  let customerId = null
  if (customer_phone) {
    const { data: cust } = await supabase
      .from('customers')
      .select('id, points, total_visits, total_spent')
      .eq('phone', customer_phone)
      .single()
    if (cust) {
      customerId = cust.id
      // 1 point per Rp 10.000 (totalCents / 1,000,000 since it's cents)
      const pointsEarned = Math.floor(totalCents / 1000000)
      const currentPoints = cust.points ?? 0
      const currentVisits = cust.total_visits ?? 0
      const currentSpent = cust.total_spent ?? 0
      await supabase
        .from('customers')
        .update({
          points: currentPoints + pointsEarned,
          total_visits: currentVisits + 1,
          total_spent: currentSpent + totalCents / 100,
          last_visit: new Date().toISOString(),
        })
        .eq('id', cust.id)
    }
  }

  // Build enriched metadata to be saved in transaction note
  const extraMetadata = {
    order_type: order_type || 'dine_in',
    table_number: order_type === 'dine_in' ? table_number : undefined,
    tax_cents: taxCents,
    service_charge_cents: serviceChargeCents,
    packaging_fee_cents: packagingFeeCents,
    happy_hour: !!happy_hour_active,
    user_note: note || '',
  }
  const finalNote = JSON.stringify(extraMetadata)

  // Create transaction + items
  const { data: tx, error: txErr } = await supabase
    .from('transactions')
    .insert({
      staff_id: user.id,
      total_cents: totalCents,
      paid_cents,
      note: finalNote,
      customer_id: customerId,
      branch_id: branch_id || '00000000-0000-0000-0000-000000000001',
    })
    .select()
    .single()
  if (txErr) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal membuat transaksi.' } },
      { status: 500 }
    )
  }

  const { error: itemsInsertErr } = await supabase
    .from('transaction_items')
    .insert(txItems.map((i) => ({ ...i, transaction_id: tx.id })))
  if (itemsInsertErr) {
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Gagal membuat item transaksi.' } },
      { status: 500 }
    )
  }

  // --- NEW: INVENTORY DEDUCTION (COGS) ---
  const { data: recipes } = await supabase
    .from('recipes')
    .select('menu_item_id, inventory_id, quantity_required')
    .in('menu_item_id', itemIds)
  if (recipes && recipes.length > 0) {
    const hasInvalidRecipeBinding = txItems.some((item) =>
      recipes.some((recipe) => recipe.menu_item_id === item.menu_item_id && !recipe.inventory_id)
    )
    if (hasInvalidRecipeBinding) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFIG_ERROR',
            message:
              'Konfigurasi resep stok belum lengkap. Hubungi owner sebelum melanjutkan transaksi.',
          },
        },
        { status: 500 }
      )
    }

    const deductions = new Map<string, number>()
    for (const item of txItems) {
      const itemRecipes = recipes.filter(
        (r): r is typeof r & { inventory_id: string } =>
          r.menu_item_id === item.menu_item_id && typeof r.inventory_id === 'string'
      )
      for (const r of itemRecipes) {
        const current = deductions.get(r.inventory_id) || 0
        deductions.set(r.inventory_id, current + r.quantity_required * item.quantity)
      }
    }
    for (const [invId, qtyToDeduct] of deductions.entries()) {
      const { data: inv } = await supabase
        .from('inventory')
        .select('stock')
        .eq('id', invId)
        .single()
      if (inv) {
        await supabase
          .from('inventory')
          .update({ stock: inv.stock - qtyToDeduct })
          .eq('id', invId)
      }
    }
  }

  return NextResponse.json(
    {
      data: {
        ...tx,
        change_cents: paid_cents - totalCents,
        items: txItems,
      },
    },
    { status: 201 }
  )
}
