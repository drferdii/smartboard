import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mock Supabase server client ───────────────────────────────────────────
const createClientMock = vi.fn()

vi.mock('@/lib/admin/supabase/server', () => ({
  createClient: createClientMock,
}))

// ─── Query builder helpers ──────────────────────────────────────────────────
function buildQuery<T>(result: T) {
  const builder = {
    insert: () => builder,
    select: () => builder,
    single: () => Promise.resolve(result),
  }
  return builder
}

// ─── Default supabase stub (authenticated) ─────────────────────────────────
function makeSupabase(fromImpl: (table: string) => unknown) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'owner-uid-1' } },
      }),
    },
    from: vi.fn(fromImpl),
  }
}

beforeEach(() => {
  vi.resetModules()
  createClientMock.mockReset()
})

// ═══════════════════════════════════════════════════════════════════════════
describe('POST /api/admin/branches — validasi nama outlet', () => {
  it('menolak request dengan nama kosong (string kosong)', async () => {
    createClientMock.mockResolvedValue(makeSupabase(() => buildQuery({ data: null, error: null })))

    const { POST } = await import('@/app/api/admin/branches/route')
    const response = await POST(
      new Request('http://localhost/api/admin/branches', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toContain('wajib')
  })

  it('menolak request dengan nama yang hanya spasi', async () => {
    createClientMock.mockResolvedValue(makeSupabase(() => buildQuery({ data: null, error: null })))

    const { POST } = await import('@/app/api/admin/branches/route')
    const response = await POST(
      new Request('http://localhost/api/admin/branches', {
        method: 'POST',
        body: JSON.stringify({ name: '   ' }),
        headers: { 'Content-Type': 'application/json' },
      })
    )

    expect(response.status).toBe(400)
  })

  it('membuat branch baru dan mengembalikan data ketika nama valid', async () => {
    const branchData = {
      id: 'branch-uuid-1',
      name: 'Pusat Bengkayang',
      address: null,
    }
    createClientMock.mockResolvedValue(
      makeSupabase(() => buildQuery({ data: branchData, error: null }))
    )

    const { POST } = await import('@/app/api/admin/branches/route')
    const response = await POST(
      new Request('http://localhost/api/admin/branches', {
        method: 'POST',
        body: JSON.stringify({ name: 'Pusat Bengkayang' }),
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.id).toBe('branch-uuid-1')
    expect(payload.name).toBe('Pusat Bengkayang')
  })

  it('mengembalikan 500 ketika Supabase insert gagal', async () => {
    createClientMock.mockResolvedValue(
      makeSupabase(() => buildQuery({ data: null, error: { message: 'duplicate key' } }))
    )

    const { POST } = await import('@/app/api/admin/branches/route')
    const response = await POST(
      new Request('http://localhost/api/admin/branches', {
        method: 'POST',
        body: JSON.stringify({ name: 'Outlet Baru' }),
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload.error).toContain('duplicate key')
  })
})
