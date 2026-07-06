/**
 * tests/admin/routes/menu.test.ts
 *
 * Test GET/POST /api/admin/menu — kelola menu.
 * POST: owner-only, validasi schema.
 * GET: default hanya aktif.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
vi.mock('@/lib/admin/supabase/server', () => ({
  createClient: createClientMock,
}))

// ─── Query builder inspectable ─────────────────────────────────────────────
function buildQuery<T>(result: T) {
  const b = {
    select: vi.fn(() => b),
    insert: vi.fn(() => b),
    update: vi.fn(() => b),
    order: vi.fn(() => b),
    eq: vi.fn(() => b),
    single: vi.fn().mockResolvedValue(result),
    then: (onFulfilled: (v: T) => unknown, onRejected?: (r: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  }
  return b
}

// ─── Supabase stubs ─────────────────────────────────────────────────────────
function makeOwnerSupabase() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'owner-1' } },
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: 'owner', error: null }),
    from: vi.fn(() => buildQuery({ data: [], error: null })),
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
    from: vi.fn(() => buildQuery({ data: [], error: null })),
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
describe('POST /api/admin/menu — tambah menu baru', () => {
  it('menolak request tanpa autentikasi (401)', async () => {
    createClientMock.mockResolvedValue(makeUnauthSupabase())
    const { POST } = await import('@/app/api/admin/menu/route')

    const response = await POST(
      new Request('http://localhost/api/admin/menu', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHORIZED')
  })

  it('menolak akses dari staff (403 FORBIDDEN)', async () => {
    createClientMock.mockResolvedValue(makeStaffSupabase())
    const { POST } = await import('@/app/api/admin/menu/route')

    const response = await POST(
      new Request('http://localhost/api/admin/menu', {
        method: 'POST',
        body: JSON.stringify({ name: 'Menu Baru', price_cents: 20_000_00 }),
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(403)
    expect(payload.error.code).toBe('FORBIDDEN')
  })

  it('menolak body tidak valid dari owner — nama kosong (400)', async () => {
    createClientMock.mockResolvedValue(makeOwnerSupabase())
    const { POST } = await import('@/app/api/admin/menu/route')

    const response = await POST(
      new Request('http://localhost/api/admin/menu', {
        method: 'POST',
        body: JSON.stringify({ name: '', price_cents: 20_000_00 }),
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error.code).toBe('VALIDATION_ERROR')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
describe('GET /api/admin/menu — daftar menu', () => {
  it('menolak request tanpa autentikasi (401)', async () => {
    createClientMock.mockResolvedValue(makeUnauthSupabase())
    const { GET } = await import('@/app/api/admin/menu/route')

    const response = await GET(new Request('http://localhost/api/admin/menu'))
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHORIZED')
  })

  it('memfilter hanya item aktif secara default', async () => {
    const menuQuery = buildQuery({ data: [], error: null })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
      rpc: vi.fn().mockResolvedValue({ data: 'staff', error: null }),
      from: vi.fn(() => menuQuery),
    })

    const { GET } = await import('@/app/api/admin/menu/route')
    await GET(new Request('http://localhost/api/admin/menu'))

    // Route: .eq('is_active', true) harus dipanggil untuk filter default
    expect(menuQuery.eq).toHaveBeenCalledWith('is_active', true)
  })
})
