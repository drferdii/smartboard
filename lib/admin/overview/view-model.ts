import { formatDateID } from '@/lib/admin/format/date';
import { formatRupiah } from '@/lib/admin/format/money';
import type {
  DashboardOverviewData,
  DashboardTopMenuItem,
  DashboardTrendPoint,
  OperationalStatusLevel,
} from './contracts';

export type OverviewKpiView = {
  label: string;
  value: string;
  deltaLabel: string;
  deltaTone: 'success' | 'muted' | 'accent';
  spark: string | null;
  unavailable: boolean;
};

export type OverviewTransactionView = {
  time: string;
  id: string;
  menu: string;
  total: string;
  status: string;
  cashier: string;
  statusTone: 'success' | 'muted';
};

export type OverviewTopbarStatusView = {
  label: string;
  tone: 'success' | 'muted' | 'accent';
};

function buildSparkline(values: number[]): string | null {
  if (values.length < 2) {
    return null;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = Math.round((index / (values.length - 1)) * 100);
      const y = Math.round(22 - ((value - min) / range) * 20);
      return `${x},${y}`;
    })
    .join(' ');
}

function mapStatusTone(status: OperationalStatusLevel): OverviewTopbarStatusView['tone'] {
  if (status === 'normal') return 'success';
  if (status === 'warning' || status === 'critical') return 'accent';
  return 'muted';
}

function buildDeltaTone(percentageChange: number | null): OverviewKpiView['deltaTone'] {
  if (percentageChange === null || percentageChange === 0) {
    return 'muted';
  }

  return percentageChange > 0 ? 'success' : 'accent';
}

export function buildOverviewTopbarStatus(
  data: DashboardOverviewData | undefined,
  error?: string | null
): OverviewTopbarStatusView {
  if (error) {
    return { label: 'DATA TERPUTUS', tone: 'accent' };
  }

  if (!data) {
    return { label: 'MEMUAT', tone: 'muted' };
  }

  const inventoryNeedsAttention =
    (data.inventoryStatus.lowStockCount ?? 0) > 0 || Boolean(data.inventoryStatus.unavailableReason);
  const weatherNeedsAttention = Boolean(data.weather.unavailableReason);
  const cashierNeedsAttention =
    data.cashierConnection.status === 'disconnected' ||
    data.cashierConnection.status === 'error' ||
    data.cashierConnection.status === 'not_configured';

  const statusLabelMap: Record<OperationalStatusLevel, string> = {
    normal: 'NORMAL',
    warning: cashierNeedsAttention
      ? 'KASIR PERLU CEK'
      : inventoryNeedsAttention
        ? 'STOK PERLU CEK'
        : weatherNeedsAttention
          ? 'CUACA BELUM MASUK'
          : 'PERLU CEK',
    critical: 'KRITIS',
    unknown: 'BELUM SIAP',
  };

  return {
    label: statusLabelMap[data.operationalStatus.status],
    tone: mapStatusTone(data.operationalStatus.status),
  };
}

export function buildOverviewKpis(data: DashboardOverviewData | undefined): OverviewKpiView[] {
  const salesSpark = buildSparkline(data?.dailySalesTrend.map((point) => point.salesCents) ?? []);
  const txSpark = buildSparkline(
    data?.dailySalesTrend.map((point) => point.transactionCount) ?? []
  );
  const avgSpark = buildSparkline(
    data?.dailySalesTrend.map((point) =>
      point.transactionCount > 0 ? Math.round(point.salesCents / point.transactionCount) : 0
    ) ?? []
  );

  const satisfactionUnavailable = data?.customerSatisfaction.unavailableReason || 'Data belum tersedia';

  return [
    {
      label: 'Penjualan Hari Ini',
      value:
        data?.salesToday.amountCents !== undefined && data.salesToday.amountCents !== null
          ? formatRupiah(data.salesToday.amountCents)
          : 'Data belum tersedia',
      deltaLabel: data?.salesToday.delta.label ?? 'Belum cukup data',
      deltaTone: buildDeltaTone(data?.salesToday.delta.percentageChange ?? null),
      spark: salesSpark,
      unavailable: !data || data.salesToday.amountCents === null,
    },
    {
      label: 'Rata-rata Pembelian',
      value:
        data?.averagePurchase.amountCents !== undefined &&
        data.averagePurchase.amountCents !== null
          ? formatRupiah(data.averagePurchase.amountCents)
          : data
            ? 'Belum ada transaksi hari ini'
            : 'Data belum tersedia',
      deltaLabel: data?.averagePurchase.delta.label ?? 'Belum cukup data',
      deltaTone: buildDeltaTone(data?.averagePurchase.delta.percentageChange ?? null),
      spark: avgSpark,
      unavailable: !data || data.averagePurchase.amountCents === null,
    },
    {
      label: 'Total Transaksi',
      value:
        data?.transactionCount.count !== undefined && data.transactionCount.count !== null
          ? `${data.transactionCount.count} Transaksi`
          : 'Data belum tersedia',
      deltaLabel: data?.transactionCount.delta.label ?? 'Belum cukup data',
      deltaTone: buildDeltaTone(data?.transactionCount.delta.percentageChange ?? null),
      spark: txSpark,
      unavailable: !data || data.transactionCount.count === null,
    },
    {
      label: 'Indeks Kepuasan',
      value:
        data?.customerSatisfaction.value !== null && data?.customerSatisfaction.value !== undefined
          ? `${data.customerSatisfaction.value.toLocaleString('id-ID', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}%`
          : satisfactionUnavailable,
      deltaLabel:
        data?.customerSatisfaction.value !== null && data?.customerSatisfaction.value !== undefined
          ? 'Sumber live'
          : 'Belum terhubung',
      deltaTone:
        data?.customerSatisfaction.value !== null && data?.customerSatisfaction.value !== undefined
          ? 'success'
          : 'muted',
      spark: null,
      unavailable: !data || data.customerSatisfaction.value === null,
    },
  ];
}

export function buildOverviewTransactions(
  data: DashboardOverviewData | undefined
): OverviewTransactionView[] {
  return (data?.recentTransactions ?? []).map((transaction) => ({
    time: new Intl.DateTimeFormat('id-ID', {
      timeZone: data?.timezone || 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(transaction.timestamp)),
    id: transaction.id.slice(0, 8).toUpperCase(),
    menu: transaction.itemSummary.join(' + '),
    total: formatRupiah(transaction.totalAmountCents),
    status: transaction.paymentStatus === 'paid' ? 'LUNAS' : 'PENDING',
    cashier: transaction.cashierName || 'Staff tidak diketahui',
    statusTone: transaction.paymentStatus === 'paid' ? 'success' : 'muted',
  }));
}

export function buildTrendCaption(points: DashboardTrendPoint[]): string {
  if (points.length === 0) {
    return 'Data belum tersedia';
  }

  const lastPoint = points[points.length - 1];
  return `${formatDateID(lastPoint.date)} · ${lastPoint.transactionCount} transaksi`;
}

export function buildTopItemSummary(items: DashboardTopMenuItem[]): string {
  if (items.length === 0) {
    return 'Belum ada transaksi hari ini';
  }

  const topItem = items[0];
  return `${topItem.name} memimpin ${topItem.sharePercent}% porsi transaksi hari ini.`;
}

export function buildFreshnessLabel(data: DashboardOverviewData | undefined): string {
  if (!data) {
    return 'Memuat pembaruan';
  }

  if (!data.cashierConnection.lastSuccessfulSyncAt) {
    return data.cashierConnection.status === 'connected'
      ? 'Belum ada transaksi baru pada periode ini'
      : 'Pembaruan belum tersedia';
  }

  if (data.dataFreshnessSeconds <= 0) {
    return 'Baru saja diperbarui';
  }

  if (data.dataFreshnessSeconds < 60) {
    return 'Kurang dari 1 menit lalu';
  }

  if (data.dataFreshnessSeconds < 3600) {
    const minutes = Math.floor(data.dataFreshnessSeconds / 60);
    return `${minutes} menit lalu`;
  }

  if (data.dataFreshnessSeconds < 86_400) {
    const hours = Math.floor(data.dataFreshnessSeconds / 3600);
    return `${hours} jam lalu`;
  }

  const days = Math.floor(data.dataFreshnessSeconds / 86_400);
  return `${days} hari lalu`;
}
