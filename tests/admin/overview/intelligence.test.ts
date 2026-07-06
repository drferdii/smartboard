import { describe, expect, it } from 'vitest'

import {
  buildCashierClosingStatus,
  buildOutletHealthScore,
  buildSemaBrief,
  buildTodayPriorities,
  classifyStockRisk,
} from '@/lib/admin/overview/intelligence'
import type { OutletDashboardData, StockRiskItem } from '@/lib/admin/overview/outlet-contracts'
import {
  buildEmptyOutletDashboardData,
  buildDemoOutletDashboardData,
} from '@/lib/admin/overview/outlet-fixtures'

function buildLiveBase(overrides: Partial<OutletDashboardData> = {}): OutletDashboardData {
  return {
    ...buildDemoOutletDashboardData(),
    mode: 'live',
    ...overrides,
  }
}

describe('classifyStockRisk', () => {
  it('returns critical when estimated days left is 0 or below threshold', () => {
    const item: StockRiskItem = {
      itemId: 'ayam',
      itemName: 'Ayam',
      currentStock: 2,
      unit: 'kg',
      estimatedDaysLeft: 0,
      affectedMenus: 7,
      status: 'critical',
      recommendation: 'Restock segera',
    }
    expect(classifyStockRisk(item)).toBe('critical')
  })

  it('returns warning when days left is within low threshold', () => {
    const item: StockRiskItem = {
      itemId: 'beras',
      itemName: 'Beras',
      currentStock: 5,
      unit: 'kg',
      estimatedDaysLeft: 2,
      affectedMenus: 3,
      status: 'warning',
      recommendation: 'Cek stok',
    }
    expect(classifyStockRisk(item)).toBe('warning')
  })

  it('returns unknown when stock and days left are null', () => {
    const item: StockRiskItem = {
      itemId: 'minyak',
      itemName: 'Minyak',
      currentStock: null,
      unit: 'liter',
      estimatedDaysLeft: null,
      affectedMenus: 0,
      status: 'unknown',
      recommendation: 'Input stok awal',
    }
    expect(classifyStockRisk(item)).toBe('unknown')
  })

  it('returns safe when days left is comfortably above threshold', () => {
    const item: StockRiskItem = {
      itemId: 'gula',
      itemName: 'Gula',
      currentStock: 20,
      unit: 'kg',
      estimatedDaysLeft: 14,
      affectedMenus: 1,
      status: 'safe',
      recommendation: 'Stok aman',
    }
    expect(classifyStockRisk(item)).toBe('safe')
  })
})

describe('buildOutletHealthScore', () => {
  it('returns insufficient_data status with null score when mode is empty', () => {
    const score = buildOutletHealthScore(buildEmptyOutletDashboardData())
    expect(score.score).toBeNull()
    expect(score.status).toBe('insufficient_data')
    expect(score.reasons.length).toBeGreaterThan(0)
    expect(score.recommendedAction.length).toBeGreaterThan(0)
  })

  it('maps score 90 with healthy signals to healthy status', () => {
    const data: OutletDashboardData = {
      ...buildDemoOutletDashboardData(),
      mode: 'live',
      sales: {
        revenueToday: 1_500_000_00,
        transactionCountToday: 30,
        averageOrderValue: 50_000_00,
        revenueTrend7Days: [],
      },
      inventory: {
        items: [
          {
            itemId: 'gula',
            itemName: 'Gula',
            currentStock: 20,
            unit: 'kg',
            estimatedDaysLeft: 14,
            affectedMenus: 1,
            status: 'safe',
            recommendation: 'Stok aman.',
          },
        ],
      },
      customer: { satisfactionScore: 92, sourceConnected: true },
    }
    const closingStatus = data.cashier.closingStatus
    if (!closingStatus) {
      throw new Error('Expected closing status in demo fixture')
    }
    data.cashier.closingStatus = {
      ...closingStatus,
      status: 'complete',
    }
    const score = buildOutletHealthScore(data)
    expect(score.score).not.toBeNull()
    expect(score.status).toBe('healthy')
  })

  it('produces a numeric score between 0 and 100 for live data', () => {
    const score = buildOutletHealthScore(buildLiveBase())
    const numericScore = score.score
    expect(typeof numericScore).toBe('number')
    if (numericScore === null) {
      throw new Error('Expected a numeric score for live data')
    }
    expect(numericScore).toBeGreaterThanOrEqual(0)
    expect(numericScore).toBeLessThanOrEqual(100)
  })

  it('returns critical/warning status when score falls below stable threshold', () => {
    const data = buildLiveBase({
      sales: {
        revenueToday: 0,
        transactionCountToday: 0,
        averageOrderValue: null,
        revenueTrend7Days: [],
      },
    })
    const score = buildOutletHealthScore(data)
    expect(['warning', 'critical', 'insufficient_data']).toContain(score.status)
  })
})

describe('buildTodayPriorities', () => {
  it('places critical stock priority first when critical stock exists', () => {
    const data = buildLiveBase({
      inventory: {
        items: [
          {
            itemId: 'ayam',
            itemName: 'Ayam',
            currentStock: 1,
            unit: 'kg',
            estimatedDaysLeft: 0,
            affectedMenus: 7,
            status: 'critical',
            recommendation: 'Restock segera',
          },
        ],
      },
    })
    const priorities = buildTodayPriorities(data)
    expect(priorities[0].id).toBe('critical-stock')
    expect(priorities[0].severity).toBe('critical')
  })

  it('includes no-transaction priority when transaction count is zero', () => {
    const data = buildLiveBase({
      sales: {
        revenueToday: 0,
        transactionCountToday: 0,
        averageOrderValue: null,
        revenueTrend7Days: [],
      },
    })
    const priorities = buildTodayPriorities(data)
    expect(priorities.some((p) => p.id === 'no-transaction')).toBe(true)
  })

  it('includes closing validation when closing status is incomplete', () => {
    const data = buildLiveBase()
    const closingStatus = data.cashier.closingStatus
    if (!closingStatus) {
      throw new Error('Expected closing status in demo fixture')
    }
    data.cashier.closingStatus = {
      ...closingStatus,
      status: 'incomplete',
    }
    const priorities = buildTodayPriorities(data)
    expect(priorities.some((p) => p.id === 'closing-incomplete')).toBe(true)
  })

  it('shows stable outlet priority when all signals are healthy', () => {
    const data = buildLiveBase({
      sales: {
        revenueToday: 1_500_000_00,
        transactionCountToday: 30,
        averageOrderValue: 50_000_00,
        revenueTrend7Days: [],
      },
      inventory: { items: [] },
      customer: { satisfactionScore: 92, sourceConnected: true },
    })
    const closingStatus = data.cashier.closingStatus
    if (!closingStatus) {
      throw new Error('Expected closing status in demo fixture')
    }
    data.cashier.closingStatus = {
      ...closingStatus,
      status: 'complete',
    }
    const priorities = buildTodayPriorities(data)
    expect(priorities.some((p) => p.id === 'stable-outlet')).toBe(true)
  })

  it('limits priorities to at most 5 items', () => {
    const priorities = buildTodayPriorities(buildLiveBase())
    expect(priorities.length).toBeLessThanOrEqual(5)
  })
})

describe('buildCashierClosingStatus', () => {
  it('returns unknown when no closing status is provided', () => {
    const data = buildLiveBase()
    data.cashier.closingStatus = null
    const status = buildCashierClosingStatus(data)
    expect(status.status).toBe('unknown')
  })

  it('passes through a complete closing status', () => {
    const data = buildLiveBase()
    const status = buildCashierClosingStatus(data)
    expect(status.status).toBe(data.cashier.closingStatus?.status)
  })
})

describe('buildSemaBrief', () => {
  it('produces greeting, summary, risks, and quick prompts', () => {
    const data = buildLiveBase()
    const priorities = buildTodayPriorities(data)
    const brief = buildSemaBrief(data, priorities)
    expect(brief.greeting.length).toBeGreaterThan(0)
    expect(brief.summary.length).toBeGreaterThan(0)
    expect(Array.isArray(brief.risks)).toBe(true)
    expect(brief.quickPrompts.length).toBeGreaterThan(0)
    expect(brief.recommendedActions).toEqual(priorities)
  })

  it('explains missing data when mode is empty', () => {
    const data = buildEmptyOutletDashboardData()
    const priorities = buildTodayPriorities(data)
    const brief = buildSemaBrief(data, priorities)
    expect(brief.summary.toLowerCase()).toContain('belum')
  })
})

describe('outlet fixtures', () => {
  it('empty fixture is marked as empty mode', () => {
    expect(buildEmptyOutletDashboardData().mode).toBe('empty')
  })

  it('demo fixture is marked as demo mode', () => {
    expect(buildDemoOutletDashboardData().mode).toBe('demo')
  })
})
