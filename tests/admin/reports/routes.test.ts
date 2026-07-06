import { beforeEach, describe, expect, it, vi } from 'vitest';

const createClientMock = vi.fn();
const requireActiveUserMock = vi.fn();
const requireRoleMock = vi.fn();

vi.mock('@/lib/admin/supabase/server', () => ({
  createClient: createClientMock,
}));

vi.mock('@/lib/admin/auth', () => ({
  requireActiveUser: requireActiveUserMock,
  requireRole: requireRoleMock,
}));

function createResolvedQuery<T>(result: T) {
  const builder = {
    select: () => builder,
    gte: () => builder,
    lte: () => builder,
    lt: () => builder,
    eq: () => builder,
    order: () => builder,
    then: (onFulfilled: (value: T) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };

  return builder;
}

function createInspectableQuery<T>(result: T) {
  const builder = {
    select: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    lt: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    then: (onFulfilled: (value: T) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };

  return builder;
}

beforeEach(() => {
  createClientMock.mockReset();
  requireActiveUserMock.mockReset();
  requireRoleMock.mockReset();

  requireActiveUserMock.mockResolvedValue({
    ok: true,
    user: { id: 'owner-1' },
    profile: { id: 'owner-1', full_name: 'Chief', role: 'owner', is_active: true },
  });
  requireRoleMock.mockReturnValue(null);
});

describe('daily report route', () => {
  it('fails closed when transaction query errors', async () => {
    createClientMock.mockResolvedValue({
      from: (table: string) => {
        if (table === 'transactions') {
          return createResolvedQuery({
            data: null,
            error: new Error('db down'),
          });
        }

        return createResolvedQuery({
          data: [],
          error: null,
        });
      },
    });

    const { GET } = await import('@/app/api/admin/reports/daily/route');
    const response = await GET(new Request('http://localhost/api/admin/reports/daily?date=2026-07-05'));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error.message).toContain('Rangkuman harian belum tersedia');
  });

  it('counts only paid transactions in financial summary', async () => {
    createClientMock.mockResolvedValue({
      from: (table: string) => {
        if (table === 'transactions') {
          return createResolvedQuery({
            data: [
              {
                id: 'tx-paid',
                total_cents: 150_000,
                paid_cents: 150_000,
                change_cents: 0,
                created_at: '2026-07-05T09:00:00.000Z',
              },
              {
                id: 'tx-pending',
                total_cents: 90_000,
                paid_cents: 20_000,
                change_cents: 0,
                created_at: '2026-07-05T10:00:00.000Z',
              },
            ],
            error: null,
          });
        }

        return createResolvedQuery({
          data: [
            {
              id: 'exp-1',
              category: 'operasional',
              amount_cents: 50_000,
            },
          ],
          error: null,
        });
      },
    });

    const { GET } = await import('@/app/api/admin/reports/daily/route');
    const response = await GET(new Request('http://localhost/api/admin/reports/daily?date=2026-07-05'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.transaction_count).toBe(1);
    expect(payload.data.revenue_cents).toBe(150_000);
    expect(payload.data.profit_cents).toBe(100_000);
    expect(payload.data.transactions).toHaveLength(1);
  });

  it('uses business-timezone boundaries for daily transaction range', async () => {
    const txQuery = createInspectableQuery({
      data: [],
      error: null,
    });

    createClientMock.mockResolvedValue({
      from: (table: string) => {
        if (table === 'transactions') {
          return txQuery;
        }

        return createResolvedQuery({
          data: [],
          error: null,
        });
      },
    });

    const { GET } = await import('@/app/api/admin/reports/daily/route');
    const response = await GET(new Request('http://localhost/api/admin/reports/daily?date=2026-07-05'));

    expect(response.status).toBe(200);
    expect(txQuery.gte).toHaveBeenCalledWith('created_at', '2026-07-05T00:00:00+07:00');
    expect(txQuery.lt).toHaveBeenCalledWith('created_at', '2026-07-06T00:00:00+07:00');
  });
});

describe('monthly report route', () => {
  it('buckets paid transactions by business date, not raw UTC date', async () => {
    createClientMock.mockResolvedValue({
      from: (table: string) => {
        if (table === 'transactions') {
          return createResolvedQuery({
            data: [
              {
                id: 'tx-1',
                total_cents: 150_000,
                paid_cents: 150_000,
                change_cents: 0,
                created_at: '2026-07-05T17:30:00.000Z',
              },
            ],
            error: null,
          });
        }

        return createResolvedQuery({
          data: [],
          error: null,
        });
      },
    });

    const { GET } = await import('@/app/api/admin/reports/monthly/route');
    const response = await GET(new Request('http://localhost/api/admin/reports/monthly?year=2026&month=7'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.daily_breakdown['2026-07-06']).toEqual({
      revenue_cents: 150_000,
      expense_cents: 0,
    });
  });
});

describe('report export route', () => {
  it('rejects outlet-scoped exports until expense data is outlet-aware', async () => {
    createClientMock.mockResolvedValue({});

    const { GET } = await import('@/app/api/admin/reports/export/route');
    const response = await GET(
      new Request('http://localhost/api/admin/reports/export?branchId=branch-1&from=2026-07-05&to=2026-07-05')
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error.code).toBe('REPORT_SCOPE_UNAVAILABLE');
  });

  it('rejects non-canonical export dates', async () => {
    createClientMock.mockResolvedValue({});

    const { GET } = await import('@/app/api/admin/reports/export/route');
    const response = await GET(
      new Request('http://localhost/api/admin/reports/export?from=2026-02-31&to=2026-02-31')
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe('VALIDATION_ERROR');
  });
});
