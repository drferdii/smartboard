import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/admin/supabase/types';
import type { DashboardOverviewData } from '@/lib/admin/overview/contracts';
import {
  buildFreshnessLabel,
  buildOverviewKpis,
  buildOverviewTopbarStatus,
} from '@/lib/admin/overview/view-model';
import {
  buildCustomerSatisfactionUnavailable,
  buildOperationalStatus,
  calculateAveragePurchaseCents,
  calculateMetricDelta,
  fetchWeather,
  loadDashboardOverviewSummary,
  summarizePaidTransactions,
} from '@/lib/admin/overview/summary';

function createResolvedQuery<T>(result: T) {
  const builder = {
    select: () => builder,
    order: () => builder,
    gte: () => builder,
    lt: () => builder,
    eq: () => builder,
    in: () => builder,
    then: (onFulfilled: (value: T) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };

  return builder;
}

describe('summarizePaidTransactions', () => {
  it('only includes paid transactions in sales and count', () => {
    const result = summarizePaidTransactions([
      { id: 'tx-1', total_cents: 150_000, paid_cents: 150_000 },
      { id: 'tx-2', total_cents: 75_000, paid_cents: 90_000 },
      { id: 'tx-3', total_cents: 40_000, paid_cents: 20_000 },
    ]);

    expect(result.salesTodayCents).toBe(225_000);
    expect(result.transactionCount).toBe(2);
    expect(result.transactionIdsIncluded).toEqual(['tx-1', 'tx-2']);
  });
});

describe('calculateAveragePurchaseCents', () => {
  it('returns rounded average when transactions exist', () => {
    expect(calculateAveragePurchaseCents(225_000, 2)).toBe(112_500);
  });

  it('returns null for zero transaction case', () => {
    expect(calculateAveragePurchaseCents(0, 0)).toBeNull();
  });
});

describe('calculateMetricDelta', () => {
  it('returns unavailable state when previous period is missing', () => {
    const result = calculateMetricDelta(100, 0);

    expect(result.percentageChange).toBeNull();
    expect(result.unavailableReason).toContain('pembanding');
  });
});

describe('buildOperationalStatus', () => {
  it('reports unknown when cashier connection is not configured', () => {
    const result = buildOperationalStatus({
      cashierConnection: {
        status: 'not_configured',
        provider: 'supabase-transactions',
      },
      weather: {
        location: 'Bengkayang',
        source: 'open-meteo',
        unavailableReason: 'Cuaca tidak tersedia',
      },
      inventoryStatus: {
        coveragePercent: null,
        lowStockCount: null,
        totalTrackedItems: null,
        source: 'inventory',
        unavailableReason: 'Inventaris belum tersedia',
      },
    });

    expect(result.status).toBe('unknown');
    expect(result.reason).toContain('belum dikonfigurasi');
  });

  it('drops to warning when inventory data is unavailable', () => {
    const result = buildOperationalStatus({
      cashierConnection: {
        status: 'connected',
        provider: 'supabase-transactions',
      },
      weather: {
        location: 'Bengkayang',
        source: 'open-meteo',
      },
      inventoryStatus: {
        coveragePercent: null,
        lowStockCount: null,
        totalTrackedItems: null,
        source: 'inventory',
        unavailableReason: 'Data inventaris belum tersedia saat ini.',
      },
    });

    expect(result.status).toBe('warning');
    expect(result.reason).toContain('inventaris belum tersedia');
  });
});

describe('fetchWeather', () => {
  it('returns unavailable state when provider request fails', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 503 })) as unknown as typeof fetch;

    const result = await fetchWeather(
      fetchImpl,
      {
        WEATHER_PROVIDER: 'open-meteo',
        WEATHER_LATITUDE: '0.8312772',
        WEATHER_LONGITUDE: '109.4858797',
        WEATHER_LOCATION_NAME: 'Bengkayang',
      },
      '2026-07-05T12:00:00.000Z'
    );

    expect(result.weather.unavailableReason).toContain('Cuaca live untuk outlet ini belum tersedia');
  });

  it('falls back to Bengkayang coordinates when weather coordinates are not configured', async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const url = new URL(requestUrl);

      expect(url.searchParams.get('latitude')).toBe('0.8312772');
      expect(url.searchParams.get('longitude')).toBe('109.4858797');

      return new Response(
        JSON.stringify({
          current: {
            temperature_2m: 26,
            relative_humidity_2m: 88,
            weather_code: 61,
            wind_speed_10m: 12,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }) as unknown as typeof fetch;

    const result = await fetchWeather(
      fetchImpl,
      {
        WEATHER_PROVIDER: 'open-meteo',
        WEATHER_LOCATION_NAME: 'Bengkayang',
      },
      '2026-07-05T12:00:00.000Z',
      {
        latitude: '0.8312772',
        longitude: '109.4858797',
        location: 'Bengkayang',
      }
    );

    expect(result.weather.location).toBe('Bengkayang');
    expect(result.weather.temperature).toBe(26);
  });

  it('returns unavailable state when outlet coordinates are missing and no fallback exists', async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;

    const result = await fetchWeather(
      fetchImpl,
      {
        WEATHER_PROVIDER: 'open-meteo',
        WEATHER_LOCATION_NAME: 'Outlet Uji',
      },
      '2026-07-05T12:00:00.000Z'
    );

    expect(result.weather.unavailableReason).toContain('Koordinat cuaca outlet ini belum diatur');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('buildCustomerSatisfactionUnavailable', () => {
  it('returns explicit unavailable metadata when no source exists', () => {
    const result = buildCustomerSatisfactionUnavailable();

    expect(result.value).toBeNull();
    expect(result.unavailableReason).toContain('belum terintegrasi');
  });
});

describe('loadDashboardOverviewSummary', () => {
  it('fails closed when Supabase config is placeholder', async () => {
    const fakeSupabase = {
      from: vi.fn(() => {
        throw new Error('should not query');
      }),
    } as unknown as SupabaseClient<Database>;

    const result = await loadDashboardOverviewSummary({
      supabase: fakeSupabase,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder-project.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-anon-key',
        WEATHER_LOCATION_NAME: 'Bengkayang',
      },
      now: new Date('2026-07-05T10:00:00.000Z'),
    });

    expect(result.cashierConnection.status).toBe('not_configured');
    expect(result.salesToday.amountCents).toBeNull();
    expect(result.recentTransactions).toEqual([]);
  });

  it('does not reuse Bengkayang weather coordinates for non-default outlets', async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const fakeSupabase = {
      from: (table: string) => {
        if (table === 'branches') {
          return createResolvedQuery({
            data: [
              { id: '00000000-0000-0000-0000-000000000001', name: 'Pusat Bengkayang' },
              { id: 'branch-2', name: 'Outlet Singkawang' },
            ],
            error: null,
          });
        }

        return createResolvedQuery({
          data: [],
          error: null,
        });
      },
    } as unknown as SupabaseClient<Database>;

    const result = await loadDashboardOverviewSummary({
      branchId: 'branch-2',
      canSelectBranch: true,
      supabase: fakeSupabase,
      fetchImpl,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
        WEATHER_PROVIDER: 'open-meteo',
        WEATHER_LOCATION_NAME: 'Bengkayang',
        WEATHER_LATITUDE: '0.8312772',
        WEATHER_LONGITUDE: '109.4858797',
      },
      now: new Date('2026-07-05T10:00:00.000Z'),
    });

    expect(result.selectedBranchId).toBe('branch-2');
    expect(result.weather.location).toBe('Outlet Singkawang');
    expect(result.weather.unavailableReason).toContain('Koordinat cuaca outlet ini belum diatur');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('buildOverviewKpis', () => {
  it('does not produce placeholder metric strings when summary data is missing', () => {
    const result = buildOverviewKpis(undefined);

    expect(result[0].value).toBe('Data belum tersedia');
    expect(result[0].value).not.toContain('1.450.000');
    expect(result[1].value).toBe('Data belum tersedia');
  });

  it('renders real zero sales without inventing a placeholder', () => {
    const summary = {
      businessDate: '2026-07-05',
      timezone: 'Asia/Jakarta',
      generatedAt: '2026-07-05T10:00:00.000Z',
      dataFreshnessSeconds: 0,
      salesToday: {
        amountCents: 0,
        currency: 'IDR',
        source: 'database',
        transactionIdsIncluded: [],
        delta: { percentageChange: null, label: 'Belum cukup data' },
      },
      averagePurchase: {
        amountCents: null,
        currency: 'IDR',
        calculation: 'salesToday / transactionCount',
        delta: { percentageChange: null, label: 'Belum cukup data' },
        unavailableReason: 'Belum ada transaksi hari ini.',
      },
      transactionCount: {
        count: 0,
        source: 'database',
        delta: { percentageChange: null, label: 'Belum cukup data' },
      },
      customerSatisfaction: buildCustomerSatisfactionUnavailable(),
      weather: { location: 'Bengkayang', source: 'open-meteo', unavailableReason: 'Cuaca tidak tersedia' },
      cashierConnection: { status: 'connected', provider: 'supabase-transactions' },
      operationalStatus: { status: 'normal', reason: 'Koneksi aktif.', basedOn: ['cashierConnection'] },
      recentTransactions: [],
      dailySalesTrend: [],
      topMenuItems: [],
      inventoryStatus: {
        coveragePercent: null,
        lowStockCount: null,
        totalTrackedItems: null,
        source: 'inventory',
        unavailableReason: 'Inventaris belum tersedia',
      },
      branches: [],
      selectedBranchId: null,
      agentMessages: [],
      auditNotes: [],
    } satisfies DashboardOverviewData;

    const result = buildOverviewKpis(summary);

    expect(result[0].value).toBe('Rp 0');
    expect(result[2].value).toBe('0 Transaksi');
  });
});

describe('buildOverviewTopbarStatus', () => {
  it('uses a specific label when inventory needs attention', () => {
    const summary = {
      businessDate: '2026-07-05',
      timezone: 'Asia/Jakarta',
      generatedAt: '2026-07-05T10:00:00.000Z',
      dataFreshnessSeconds: 120,
      salesToday: {
        amountCents: 55_000,
        currency: 'IDR',
        source: 'database',
        transactionIdsIncluded: ['tx-1'],
        delta: { percentageChange: null, label: 'Belum cukup data' },
      },
      averagePurchase: {
        amountCents: 18_333,
        currency: 'IDR',
        calculation: 'salesToday / transactionCount',
        delta: { percentageChange: null, label: 'Belum cukup data' },
      },
      transactionCount: {
        count: 3,
        source: 'database',
        delta: { percentageChange: null, label: 'Belum cukup data' },
      },
      customerSatisfaction: buildCustomerSatisfactionUnavailable(),
      weather: { location: 'Bengkayang', source: 'open-meteo' },
      cashierConnection: {
        status: 'connected',
        provider: 'supabase-transactions',
        lastSuccessfulSyncAt: '2026-07-05T09:58:00.000Z',
      },
      operationalStatus: {
        status: 'warning',
        reason: 'Operasional kasir aktif dengan item inventaris yang perlu dipantau.',
        basedOn: ['cashierConnection', 'inventoryStatus'],
      },
      recentTransactions: [],
      dailySalesTrend: [],
      topMenuItems: [],
      inventoryStatus: {
        coveragePercent: 75,
        lowStockCount: 1,
        totalTrackedItems: 4,
        source: 'inventory',
      },
      branches: [],
      selectedBranchId: null,
      agentMessages: [],
      auditNotes: [],
    } satisfies DashboardOverviewData;

    expect(buildOverviewTopbarStatus(summary)).toEqual({
      label: 'STOK PERLU CEK',
      tone: 'accent',
    });
  });
});

describe('buildFreshnessLabel', () => {
  it('humanizes recent updates into minutes', () => {
    const summary = {
      businessDate: '2026-07-05',
      timezone: 'Asia/Jakarta',
      generatedAt: '2026-07-05T10:00:00.000Z',
      dataFreshnessSeconds: 125,
      salesToday: {
        amountCents: 55_000,
        currency: 'IDR',
        source: 'database',
        transactionIdsIncluded: ['tx-1'],
        delta: { percentageChange: null, label: 'Belum cukup data' },
      },
      averagePurchase: {
        amountCents: 18_333,
        currency: 'IDR',
        calculation: 'salesToday / transactionCount',
        delta: { percentageChange: null, label: 'Belum cukup data' },
      },
      transactionCount: {
        count: 3,
        source: 'database',
        delta: { percentageChange: null, label: 'Belum cukup data' },
      },
      customerSatisfaction: buildCustomerSatisfactionUnavailable(),
      weather: { location: 'Bengkayang', source: 'open-meteo' },
      cashierConnection: {
        status: 'connected',
        provider: 'supabase-transactions',
        lastSuccessfulSyncAt: '2026-07-05T09:58:00.000Z',
      },
      operationalStatus: {
        status: 'normal',
        reason: 'Koneksi aktif.',
        basedOn: ['cashierConnection'],
      },
      recentTransactions: [],
      dailySalesTrend: [],
      topMenuItems: [],
      inventoryStatus: {
        coveragePercent: 100,
        lowStockCount: 0,
        totalTrackedItems: 4,
        source: 'inventory',
      },
      branches: [],
      selectedBranchId: null,
      agentMessages: [],
      auditNotes: [],
    } satisfies DashboardOverviewData;

    expect(buildFreshnessLabel(summary)).toBe('2 menit lalu');
  });
});
