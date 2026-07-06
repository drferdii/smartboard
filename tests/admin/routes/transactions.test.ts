/**
 * tests/admin/routes/transactions.test.ts
 *
 * Test GET /api/admin/transactions — data keluar transaksi.
 * Menggunakan vi.mock + vi.resetModules() + await import() per test.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.fn()
vi.mock('@/lib/admin/supabase/server', () => ({
  createClient: createClientMock,
}))

// ─── Query builder inspectable ─────────────────────────────────────────────
function createInspectableQuery<T>(result: T) {
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    then: (onFulfilled: (value: T) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  }
  return builder
}

beforeEach(() => {
  createClientMock.mockReset()
  vi.resetModules()
})

// ═══════════════════════════════════════════════════════════════════════════
describe('GET /api/admin/transactions — data keluar transaksi', () => {
  it('menolak request tanpa autentikasi (401)', async () => {
    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: vi.fn(),
    })

    const { GET } = await import('@/app/api/admin/transactions/route')
    const response = await GET(new Request('http://localhost/api/admin/transactions'))
    const payload = await response.json()

    expect(response.status).toBe(401)
    expect(payload.error.code).toBe('UNAUTHORIZED')
  })

  it('membatasi limit maksimum ke 200 meskipun request meminta lebih', async () => {
    const txQuery = createInspectableQuery({ data: [], error: null })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
      from: vi.fn(() => txQuery),
    })

    const { GET } = await import('@/app/api/admin/transactions/route')
    await GET(new Request('http://localhost/api/admin/transactions?limit=9999'))

    // Route: Math.min(parseInt(limit ?? '50'), 200) → 200
    expect(txQuery.limit).toHaveBeenCalledWith(200)
  })

  it('menerapkan filter tanggal dari/ke ketika query param tersedia', async () => {
    const txQuery = createInspectableQuery({ data: [], error: null })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
      from: vi.fn(() => txQuery),
    })

    const { GET } = await import('@/app/api/admin/transactions/route')
    await GET(new Request('http://localhost/api/admin/transactions?from=2026-07-01&to=2026-07-05'))

    expect(txQuery.gte).toHaveBeenCalledWith('created_at', '2026-07-01T00:00:00')
    expect(txQuery.lte).toHaveBeenCalledWith('created_at', '2026-07-05T23:59:59.999')
  })

  it('mengembalikan 500 ketika query database gagal', async () => {
    const errorQuery = createInspectableQuery({
      data: null,
      error: new Error('koneksi gagal'),
    })

    createClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
      from: vi.fn(() => errorQuery),
    })

    const { GET } = await import('@/app/api/admin/transactions/route')
    const response = await GET(new Request('http://localhost/api/admin/transactions'))
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload.error.code).toBe('DB_ERROR')
  })
})
