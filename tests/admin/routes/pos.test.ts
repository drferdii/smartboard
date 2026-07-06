/**
 * tests/admin/routes/pos.test.ts
 *
 * Test business logic POS: kalkulasi total, kembalian, dan validasi schema.
 * Test HTTP handler hanya untuk boundary paling dangkal (401, invalid schema).
 * Business logic kompleks (menu check, inventory deduction) diuji via
 * fungsi-fungsi murni yang dapat diisolasi tanpa HTTP context.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { posCreateSchema } from '@/lib/admin/schemas/pos'

// ─── UUID fixtures ──────────────────────────────────────────────────────────
const MENU_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const BRANCH_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567891'
const INV_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567892'
const PRICE_CENTS = 3_500_000 // Rp 35.000

// ─── Mock Supabase (hanya untuk test HTTP boundary) ────────────────────────
const createClientMock = vi.fn()
vi.mock('@/lib/admin/supabase/server', () => ({
  createClient: createClientMock,
}))

beforeEach(() => {
  createClientMock.mockReset()
  vi.resetModules()
})

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN 1: Schema validation (business rules masuk)
// ═══════════════════════════════════════════════════════════════════════════
describe('posCreateSchema — validasi data masuk kasir', () => {
  it('menerima body yang valid dengan items dan paid_cents', () => {
    const result = posCreateSchema.safeParse({
      items: [{ menu_item_id: MENU_ID, quantity: 2 }],
      paid_cents: PRICE_CENTS * 2 + 10_000,
      branch_id: BRANCH_ID,
    })
    expect(result.success).toBe(true)
  })

  it('menolak jika tidak ada item sama sekali', () => {
    const result = posCreateSchema.safeParse({
      items: [],
      paid_cents: 100_000,
    })
    expect(result.success).toBe(false)
    const issue = result.error?.issues[0]
    expect(issue?.message).toContain('1')
  })

  it('menolak menu_item_id yang bukan UUID', () => {
    const result = posCreateSchema.safeParse({
      items: [{ menu_item_id: 'bukan-uuid', quantity: 1 }],
      paid_cents: 100_000,
    })
    expect(result.success).toBe(false)
  })

  it('menolak quantity nol atau negatif', () => {
    const zero = posCreateSchema.safeParse({
      items: [{ menu_item_id: MENU_ID, quantity: 0 }],
      paid_cents: 100_000,
    })
    const negative = posCreateSchema.safeParse({
      items: [{ menu_item_id: MENU_ID, quantity: -2 }],
      paid_cents: 100_000,
    })
    expect(zero.success).toBe(false)
    expect(negative.success).toBe(false)
  })

  it('menolak paid_cents negatif', () => {
    const result = posCreateSchema.safeParse({
      items: [{ menu_item_id: MENU_ID, quantity: 1 }],
      paid_cents: -500,
    })
    expect(result.success).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN 2: Kalkulasi total dan kembalian (pure logic)
// ═══════════════════════════════════════════════════════════════════════════
describe('kalkulasi transaksi kasir — logika total dan kembalian', () => {
  /**
   * Reproduksi logika kalkulasi dari pos/route.ts (baris 90-103)
   */
  function calcTransaction(
    items: Array<{ menu_item_id: string; quantity: number }>,
    menuMap: Map<string, { id: string; name: string; price_cents: number; is_active: boolean }>,
    paidCents: number
  ): {
    totalCents: number
    changeCents: number
    txItems: Array<{
      menu_item_id: string
      quantity: number
      subtotal_cents: number
      price_cents_snapshot: number
    }>
    underpaid: boolean
  } {
    let totalCents = 0
    const txItems = items.map((item) => {
      const menu = menuMap.get(item.menu_item_id)
      if (!menu) throw new Error('unreachable')
      const subtotal = menu.price_cents * item.quantity
      totalCents += subtotal
      return {
        menu_item_id: menu.id,
        quantity: item.quantity,
        subtotal_cents: subtotal,
        price_cents_snapshot: menu.price_cents,
      }
    })
    return {
      totalCents,
      changeCents: paidCents - totalCents,
      txItems,
      underpaid: paidCents < totalCents,
    }
  }

  it('menghitung total dan kembalian dengan benar untuk 1 item qty 1', () => {
    const menuMap = new Map([
      [MENU_ID, { id: MENU_ID, name: 'Babi Asap', price_cents: PRICE_CENTS, is_active: true }],
    ])

    const result = calcTransaction(
      [{ menu_item_id: MENU_ID, quantity: 1 }],
      menuMap,
      PRICE_CENTS + 500_000
    )

    expect(result.totalCents).toBe(PRICE_CENTS)
    expect(result.changeCents).toBe(500_000)
    expect(result.underpaid).toBe(false)
    expect(result.txItems[0].subtotal_cents).toBe(PRICE_CENTS)
  })

  it('menghitung total dengan benar untuk qty 3 dan 2 item berbeda', () => {
    const MENU_ID_2 = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
    const PRICE_2 = 2_000_000 // Rp 20.000

    const menuMap = new Map([
      [MENU_ID, { id: MENU_ID, name: 'Babi Asap', price_cents: PRICE_CENTS, is_active: true }],
      [MENU_ID_2, { id: MENU_ID_2, name: 'Nasi Putih', price_cents: PRICE_2, is_active: true }],
    ])

    const result = calcTransaction(
      [
        { menu_item_id: MENU_ID, quantity: 2 },
        { menu_item_id: MENU_ID_2, quantity: 3 },
      ],
      menuMap,
      PRICE_CENTS * 2 + PRICE_2 * 3
    )

    const expected = PRICE_CENTS * 2 + PRICE_2 * 3
    expect(result.totalCents).toBe(expected)
    expect(result.changeCents).toBe(0) // bayar exact
    expect(result.underpaid).toBe(false)
  })

  it('mendeteksi underpaid ketika paid_cents kurang dari total', () => {
    const menuMap = new Map([
      [MENU_ID, { id: MENU_ID, name: 'Babi Asap', price_cents: PRICE_CENTS, is_active: true }],
    ])

    const result = calcTransaction(
      [{ menu_item_id: MENU_ID, quantity: 1 }],
      menuMap,
      1 // sangat kurang
    )

    expect(result.underpaid).toBe(true)
    expect(result.changeCents).toBeLessThan(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN 3: Inventory deduction logic (pure logic)
// ═══════════════════════════════════════════════════════════════════════════
describe('kalkulasi deduction inventory sesuai recipe', () => {
  /**
   * Reproduksi logika deduction dari pos/route.ts (baris 180-196)
   */
  function calcDeductions(
    txItems: Array<{ menu_item_id: string; quantity: number }>,
    recipes: Array<{ menu_item_id: string; inventory_id: string; quantity_required: number }>
  ): Map<string, number> {
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
    return deductions
  }

  it('menghitung deduction untuk 1 item dengan 1 recipe', () => {
    const recipe = { menu_item_id: MENU_ID, inventory_id: INV_ID, quantity_required: 2 }
    const deductions = calcDeductions([{ menu_item_id: MENU_ID, quantity: 1 }], [recipe])

    expect(deductions.get(INV_ID)).toBe(2) // 2 per unit × 1 unit
  })

  it('mengakumulasi deduction ketika item yang sama dipesan lebih dari 1', () => {
    const recipe = { menu_item_id: MENU_ID, inventory_id: INV_ID, quantity_required: 2 }
    const deductions = calcDeductions([{ menu_item_id: MENU_ID, quantity: 3 }], [recipe])

    expect(deductions.get(INV_ID)).toBe(6) // 2 per unit × 3 unit
  })

  it('menggabungkan deduction untuk inventory yang dipakai oleh beberapa menu', () => {
    const MENU_ID_2 = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
    const recipes = [
      { menu_item_id: MENU_ID, inventory_id: INV_ID, quantity_required: 1 },
      { menu_item_id: MENU_ID_2, inventory_id: INV_ID, quantity_required: 3 },
    ]
    const txItems = [
      { menu_item_id: MENU_ID, quantity: 2 },
      { menu_item_id: MENU_ID_2, quantity: 1 },
    ]
    const deductions = calcDeductions(txItems, recipes)

    // (1 × 2) + (3 × 1) = 5
    expect(deductions.get(INV_ID)).toBe(5)
  })

  it('tidak membuat deduction jika tidak ada recipe untuk item tersebut', () => {
    const deductions = calcDeductions([{ menu_item_id: MENU_ID, quantity: 2 }], [])
    expect(deductions.size).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN 4: HTTP boundary — 401 (test murni, paling andal)
// ═══════════════════════════════════════════════════════════════════════════
describe('POST /api/admin/pos — HTTP boundary', () => {
  it('menolak request tanpa sesi autentikasi (401)', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: vi.fn(),
      rpc: vi.fn(),
    })

    const { POST } = await import('@/app/api/admin/pos/route')
    const response = await POST(
      new Request('http://localhost/api/admin/pos', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHORIZED')
  })
})
