/**
 * Outlet Command Dashboard contracts.
 *
 * These types are the view-model layer for the actionable dashboard modules
 * (Nadi Outlet, Today Priority, SEMA Brief, Stock Radar, Cashier Closing).
 * They are intentionally separated from `DashboardOverviewData` (the SSOT that
 * comes from the backend summary loader) so the dashboard intelligence helpers
 * stay pure, deterministic, and easy to test.
 *
 * Adapter helpers in `lib/admin/overview/outlet-adapter.ts` convert the SSOT
 * payload into `OutletDashboardData`.
 */

export type DashboardMode = 'live' | 'demo' | 'empty'

export type OutletHealthStatus = 'healthy' | 'stable' | 'warning' | 'critical' | 'insufficient_data'

export type ActionSeverity = 'critical' | 'important' | 'normal'

export type ActionSource = 'sales' | 'inventory' | 'cashier' | 'menu' | 'report' | 'system'

export type StockRiskStatus = 'critical' | 'warning' | 'safe' | 'unknown'

export type CashierClosingState = 'complete' | 'incomplete' | 'needs_review' | 'unknown'

export interface OutletHealthScore {
  score: number | null
  status: OutletHealthStatus
  label: string
  summary: string
  reasons: string[]
  recommendedAction: string
}

export interface ActionItem {
  id: string
  title: string
  description: string
  severity: ActionSeverity
  source: ActionSource
  actionLabel: string
  actionHref?: string
}

export interface StockRiskItem {
  itemId: string
  itemName: string
  currentStock: number | null
  unit: string
  estimatedDaysLeft: number | null
  affectedMenus: number
  status: StockRiskStatus
  recommendation: string
}

export interface CashierClosingChecklistItem {
  label: string
  completed: boolean
}

export interface CashierClosingStatus {
  cashierName: string | null
  isActive: boolean
  lastClosingAt: string | null
  transactionCount: number
  cashDifference: number | null
  status: CashierClosingState
  checklist: CashierClosingChecklistItem[]
}

export interface SemaBrief {
  greeting: string
  summary: string
  risks: string[]
  recommendedActions: ActionItem[]
  quickPrompts: string[]
}

export interface OutletDashboardData {
  mode: DashboardMode
  outlet: {
    id: string
    name: string
    location?: string
  }
  businessDate: string
  sales: {
    revenueToday: number
    transactionCountToday: number
    averageOrderValue: number | null
    revenueTrend7Days: {
      date: string
      revenue: number
    }[]
  }
  inventory: {
    items: StockRiskItem[]
  }
  cashier: {
    activeUser: string | null
    closingStatus: CashierClosingStatus | null
  }
  customer: {
    satisfactionScore: number | null
    sourceConnected: boolean
  }
}
