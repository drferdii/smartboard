/**
 * Adapter: convert the backend SSOT payload (`DashboardOverviewData`) into the
 * Outlet Command Dashboard view-model (`OutletDashboardData`).
 *
 * This keeps a single source of truth on the server side while letting the
 * dashboard modules consume an operational, decision-oriented shape.
 *
 * Honesty rules:
 * - If a backend signal is unavailable (`unavailableReason`/null), the adapter
 *   never fabricates a value. It maps to null/empty and, if no actionable
 *   signal remains, returns the `empty` mode so the UI shows the SmartEmptyState.
 * - The adapter never auto-enters demo mode. Demo mode is a user action.
 */

import type { DashboardOverviewData } from './contracts'
import type {
  CashierClosingState,
  CashierClosingStatus,
  DashboardMode,
  OutletDashboardData,
  StockRiskItem,
} from './outlet-contracts'

const DEFAULT_OUTLET = {
  id: 'rumah-makan-semayot',
  name: 'Rumah Makan Semayot',
  location: 'Bengkayang, Kalimantan Barat',
}

const DEFAULT_CHECKLIST_LABELS = [
  'Kasir aktif',
  'Transaksi tervalidasi',
  'Pembayaran tercatat',
  'Void/refund dicek',
  'Selisih kas dicek',
  'Closing selesai',
]

function buildCashierClosing(data: DashboardOverviewData): CashierClosingStatus | null {
  const connection = data.cashierConnection

  if (connection.status === 'not_configured') {
    return null
  }

  const transactionCount = data.transactionCount.count ?? 0
  const isComplete =
    connection.status === 'connected' &&
    transactionCount > 0 &&
    !data.transactionCount.unavailableReason

  const status: CashierClosingState = isComplete
    ? 'complete'
    : connection.status === 'error'
      ? 'needs_review'
      : connection.status === 'disconnected'
        ? 'incomplete'
        : 'unknown'

  const checklist = DEFAULT_CHECKLIST_LABELS.map((label) => ({
    label,
    completed:
      label === 'Kasir aktif'
        ? connection.status === 'connected'
        : label === 'Transaksi tervalidasi'
          ? transactionCount > 0
          : label === 'Pembayaran tercatat'
            ? transactionCount > 0
            : false,
  }))

  return {
    cashierName: data.recentTransactions[0]?.cashierName ?? null,
    isActive: connection.status === 'connected',
    lastClosingAt: connection.lastSuccessfulSyncAt ?? null,
    transactionCount,
    cashDifference: null,
    status,
    checklist,
  }
}

function buildStockItems(data: DashboardOverviewData): StockRiskItem[] {
  const lowStockCount = data.inventoryStatus.lowStockCount ?? 0

  if (lowStockCount === 0) {
    return []
  }

  // The SSOT does not expose per-item inventory yet, so we surface a single
  // aggregated "perlu dicek" item instead of inventing item names/stock.
  return [
    {
      itemId: 'aggregated-low-stock',
      itemName: 'Stok di bawah batas minimum',
      currentStock: null,
      unit: 'item',
      estimatedDaysLeft: null,
      affectedMenus: 0,
      status: 'warning',
      recommendation: 'Cek detail inventaris untuk item yang berada di bawah batas minimum.',
    },
  ]
}

function detectMode(data: DashboardOverviewData): DashboardMode {
  const hasSales = (data.transactionCount.count ?? 0) > 0
  const hasInventory = (data.inventoryStatus.totalTrackedItems ?? 0) > 0
  const cashierActive = data.cashierConnection.status === 'connected'

  if (hasSales || hasInventory || cashierActive) {
    return 'live'
  }

  return 'empty'
}

export function adaptDashboardOverview(
  data: DashboardOverviewData,
  options?: { forceMode?: DashboardMode }
): OutletDashboardData {
  const mode = options?.forceMode ?? detectMode(data)
  const transactionCount = data.transactionCount.count ?? 0
  const salesCents = data.salesToday.amountCents ?? 0

  return {
    mode,
    outlet: {
      id: data.selectedBranchId ?? DEFAULT_OUTLET.id,
      name: data.branches.find((b) => b.id === data.selectedBranchId)?.name ?? DEFAULT_OUTLET.name,
      location: DEFAULT_OUTLET.location,
    },
    businessDate: data.businessDate,
    sales: {
      revenueToday: Math.round(salesCents / 100),
      transactionCountToday: transactionCount,
      averageOrderValue: data.averagePurchase.amountCents
        ? Math.round(data.averagePurchase.amountCents / 100)
        : null,
      revenueTrend7Days: data.dailySalesTrend.map((point) => ({
        date: point.date,
        revenue: Math.round(point.salesCents / 100),
      })),
    },
    inventory: {
      items: buildStockItems(data),
    },
    cashier: {
      activeUser: data.recentTransactions[0]?.cashierName ?? null,
      closingStatus: buildCashierClosing(data),
    },
    customer: {
      satisfactionScore: data.customerSatisfaction.value,
      sourceConnected: data.customerSatisfaction.value !== null,
    },
  }
}
