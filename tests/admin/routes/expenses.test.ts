/**
 * tests/admin/routes/expenses.test.ts
 *
 * Test GET/POST /api/admin/expenses — pengeluaran outlet (data keluar finansial).
 * Owner-only route dengan validasi schema.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { expenseCreateSchema } from '@/lib/admin/schemas/expense'

const createClientMock = vi.fn()
vi.mock('@/lib/admin/supabase/server', () => ({
  createClient: createClientMock,
}))

// ─── Query builder helper ───────────────────────────────────────────────────
function buildQuery<T>(result: T) {
  const b = {
    select: vi.fn(() => b),
    insert: vi.fn(() => b),
    order: vi.fn(() => b),
    limit: vi.fn(() => b),
    gte: vi.fn(() => b),
    lte: vi.fn(() => b),
    single: vi.fn().mockResolvedValue(result),
    then: (onFulfilled: (v: T) => unknown, onRejected?: (r: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  }
  return b
}

function makeOwnerSupabase(extra: Record<string, unknown> = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'owner-1' } },
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: 'owner', error: null }),
    from: vi.fn(() => buildQuery({ data: [], error: null })),
    ...extra,
  }
}

function makeStaffSupabase() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'staff-1' } },
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: 'staff', error: null }),
    from: vi.fn(),
  }
}

function makeUnauthSupabase() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: vi.fn(),
    rpc: vi.fn(),
  }
}

beforeEach(() => {
  createClientMock.mockReset()
  vi.resetModules()
})

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN 1: Schema validation
// ═══════════════════════════════════════════════════════════════════════════
describe('expenseCreateSchema — validasi pengeluaran', () => {
  it('menerima expense valid dengan semua field wajib', () => {
    const result = expenseCreateSchema.safeParse({
      category: 'operasional',
      amount_cents: 150_000_00,
      description: 'Beli bahan bakar',
      incurred_at: '2026-07-06',
    })
    expect(result.success).toBe(true)
  })

  it('menolak jika category tidak valid (bukan enum yang diizinkan)', () => {
    const result = expenseCreateSchema.safeParse({
      category: 'bukan_kategori',
      amount_cents: 50_000_00,
    })
    expect(result.success).toBe(false)
  })

  it('mengizinkan amount_cents nol tetapi menolak negatif', () => {
    const zero = expenseCreateSchema.safeParse({ category: 'operasional', amount_cents: 0 })
    const negative = expenseCreateSchema.safeParse({ category: 'operasional', amount_cents: -100 })
    expect(zero.success).toBe(true) // nonnegative → 0 valid
    expect(negative.success).toBe(false) // negatif ditolak
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// BAGIAN 2: HTTP boundary
// ═══════════════════════════════════════════════════════════════════════════
describe('GET /api/admin/expenses — data keluar pengeluaran', () => {
  it('menolak request tanpa autentikasi (401)', async () => {
    createClientMock.mockResolvedValue(makeUnauthSupabase())
    const { GET } = await import('@/app/api/admin/expenses/route')

    const response = await GET(new Request('http://localhost/api/admin/expenses'))
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHORIZED')
  })

  it('menolak akses dari non-owner (403 FORBIDDEN)', async () => {
    createClientMock.mockResolvedValue(makeStaffSupabase())
    const { GET } = await import('@/app/api/admin/expenses/route')

    const response = await GET(new Request('http://localhost/api/admin/expenses'))
    const payload = await response.json()

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
  })
})

describe('POST /api/admin/expenses — tambah pengeluaran', () => {
  it('menolak request tanpa autentikasi (401)', async () => {
    createClientMock.mockResolvedValue(makeUnauthSupabase())
    const { POST } = await import('@/app/api/admin/expenses/route')

    const response = await POST(
      new Request('http://localhost/api/admin/expenses', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHORIZED')
  })

  it('menolak body tidak valid dari owner (400)', async () => {
    createClientMock.mockResolvedValue(makeOwnerSupabase())
    const { POST } = await import('@/app/api/admin/expenses/route')

    const response = await POST(
      new Request('http://localhost/api/admin/expenses', {
        method: 'POST',
        body: JSON.stringify({ category: 'tidak_valid', amount_cents: -1 }),
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('VALIDATION_ERROR')
  })
})
