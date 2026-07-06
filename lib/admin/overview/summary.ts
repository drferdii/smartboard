import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/admin/supabase/types';
import type {
  DashboardBranch,
  DashboardCashierConnection,
  DashboardCustomerSatisfaction,
  DashboardInventoryStatus,
  DashboardMetricDelta,
  DashboardOperationalStatus,
  DashboardOverviewData,
  DashboardRecentTransaction,
  DashboardTopMenuItem,
  DashboardTrendPoint,
  DashboardWeather,
} from './contracts';

type AdminSupabase = SupabaseClient<Database>;

type WeatherProviderEnv = {
  WEATHER_PROVIDER?: string;
  WEATHER_API_KEY?: string;
  WEATHER_LATITUDE?: string;
  WEATHER_LONGITUDE?: string;
  WEATHER_LOCATION_NAME?: string;
  OUTLET_TIMEZONE?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

type OverviewSummaryDependencies = {
  branchId?: string | null;
  canSelectBranch?: boolean;
  supabase: AdminSupabase;
  fetchImpl?: typeof fetch;
  env?: WeatherProviderEnv;
  now?: Date;
};

type TransactionRow = {
  id: string;
  created_at: string;
  total_cents: number;
  paid_cents: number;
  staff_id: string;
  branch_id: string | null;
};

type TransactionItemRow = {
  transaction_id: string;
  name_snapshot: string;
  quantity: number;
  subtotal_cents: number;
};

type InventoryRow = {
  stock: number;
  min_stock_alert: number;
};

type WeatherFetchResult = {
  weather: DashboardWeather;
  note: string;
};

type WeatherFallback = {
  latitude: string;
  longitude: string;
  location: string;
};

const DEFAULT_TIMEZONE = 'Asia/Jakarta';
const CASHIER_PROVIDER = 'supabase-transactions';
const WEATHER_PROVIDER = 'open-meteo';
const TRANSACTION_SUMMARY_UNAVAILABLE = 'Data transaksi tidak dapat diverifikasi saat ini.';
const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_BENGKAYANG_COORDINATES = {
  latitude: '0.8312772',
  longitude: '109.4858797',
};

const DEFAULT_BENGKAYANG_WEATHER_FALLBACK: WeatherFallback = {
  ...DEFAULT_BENGKAYANG_COORDINATES,
  location: 'Bengkayang',
};

export function isPlaceholderSupabaseConfig(
  env: WeatherProviderEnv = process.env as WeatherProviderEnv
): boolean {
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  return (
    !url ||
    !key ||
    url.includes('placeholder-project') ||
    key.includes('placeholder-anon-key')
  );
}

export function getBusinessTimezone(
  env: WeatherProviderEnv = process.env as WeatherProviderEnv
): string {
  return env.OUTLET_TIMEZONE?.trim() || DEFAULT_TIMEZONE;
}

export function getBusinessDate(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function getTimeZoneOffset(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
  }).formatToParts(date);
  const tzName = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+0';
  const match = tzName.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) {
    return '+00:00';
  }

  const [, sign, hours, minutes] = match;
  return `${sign}${hours.padStart(2, '0')}:${(minutes ?? '00').padStart(2, '0')}`;
}

export function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildDateRange(dateString: string, timeZone: string) {
  const offset = getTimeZoneOffset(new Date(`${dateString}T12:00:00Z`), timeZone);
  const nextDate = addDays(dateString, 1);

  return {
    start: `${dateString}T00:00:00${offset}`,
    endExclusive: `${nextDate}T00:00:00${offset}`,
  };
}

function formatLocalTime(timestamp: string, timeZone: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

function formatLocalDate(timestamp: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}

function formatLocalDateTime(timestamp: string, timeZone: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

export function calculateMetricDelta(current: number, previous: number): DashboardMetricDelta {
  if (previous <= 0) {
    return {
      percentageChange: null,
      label: 'Belum cukup data',
      unavailableReason: 'Periode pembanding belum tersedia.',
    };
  }

  const percentageChange = ((current - previous) / previous) * 100;
  const rounded = Math.round(percentageChange * 10) / 10;
  const prefix = rounded > 0 ? '+' : '';

  return {
    percentageChange: rounded,
    label: `${prefix}${rounded.toLocaleString('id-ID', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}%`,
  };
}

export function calculateAveragePurchaseCents(
  salesTodayCents: number,
  transactionCount: number
): number | null {
  if (transactionCount <= 0) {
    return null;
  }

  return Math.round(salesTodayCents / transactionCount);
}

export function summarizePaidTransactions(
  rows: Array<Pick<TransactionRow, 'id' | 'paid_cents' | 'total_cents'>>
) {
  const paidRows = rows.filter((row) => row.paid_cents >= row.total_cents);

  return {
    salesTodayCents: paidRows.reduce((sum, row) => sum + row.total_cents, 0),
    transactionCount: paidRows.length,
    transactionIdsIncluded: paidRows.map((row) => row.id),
  };
}

export function buildCustomerSatisfactionUnavailable(): DashboardCustomerSatisfaction {
  return {
    value: null,
    unit: null,
    source: null,
    unavailableReason: 'Sumber kepuasan pelanggan belum terintegrasi.',
  };
}

export function buildInventoryStatus(rows: InventoryRow[]): DashboardInventoryStatus {
  if (rows.length === 0) {
    return {
      coveragePercent: null,
      lowStockCount: null,
      totalTrackedItems: 0,
      source: 'inventory',
      unavailableReason: 'Data inventaris belum tersedia.',
    };
  }

  const lowStockCount = rows.filter((row) => row.stock <= row.min_stock_alert).length;
  const healthyCount = rows.length - lowStockCount;

  return {
    coveragePercent: Math.round((healthyCount / rows.length) * 100),
    lowStockCount,
    totalTrackedItems: rows.length,
    source: 'inventory',
  };
}

export function buildOperationalStatus(input: {
  cashierConnection: DashboardCashierConnection;
  weather: DashboardWeather;
  inventoryStatus: DashboardInventoryStatus;
}): DashboardOperationalStatus {
  if (input.cashierConnection.status === 'error') {
    return {
      status: 'critical',
      reason: 'Koneksi data kasir mengalami kesalahan.',
      basedOn: ['cashierConnection'],
    };
  }

  if (input.cashierConnection.status === 'not_configured') {
    return {
      status: 'unknown',
      reason: 'Koneksi data kasir belum dikonfigurasi.',
      basedOn: ['cashierConnection'],
    };
  }

  if (input.cashierConnection.status === 'disconnected') {
    return {
      status: 'warning',
      reason: 'Koneksi data kasir belum aktif.',
      basedOn: ['cashierConnection'],
    };
  }

  const weatherUnavailable = Boolean(input.weather.unavailableReason);
  const inventoryUnavailable = Boolean(input.inventoryStatus.unavailableReason);
  const lowStockAlert = (input.inventoryStatus.lowStockCount ?? 0) > 0;

  if (weatherUnavailable || inventoryUnavailable || lowStockAlert) {
    return {
      status: 'warning',
      reason: weatherUnavailable
        ? 'Operasional kasir aktif, tetapi data cuaca belum tersedia.'
        : inventoryUnavailable
          ? 'Operasional kasir aktif, tetapi data inventaris belum tersedia.'
          : 'Operasional kasir aktif dengan item inventaris yang perlu dipantau.',
      basedOn:
        weatherUnavailable
          ? ['cashierConnection', 'weather']
          : ['cashierConnection', 'inventoryStatus'],
    };
  }

  return {
    status: 'normal',
    reason: 'Koneksi data kasir aktif dan data operasional berhasil dimuat.',
    basedOn: ['cashierConnection', 'inventoryStatus'],
  };
}

function mapWeatherCodeToLabel(code: number): string {
  if (code === 0) return 'Cerah';
  if (code === 1 || code === 2) return 'Cerah Berawan';
  if (code === 3) return 'Berawan';
  if (code === 45 || code === 48) return 'Berkabut';
  if (code >= 51 && code <= 57) return 'Gerimis';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'Hujan';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'Salju';
  if (code >= 95) return 'Badai Petir';
  return 'Cuaca Tidak Dikenal';
}

export async function fetchWeather(
  fetchImpl: typeof fetch,
  env: WeatherProviderEnv,
  generatedAt: string,
  fallback?: WeatherFallback
): Promise<WeatherFetchResult> {
  const provider = env.WEATHER_PROVIDER?.trim() || WEATHER_PROVIDER;
  const location = env.WEATHER_LOCATION_NAME?.trim() || fallback?.location || 'Outlet aktif';
  const latitude = env.WEATHER_LATITUDE?.trim() || fallback?.latitude;
  const longitude = env.WEATHER_LONGITUDE?.trim() || fallback?.longitude;

  if (provider !== WEATHER_PROVIDER) {
    return {
      weather: {
        location,
        source: provider,
        unavailableReason: 'Cuaca outlet ini belum tersedia.',
      },
      note: `Cuaca ${location} belum dapat ditampilkan saat ini.`,
    };
  }

  if (!latitude || !longitude) {
    return {
      weather: {
        location,
        source: provider,
        unavailableReason: 'Koordinat cuaca outlet ini belum diatur.',
      },
      note: `Cuaca ${location} belum terhubung ke koordinat outlet.`,
    };
  }

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', latitude);
    url.searchParams.set('longitude', longitude);
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m'
    );
    url.searchParams.set('timezone', 'auto');

    const response = await fetchImpl(url.toString(), {
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      throw new Error(`Weather HTTP ${response.status}`);
    }

    const payload = (await response.json()) as {
      current?: {
        temperature_2m?: number;
        relative_humidity_2m?: number;
        weather_code?: number;
        wind_speed_10m?: number;
      };
    };

    if (!payload.current) {
      throw new Error('Weather payload missing current data');
    }

    return {
      weather: {
        location,
        temperature: payload.current.temperature_2m,
        condition: mapWeatherCodeToLabel(payload.current.weather_code ?? -1),
        humidity: payload.current.relative_humidity_2m,
        windSpeedKmh: payload.current.wind_speed_10m,
        source: provider,
        fetchedAt: generatedAt,
      },
      note: `Cuaca ${location} berhasil diperbarui.`,
    };
  } catch (error) {
    return {
      weather: {
        location,
        source: provider,
        unavailableReason: 'Cuaca live untuk outlet ini belum tersedia.',
      },
      note:
        error instanceof Error
          ? `Cuaca ${location} belum berhasil dimuat.`
          : `Cuaca ${location} belum berhasil dimuat.`,
    };
  }
}

function buildRecentTransactions(
  rows: TransactionRow[],
  itemRows: TransactionItemRow[],
  staffNameById: Map<string, string>,
  timeZone: string
): DashboardRecentTransaction[] {
  const itemMap = new Map<string, string[]>();

  for (const item of itemRows) {
    const entry = itemMap.get(item.transaction_id) ?? [];
    entry.push(item.name_snapshot);
    itemMap.set(item.transaction_id, entry);
  }

  return rows.slice(0, 8).map((row) => ({
    id: row.id,
    timestamp: row.created_at,
    totalAmountCents: row.total_cents,
    currency: 'IDR',
    paymentStatus: row.paid_cents >= row.total_cents ? 'paid' : 'pending',
    source: 'database',
    cashierName: staffNameById.get(row.staff_id) ?? null,
    itemSummary:
      itemMap.get(row.id) ?? [`Detail item belum tersedia (${formatLocalTime(row.created_at, timeZone)})`],
  }));
}

function buildTrendPoints(
  rows: TransactionRow[],
  businessDate: string,
  timeZone: string
): DashboardTrendPoint[] {
  const points = new Map<string, DashboardTrendPoint>();

  for (let index = 6; index >= 0; index -= 1) {
    const date = addDays(businessDate, -index);
    points.set(date, { date, salesCents: 0, transactionCount: 0 });
  }

  for (const row of rows) {
    const date = formatLocalDate(row.created_at, timeZone);
    const entry = points.get(date);
    if (!entry) {
      continue;
    }

    entry.salesCents += row.total_cents;
    entry.transactionCount += 1;
  }

  return [...points.values()];
}

function buildTopMenuItems(itemRows: TransactionItemRow[]): DashboardTopMenuItem[] {
  if (itemRows.length === 0) {
    return [];
  }

  const itemMap = new Map<string, { quantity: number; revenueCents: number }>();
  let totalQuantity = 0;

  for (const item of itemRows) {
    const current = itemMap.get(item.name_snapshot) ?? { quantity: 0, revenueCents: 0 };
    current.quantity += item.quantity;
    current.revenueCents += item.subtotal_cents;
    itemMap.set(item.name_snapshot, current);
    totalQuantity += item.quantity;
  }

  return [...itemMap.entries()]
    .map(([name, value]) => ({
      name,
      quantity: value.quantity,
      revenueCents: value.revenueCents,
      sharePercent: totalQuantity > 0 ? Math.round((value.quantity / totalQuantity) * 100) : 0,
    }))
    .sort((left, right) => right.revenueCents - left.revenueCents)
    .slice(0, 5);
}

export function buildAgentMessages(data: Pick<
  DashboardOverviewData,
  | 'averagePurchase'
  | 'cashierConnection'
  | 'inventoryStatus'
  | 'operationalStatus'
  | 'salesToday'
  | 'transactionCount'
  | 'weather'
>): string[] {
  const messages: string[] = [];

  if (data.salesToday.amountCents !== null && data.transactionCount.count !== null) {
    messages.push(
      `Penjualan tercatat hari ini ${data.salesToday.amountCents.toLocaleString('id-ID')} sen dari ${data.transactionCount.count} transaksi valid.`
    );
  } else {
    messages.push(
      data.salesToday.unavailableReason ||
        data.transactionCount.unavailableReason ||
        'Data kasir belum tersedia untuk diringkas.'
    );
  }

  if (data.averagePurchase.amountCents !== null) {
    messages.push(
      `Rata-rata pembelian saat ini ${data.averagePurchase.amountCents.toLocaleString('id-ID')} sen per transaksi.`
    );
  } else {
    messages.push(
      data.averagePurchase.unavailableReason || 'Rata-rata pembelian belum dapat dihitung.'
    );
  }

  messages.push(`Status operasional: ${data.operationalStatus.reason}`);

  if (data.weather.unavailableReason) {
    messages.push(data.weather.unavailableReason);
  } else if (typeof data.weather.temperature === 'number' && data.weather.condition) {
    messages.push(
      `Cuaca ${data.weather.location} ${data.weather.temperature}°C dengan kondisi ${data.weather.condition.toLowerCase()}.`
    );
  }

  if (data.inventoryStatus.unavailableReason) {
    messages.push(data.inventoryStatus.unavailableReason);
  } else if (typeof data.inventoryStatus.lowStockCount === 'number') {
    messages.push(
      data.inventoryStatus.lowStockCount > 0
        ? `${data.inventoryStatus.lowStockCount} item inventaris berada pada batas minimum stok.`
        : 'Tidak ada item inventaris yang berada di bawah batas minimum stok.'
    );
  }

  if (data.cashierConnection.status !== 'connected') {
    messages.push(
      data.cashierConnection.lastError || 'Koneksi kasir belum aktif.'
    );
  }

  return messages.slice(0, 4);
}

export async function loadDashboardOverviewSummary({
  branchId = null,
  canSelectBranch = false,
  supabase,
  fetchImpl = fetch,
  env = process.env as WeatherProviderEnv,
  now = new Date(),
}: OverviewSummaryDependencies): Promise<DashboardOverviewData> {
  const timeZone = getBusinessTimezone(env);
  const businessDate = getBusinessDate(now, timeZone);
  const previousDate = addDays(businessDate, -1);
  const trendStartDate = addDays(businessDate, -6);
  const generatedAt = now.toISOString();
  const branches: DashboardBranch[] = [];

  let selectedBranchId: string | null = null;

  if (isPlaceholderSupabaseConfig(env)) {
    const shouldUseDefaultBranchWeather = !branchId || branchId === DEFAULT_BRANCH_ID;
    const weatherResult = await fetchWeather(
      fetchImpl,
      shouldUseDefaultBranchWeather
        ? {
            ...env,
            WEATHER_LOCATION_NAME: DEFAULT_BENGKAYANG_WEATHER_FALLBACK.location,
          }
        : {
            ...env,
            WEATHER_LOCATION_NAME: 'Outlet aktif',
            WEATHER_LATITUDE: undefined,
            WEATHER_LONGITUDE: undefined,
          },
      generatedAt,
      shouldUseDefaultBranchWeather ? DEFAULT_BENGKAYANG_WEATHER_FALLBACK : undefined
    );
    const disconnectedCashier: DashboardCashierConnection = {
      status: 'not_configured',
      provider: CASHIER_PROVIDER,
      lastError: 'Konfigurasi Supabase belum diatur.',
    };
    const inventoryStatus: DashboardInventoryStatus = {
      coveragePercent: null,
      lowStockCount: null,
      totalTrackedItems: null,
      source: 'inventory',
      unavailableReason: 'Inventaris tidak dapat dimuat karena koneksi backend belum dikonfigurasi.',
    };
    const operationalStatus = buildOperationalStatus({
      cashierConnection: disconnectedCashier,
      weather: weatherResult.weather,
      inventoryStatus,
    });

    const summary: DashboardOverviewData = {
      businessDate,
      timezone: timeZone,
      generatedAt,
      dataFreshnessSeconds: 0,
      salesToday: {
        amountCents: null,
        currency: 'IDR',
        source: 'database',
        transactionIdsIncluded: [],
        delta: {
          percentageChange: null,
          label: 'Belum cukup data',
          unavailableReason: 'Koneksi backend belum dikonfigurasi.',
        },
        unavailableReason: 'Koneksi kasir belum aktif.',
      },
      averagePurchase: {
        amountCents: null,
        currency: 'IDR',
        calculation: 'salesToday / transactionCount',
        delta: {
          percentageChange: null,
          label: 'Belum cukup data',
          unavailableReason: 'Koneksi backend belum dikonfigurasi.',
        },
        unavailableReason: 'Belum ada transaksi terverifikasi.',
      },
      transactionCount: {
        count: null,
        source: 'database',
        delta: {
          percentageChange: null,
          label: 'Belum cukup data',
          unavailableReason: 'Koneksi backend belum dikonfigurasi.',
        },
        unavailableReason: 'Koneksi kasir belum aktif.',
      },
      customerSatisfaction: buildCustomerSatisfactionUnavailable(),
      weather: weatherResult.weather,
      cashierConnection: disconnectedCashier,
      operationalStatus,
      recentTransactions: [],
      dailySalesTrend: [],
      topMenuItems: [],
      inventoryStatus,
      branches,
      selectedBranchId,
      agentMessages: [],
      auditNotes: [
        'Koneksi backend belum dikonfigurasi untuk outlet ini.',
        weatherResult.note,
      ],
    };

    return {
      ...summary,
      agentMessages: buildAgentMessages(summary),
    };
  }

  const { data: branchRows, error: branchError } = await supabase
    .from('branches')
    .select('id, name')
    .order('name', { ascending: true });

  const weatherWithoutFallback = await fetchWeather(
    fetchImpl,
    {
      ...env,
      WEATHER_LOCATION_NAME: 'Outlet aktif',
      WEATHER_LATITUDE: undefined,
      WEATHER_LONGITUDE: undefined,
    },
    generatedAt
  );

  if (branchError || !branchRows || branchRows.length === 0) {
    const message = 'Konteks outlet tidak dapat diverifikasi saat ini.';
    const cashierConnection: DashboardCashierConnection = {
      status: 'error',
      provider: CASHIER_PROVIDER,
      lastError: message,
    };
    const inventoryStatus: DashboardInventoryStatus = {
      coveragePercent: null,
      lowStockCount: null,
      totalTrackedItems: null,
      source: 'inventory',
      unavailableReason: 'Inventaris tidak dapat dimuat karena outlet aktif belum tervalidasi.',
    };
    const operationalStatus = buildOperationalStatus({
      cashierConnection,
      weather: weatherWithoutFallback.weather,
      inventoryStatus,
    });

    const summary: DashboardOverviewData = {
      businessDate,
      timezone: timeZone,
      generatedAt,
      dataFreshnessSeconds: 0,
      salesToday: {
        amountCents: null,
        currency: 'IDR',
        source: 'database',
        transactionIdsIncluded: [],
        delta: {
          percentageChange: null,
          label: 'Belum cukup data',
          unavailableReason: message,
        },
        unavailableReason: message,
      },
      averagePurchase: {
        amountCents: null,
        currency: 'IDR',
        calculation: 'salesToday / transactionCount',
        delta: {
          percentageChange: null,
          label: 'Belum cukup data',
          unavailableReason: message,
        },
        unavailableReason: message,
      },
      transactionCount: {
        count: null,
        source: 'database',
        delta: {
          percentageChange: null,
          label: 'Belum cukup data',
          unavailableReason: message,
        },
        unavailableReason: message,
      },
      customerSatisfaction: buildCustomerSatisfactionUnavailable(),
      weather: weatherWithoutFallback.weather,
      cashierConnection,
      operationalStatus,
      recentTransactions: [],
      dailySalesTrend: [],
      topMenuItems: [],
      inventoryStatus,
      branches: [],
      selectedBranchId: null,
      agentMessages: [],
      auditNotes: [message, weatherWithoutFallback.note],
    };

    return {
      ...summary,
      agentMessages: buildAgentMessages(summary),
    };
  }

  for (const branch of branchRows ?? []) {
    branches.push({
      id: branch.id,
      name: branch.name,
    });
  }

  const requestedBranchId = canSelectBranch ? branchId?.trim() || null : null;
  const hasRequestedBranch =
    requestedBranchId !== null && branches.some((branch) => branch.id === requestedBranchId);
  if (requestedBranchId && !hasRequestedBranch) {
    throw new Error('INVALID_OVERVIEW_BRANCH');
  }

  selectedBranchId = hasRequestedBranch ? requestedBranchId : branches[0]?.id ?? null;
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) ?? null;
  const visibleBranches = canSelectBranch
    ? branches
    : branches.filter((branch) => branch.id === selectedBranchId);
  const weatherFallback =
    selectedBranch?.id === DEFAULT_BRANCH_ID
      ? DEFAULT_BENGKAYANG_WEATHER_FALLBACK
      : undefined;
  const weatherLocationName =
    selectedBranch?.id === DEFAULT_BRANCH_ID
      ? DEFAULT_BENGKAYANG_WEATHER_FALLBACK.location
      : selectedBranch?.name || 'Outlet aktif';
  const weatherResult = await fetchWeather(
    fetchImpl,
    selectedBranch?.id === DEFAULT_BRANCH_ID
      ? {
          ...env,
          WEATHER_LOCATION_NAME: weatherLocationName,
        }
      : {
          ...env,
          WEATHER_LOCATION_NAME: weatherLocationName,
          WEATHER_LATITUDE: undefined,
          WEATHER_LONGITUDE: undefined,
        },
    generatedAt,
    weatherFallback
  );

  const trendRange = buildDateRange(trendStartDate, timeZone);
  const todayRange = buildDateRange(businessDate, timeZone);
  const previousRange = buildDateRange(previousDate, timeZone);

  let historicalQuery = supabase
    .from('transactions')
    .select('id, created_at, total_cents, paid_cents, staff_id, branch_id')
    .gte('created_at', trendRange.start)
    .lt('created_at', todayRange.endExclusive)
    .order('created_at', { ascending: false });

  let previousQuery = supabase
    .from('transactions')
    .select('id, created_at, total_cents, paid_cents, staff_id, branch_id')
    .gte('created_at', previousRange.start)
    .lt('created_at', previousRange.endExclusive)
    .order('created_at', { ascending: false });

  if (selectedBranchId) {
    historicalQuery = historicalQuery.eq('branch_id', selectedBranchId);
    previousQuery = previousQuery.eq('branch_id', selectedBranchId);
  }

  const [{ data: historicalRows, error: historicalError }, { data: previousRows, error: previousError }] =
    await Promise.all([historicalQuery, previousQuery]);

  if (historicalError || previousError) {
    const message = TRANSACTION_SUMMARY_UNAVAILABLE;
    const cashierConnection: DashboardCashierConnection = {
      status: 'error',
      provider: CASHIER_PROVIDER,
      lastError: message,
    };
    const inventoryStatus: DashboardInventoryStatus = {
      coveragePercent: null,
      lowStockCount: null,
      totalTrackedItems: null,
      source: 'inventory',
      unavailableReason: 'Inventaris tidak dapat dimuat karena ringkasan kasir gagal.',
    };
    const operationalStatus = buildOperationalStatus({
      cashierConnection,
      weather: weatherResult.weather,
      inventoryStatus,
    });

    const summary: DashboardOverviewData = {
      businessDate,
      timezone: timeZone,
      generatedAt,
      dataFreshnessSeconds: 0,
      salesToday: {
        amountCents: null,
        currency: 'IDR',
        source: 'database',
        transactionIdsIncluded: [],
        delta: {
          percentageChange: null,
          label: 'Belum cukup data',
          unavailableReason: message,
        },
        unavailableReason: 'Data kasir gagal dimuat.',
      },
      averagePurchase: {
        amountCents: null,
        currency: 'IDR',
        calculation: 'salesToday / transactionCount',
        delta: {
          percentageChange: null,
          label: 'Belum cukup data',
          unavailableReason: message,
        },
        unavailableReason: 'Data kasir gagal dimuat.',
      },
      transactionCount: {
        count: null,
        source: 'database',
        delta: {
          percentageChange: null,
          label: 'Belum cukup data',
          unavailableReason: message,
        },
        unavailableReason: 'Data kasir gagal dimuat.',
      },
      customerSatisfaction: buildCustomerSatisfactionUnavailable(),
      weather: weatherResult.weather,
      cashierConnection,
      operationalStatus,
      recentTransactions: [],
      dailySalesTrend: [],
      topMenuItems: [],
      inventoryStatus,
      branches: visibleBranches,
      selectedBranchId,
      agentMessages: [],
      auditNotes: [
        'Ringkasan transaksi belum dapat dirangkum untuk saat ini.',
        weatherResult.note,
      ],
    };

    return {
      ...summary,
      agentMessages: buildAgentMessages(summary),
    };
  }

  const allHistoricalRows = (historicalRows ?? []) as TransactionRow[];
  const historicalTransactions = allHistoricalRows.filter(
    (row): row is TransactionRow => row.paid_cents >= row.total_cents
  );
  const previousTransactions = (previousRows ?? []).filter(
    (row): row is TransactionRow => row.paid_cents >= row.total_cents
  );
  const rawTodayTransactions = allHistoricalRows.filter(
    (row) => formatLocalDate(row.created_at, timeZone) === businessDate
  );
  const todayTransactions = historicalTransactions.filter(
    (row) => formatLocalDate(row.created_at, timeZone) === businessDate
  );

  const recentTransactionIds = rawTodayTransactions.slice(0, 8).map((row) => row.id);
  const todayTransactionIds = todayTransactions.map((row) => row.id);
  const transactionIdsForItems = [...new Set([...recentTransactionIds, ...todayTransactionIds])];

  const staffIds = [...new Set(rawTodayTransactions.slice(0, 8).map((row) => row.staff_id))];

  const [itemsResult, profilesResult, inventoryResult] = await Promise.all([
    transactionIdsForItems.length > 0
      ? supabase
          .from('transaction_items')
          .select('transaction_id, name_snapshot, quantity, subtotal_cents')
          .in('transaction_id', transactionIdsForItems)
      : Promise.resolve({ data: [], error: null }),
    staffIds.length > 0
      ? supabase.from('profiles').select('id, full_name').in('id', staffIds)
      : Promise.resolve({ data: [], error: null }),
    selectedBranchId
      ? supabase
          .from('inventory')
          .select('stock, min_stock_alert')
          .eq('branch_id', selectedBranchId)
      : supabase.from('inventory').select('stock, min_stock_alert'),
  ]);

  const itemRows = (itemsResult.data ?? []) as TransactionItemRow[];
  const profileMap = new Map<string, string>(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile.full_name])
  );
  const inventoryStatus = inventoryResult.error
    ? {
        coveragePercent: null,
        lowStockCount: null,
        totalTrackedItems: null,
        source: 'inventory' as const,
        unavailableReason: 'Data inventaris belum tersedia saat ini.',
      }
    : buildInventoryStatus((inventoryResult.data ?? []) as InventoryRow[]);

  const paidTodaySummary = summarizePaidTransactions(todayTransactions);
  const paidPreviousSummary = summarizePaidTransactions(previousTransactions);
  const salesTodayCents = paidTodaySummary.salesTodayCents;
  const previousSalesCents = previousTransactions.reduce((sum, row) => sum + row.total_cents, 0);
  const salesDelta = calculateMetricDelta(salesTodayCents, previousSalesCents);

  const transactionCountToday = paidTodaySummary.transactionCount;
  const transactionCountPrevious = paidPreviousSummary.transactionCount;
  const transactionDelta = calculateMetricDelta(
    transactionCountToday,
    transactionCountPrevious
  );

  const averageTodayCents = calculateAveragePurchaseCents(
    salesTodayCents,
    transactionCountToday
  );
  const averagePreviousCents = calculateAveragePurchaseCents(
    previousSalesCents,
    transactionCountPrevious
  );
  const averageDelta =
    averageTodayCents !== null && averagePreviousCents !== null
      ? calculateMetricDelta(averageTodayCents, averagePreviousCents)
      : {
          percentageChange: null,
          label: 'Belum cukup data',
          unavailableReason: 'Periode pembanding rata-rata belum tersedia.',
        };

  const cashierConnection: DashboardCashierConnection = {
    status: 'connected',
    provider: CASHIER_PROVIDER,
    lastSuccessfulSyncAt: allHistoricalRows[0]?.created_at,
  };
  const operationalStatus = buildOperationalStatus({
    cashierConnection,
    weather: weatherResult.weather,
    inventoryStatus,
  });

  const summary: DashboardOverviewData = {
    businessDate,
    timezone: timeZone,
    generatedAt,
    dataFreshnessSeconds: allHistoricalRows[0]?.created_at
      ? Math.max(
          0,
          Math.round(
            (now.getTime() - new Date(allHistoricalRows[0].created_at).getTime()) / 1000
          )
        )
      : 0,
    salesToday: {
      amountCents: salesTodayCents,
      currency: 'IDR',
      source: 'database',
      transactionIdsIncluded: paidTodaySummary.transactionIdsIncluded,
      delta: salesDelta,
    },
    averagePurchase: {
      amountCents: averageTodayCents,
      currency: 'IDR',
      calculation: 'salesToday / transactionCount',
      delta: averageDelta,
      unavailableReason:
        averageTodayCents === null ? 'Belum ada transaksi hari ini.' : undefined,
    },
    transactionCount: {
      count: transactionCountToday,
      source: 'database',
      delta: transactionDelta,
    },
    customerSatisfaction: buildCustomerSatisfactionUnavailable(),
    weather: weatherResult.weather,
    cashierConnection,
    operationalStatus,
    recentTransactions: buildRecentTransactions(
      rawTodayTransactions,
      itemRows,
      profileMap,
      timeZone
    ),
    dailySalesTrend: buildTrendPoints(historicalTransactions, businessDate, timeZone),
    topMenuItems: buildTopMenuItems(
      itemRows.filter((row) => todayTransactionIds.includes(row.transaction_id))
    ),
    inventoryStatus,
    branches: visibleBranches,
    selectedBranchId,
    agentMessages: [],
    auditNotes: [
      `Ringkasan diperbarui pada ${formatLocalDateTime(generatedAt, timeZone)}.`,
      allHistoricalRows[0]?.created_at
        ? `Transaksi terakhir masuk ${formatLocalDateTime(allHistoricalRows[0].created_at, timeZone)}.`
        : 'Belum ada transaksi terverifikasi untuk periode ini.',
      ...(itemsResult.error ? ['Sebagian detail item transaksi belum tampil lengkap.'] : []),
      ...(inventoryResult.error ? ['Status inventaris belum dapat diverifikasi saat ini.'] : []),
      weatherResult.note,
      buildCustomerSatisfactionUnavailable().unavailableReason ||
        'Sumber kepuasan pelanggan belum tersedia.',
    ],
  };

  return {
    ...summary,
    agentMessages: buildAgentMessages(summary),
  };
}
