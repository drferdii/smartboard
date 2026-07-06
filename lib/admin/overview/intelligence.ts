/**
 * Pure dashboard intelligence helpers for the Outlet Command Dashboard.
 *
 * Rules of engagement:
 * - No I/O, no React, no dates-as-Date parsing — fully deterministic.
 * - Never fake data. If an input signal is missing, reflect it in reasons and
 *   reduce the score rather than inventing a number.
 * - Output Indonesian copy for UI labels; keep technical status values
 *   English (per Implementationplan.md).
 *
 * Scoring weights (MVP, from Implementationplan.md):
 *   transactions today   25%
 *   inventory safety      25%
 *   cashier closing       20%
 *   cashier activity      10%
 *   menu/sales movement   10%
 *   anomaly placeholder   10%
 */

import type {
  ActionItem,
  CashierClosingState,
  CashierClosingStatus,
  OutletDashboardData,
  OutletHealthScore,
  OutletHealthStatus,
  SemaBrief,
  StockRiskItem,
  StockRiskStatus,
} from './outlet-contracts'

const SCORE_WEIGHTS = {
  transactions: 0.25,
  inventory: 0.25,
  cashierClosing: 0.2,
  cashierActivity: 0.1,
  menuMovement: 0.1,
  anomaly: 0.1,
} as const

const STOCK_CRITICAL_THRESHOLD_DAYS = 1
const STOCK_WARNING_THRESHOLD_DAYS = 3

const HEALTH_STATUS_LABEL: Record<OutletHealthStatus, string> = {
  healthy: 'SEHAT',
  stable: 'STABIL',
  warning: 'WASPADA',
  critical: 'PERLU TINDAKAN',
  insufficient_data: 'DATA BELUM CUKUP',
}

const SEMA_QUICK_PROMPTS = [
  'Ringkas hari ini',
  'Cek stok rawan',
  'Cari menu terlaris',
  'Buat laporan owner',
  'Apa yang harus saya lakukan sekarang?',
]

export function classifyStockRisk(item: StockRiskItem): StockRiskStatus {
  if (item.currentStock === null || item.estimatedDaysLeft === null) {
    return 'unknown'
  }

  if (item.estimatedDaysLeft <= STOCK_CRITICAL_THRESHOLD_DAYS) {
    return 'critical'
  }

  if (item.estimatedDaysLeft <= STOCK_WARNING_THRESHOLD_DAYS) {
    return 'warning'
  }

  return 'safe'
}

type ScoreBreakdown = {
  total: number
  signals: {
    transactions: number
    inventory: number
    cashierClosing: number
    cashierActivity: number
    menuMovement: number
    anomaly: number
  }
  reasons: string[]
}

function scoreTransactions(count: number): number {
  if (count <= 0) return 0
  if (count >= 25) return 100
  return Math.round((count / 25) * 100)
}

function scoreInventory(items: StockRiskItem[]): number {
  if (items.length === 0) return 0
  const critical = items.filter((item) => classifyStockRisk(item) === 'critical').length
  const warning = items.filter((item) => classifyStockRisk(item) === 'warning').length
  const unknown = items.filter((item) => classifyStockRisk(item) === 'unknown').length

  const penalty = critical * 35 + warning * 15 + unknown * 8
  return Math.max(0, 100 - penalty)
}

function scoreCashierClosing(status: CashierClosingStatus | null): number {
  if (!status) return 0
  if (status.status === 'complete') return 100
  if (status.status === 'needs_review') return 60
  if (status.status === 'incomplete') return 30
  return 0
}

function scoreCashierActivity(activeUser: string | null): number {
  return activeUser ? 100 : 0
}

function scoreMenuMovement(transactionCount: number): number {
  if (transactionCount <= 0) return 0
  if (transactionCount >= 20) return 100
  return Math.round((transactionCount / 20) * 100)
}

function scoreAnomaly(): number {
  // Phase-1 placeholder: no anomaly detection yet. Neutral score so it does
  // not distort the total, but still reserves the weight for Phase 2.
  return 100
}

function buildScoreBreakdown(data: OutletDashboardData): ScoreBreakdown {
  const reasons: string[] = []
  const transactionsScore = scoreTransactions(data.sales.transactionCountToday)
  const inventoryScore = scoreInventory(data.inventory.items)
  const cashierClosingScore = scoreCashierClosing(data.cashier.closingStatus)
  const cashierActivityScore = scoreCashierActivity(data.cashier.activeUser)
  const menuMovementScore = scoreMenuMovement(data.sales.transactionCountToday)
  const anomalyScore = scoreAnomaly()

  if (transactionsScore < 100) {
    reasons.push(
      data.sales.transactionCountToday === 0
        ? 'Belum ada transaksi valid hari ini.'
        : 'Volume transaksi belum stabil.'
    )
  }
  if (inventoryScore < 100) {
    const risky = data.inventory.items.filter((item) => {
      const status = classifyStockRisk(item)
      return status === 'critical' || status === 'warning'
    })
    if (risky.length > 0) {
      reasons.push(`${risky.length} item stok perlu dipantau.`)
    }
  }
  if (cashierClosingScore < 100 && data.cashier.closingStatus) {
    reasons.push('Closing kasir belum lengkap.')
  }
  if (cashierActivityScore < 100) {
    reasons.push('Belum ada kasir aktif yang terdeteksi.')
  }
  if (!data.customer.sourceConnected) {
    reasons.push('Sumber kepuasan pelanggan belum terintegrasi.')
  }

  const total = Math.round(
    transactionsScore * SCORE_WEIGHTS.transactions +
      inventoryScore * SCORE_WEIGHTS.inventory +
      cashierClosingScore * SCORE_WEIGHTS.cashierClosing +
      cashierActivityScore * SCORE_WEIGHTS.cashierActivity +
      menuMovementScore * SCORE_WEIGHTS.menuMovement +
      anomalyScore * SCORE_WEIGHTS.anomaly
  )

  return {
    total,
    signals: {
      transactions: transactionsScore,
      inventory: inventoryScore,
      cashierClosing: cashierClosingScore,
      cashierActivity: cashierActivityScore,
      menuMovement: menuMovementScore,
      anomaly: anomalyScore,
    },
    reasons,
  }
}

function mapScoreToStatus(score: number | null): OutletHealthStatus {
  if (score === null) return 'insufficient_data'
  if (score >= 85) return 'healthy'
  if (score >= 70) return 'stable'
  if (score >= 50) return 'warning'
  return 'critical'
}

function hasActionableSignal(data: OutletDashboardData): boolean {
  return Boolean(
    data.sales.transactionCountToday > 0 ||
    data.inventory.items.length > 0 ||
    data.cashier.activeUser ||
    data.cashier.closingStatus
  )
}

export function buildOutletHealthScore(data: OutletDashboardData): OutletHealthScore {
  if (data.mode === 'empty' || !hasActionableSignal(data)) {
    return {
      score: null,
      status: 'insufficient_data',
      label: HEALTH_STATUS_LABEL.insufficient_data,
      summary:
        'Data belum cukup. Mulai dari input transaksi pertama, cek stok awal, dan validasi kasir aktif.',
      reasons: [
        'Transaksi hari ini belum tercatat.',
        'Inventaris belum diinput.',
        'Status kasir aktif belum tervalidasi.',
      ],
      recommendedAction:
        'Input transaksi pertama, cek stok awal, dan validasi kasir aktif untuk mengaktifkan Nadi Outlet.',
    }
  }

  const breakdown = buildScoreBreakdown(data)
  const status = mapScoreToStatus(breakdown.total)
  const label = HEALTH_STATUS_LABEL[status]

  const summary = buildHealthSummary(status, data, breakdown.total)
  const recommendedAction = buildHealthRecommendedAction(status, data)

  return {
    score: breakdown.total,
    status,
    label,
    summary,
    reasons: breakdown.reasons.length > 0 ? breakdown.reasons : ['Outlet dalam kondisi sehat.'],
    recommendedAction,
  }
}

function buildHealthSummary(
  status: OutletHealthStatus,
  data: OutletDashboardData,
  score: number
): string {
  if (status === 'healthy') {
    return `Outlet sehat (${score}/100). Operasional berjalan stabil dan tidak ada prioritas kritis.`
  }
  if (status === 'stable') {
    return `Outlet stabil (${score}/100). Beberapa item perlu dipantau namun tidak ada gangguan kritis.`
  }
  if (status === 'warning') {
    return `Outlet aktif tetapi transaksi belum stabil dan stok perlu dicek (${score}/100).`
  }
  return `Outlet memerlukan tindakan (${score}/100). Transaksi rendah dan ada risiko operasional.`
}

function buildHealthRecommendedAction(
  status: OutletHealthStatus,
  data: OutletDashboardData
): string {
  if (status === 'healthy') {
    return 'Lanjutkan operasional dan buat laporan owner hari ini.'
  }
  if (data.sales.transactionCountToday === 0) {
    return 'Input transaksi pertama dan validasi kasir aktif sebelum jam ramai.'
  }
  const risky = data.inventory.items.filter((item) => {
    const risk = classifyStockRisk(item)
    return risk === 'critical' || risk === 'warning'
  })
  if (risky.length > 0) {
    return 'Restock item kritis sebelum jam ramai dan validasi closing kasir.'
  }
  return 'Validasi closing kasir dan pastikan semua transaksi terekam.'
}

export function buildTodayPriorities(data: OutletDashboardData): ActionItem[] {
  const actions: ActionItem[] = []

  const criticalStock = data.inventory.items.filter(
    (item) => classifyStockRisk(item) === 'critical'
  )

  if (criticalStock.length > 0) {
    actions.push({
      id: 'critical-stock',
      title: 'Cek stok kritis',
      description: `${criticalStock.length} item berisiko habis dan dapat mengganggu penjualan.`,
      severity: 'critical',
      source: 'inventory',
      actionLabel: 'Cek stok',
      actionHref: '/admin/inventory',
    })
  }

  if (data.sales.transactionCountToday === 0) {
    actions.push({
      id: 'no-transaction',
      title: 'Input transaksi pertama',
      description: 'Belum ada transaksi valid hari ini.',
      severity: 'important',
      source: 'sales',
      actionLabel: 'Buka transaksi',
      actionHref: '/admin/pos',
    })
  }

  const closingIncomplete =
    !data.cashier.closingStatus ||
    data.cashier.closingStatus.status === 'incomplete' ||
    data.cashier.closingStatus.status === 'needs_review' ||
    data.cashier.closingStatus.status === 'unknown'

  if (closingIncomplete) {
    actions.push({
      id: 'closing-incomplete',
      title: 'Validasi closing kasir',
      description: 'Closing kasir belum lengkap atau perlu dicek.',
      severity: 'important',
      source: 'cashier',
      actionLabel: 'Cek closing',
      actionHref: '/admin/transactions',
    })
  }

  if (!data.customer.sourceConnected) {
    actions.push({
      id: 'customer-source-disconnected',
      title: 'Hubungkan sumber kepuasan pelanggan',
      description: 'Indeks kepuasan belum bisa dihitung karena sumber data belum terintegrasi.',
      severity: 'normal',
      source: 'system',
      actionLabel: 'Cek integrasi',
      actionHref: '/admin/settings',
    })
  }

  if (actions.length === 0) {
    actions.push({
      id: 'stable-outlet',
      title: 'Outlet stabil',
      description: 'Tidak ada prioritas kritis saat ini. Laporan owner bisa dibuat.',
      severity: 'normal',
      source: 'report',
      actionLabel: 'Buat laporan',
      actionHref: '/admin/reports',
    })
  }

  return actions.slice(0, 5)
}

export function buildCashierClosingStatus(data: OutletDashboardData): CashierClosingStatus {
  if (!data.cashier.closingStatus) {
    return {
      cashierName: null,
      isActive: false,
      lastClosingAt: null,
      transactionCount: 0,
      cashDifference: null,
      status: 'unknown' satisfies CashierClosingState,
      checklist: [],
    }
  }

  return data.cashier.closingStatus
}

export function buildSemaBrief(data: OutletDashboardData, priorities: ActionItem[]): SemaBrief {
  const greeting = buildSemaGreeting()

  if (data.mode === 'empty') {
    return {
      greeting,
      summary:
        'Chief, outlet belum memiliki transaksi valid hari ini. Stok dan closing kasir juga belum dapat diverifikasi. Mulai dari input transaksi pertama, cek stok awal, dan validasi kasir aktif.',
      risks: ['Belum ada transaksi valid.', 'Stok belum diinput.', 'Closing kasir belum tersedia.'],
      recommendedActions: priorities,
      quickPrompts: SEMA_QUICK_PROMPTS,
    }
  }

  const risks: string[] = []
  const criticalStock = data.inventory.items.filter(
    (item) => classifyStockRisk(item) === 'critical'
  )
  if (criticalStock.length > 0) {
    risks.push(`${criticalStock.length} item stok berstatus kritis dan berisiko habis.`)
  }
  if (data.sales.transactionCountToday === 0) {
    risks.push('Belum ada transaksi valid hari ini.')
  }
  if (data.cashier.closingStatus && data.cashier.closingStatus.status !== 'complete') {
    risks.push('Closing kasir belum lengkap.')
  }
  if (!data.customer.sourceConnected) {
    risks.push('Indeks kepuasan pelanggan belum terintegrasi.')
  }

  const summary = buildSemaSummary(data, priorities)

  return {
    greeting,
    summary,
    risks,
    recommendedActions: priorities,
    quickPrompts: SEMA_QUICK_PROMPTS,
  }
}

function buildSemaGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 11 && hour < 15) return 'Selamat siang, Chief'
  if (hour >= 15 && hour < 18) return 'Selamat sore, Chief'
  if (hour >= 18 || hour < 5) return 'Selamat malam, Chief'
  return 'Selamat pagi, Chief'
}

function buildSemaSummary(data: OutletDashboardData, priorities: ActionItem[]): string {
  const parts: string[] = []

  if (data.sales.transactionCountToday > 0) {
    parts.push(`Penjualan hari ini mencatat ${data.sales.transactionCountToday} transaksi.`)
  } else {
    parts.push('Outlet belum memiliki transaksi valid hari ini.')
  }

  const riskyCount = data.inventory.items.filter((item) => {
    const status = classifyStockRisk(item)
    return status === 'critical' || status === 'warning'
  }).length
  if (riskyCount > 0) {
    parts.push(`Stok perlu dipantau pada ${riskyCount} item.`)
  }

  if (data.cashier.closingStatus && data.cashier.closingStatus.status !== 'complete') {
    parts.push('Closing kasir terakhir belum lengkap.')
  }

  const firstCritical = priorities.find((p) => p.severity === 'critical')
  if (firstCritical) {
    parts.push(`Prioritas pertama: ${firstCritical.title.toLowerCase()}.`)
  } else if (priorities.length > 0 && priorities[0].id !== 'stable-outlet') {
    parts.push(`Prioritas pertama: ${priorities[0].title.toLowerCase()}.`)
  } else {
    parts.push('Outlet dalam kondisi stabil.')
  }

  return parts.join(' ')
}
