/**
 * Honest demo and empty fixtures for the Outlet Command Dashboard.
 *
 * - `buildDemoOutletDashboardData` produces clearly-labelled sample data used
 *   only when the user explicitly enters Demo Mode. The UI must keep the
 *   "Demo Mode — Data contoh untuk preview dashboard" badge visible.
 * - `buildEmptyOutletDashboardData` produces the honest empty state used when
 *   no real data is available yet. Every number that cannot be verified is
 *   null/zero and the mode is `empty`.
 */

import type { OutletDashboardData } from './outlet-contracts'

const SEMAYOT_OUTLET = {
  id: 'rumah-makan-semayot',
  name: 'Rumah Makan Semayot',
  location: 'Bengkayang, Kalimantan Barat',
}

const BASE_CHECKLIST = [
  { label: 'Kasir aktif', completed: true },
  { label: 'Transaksi tervalidasi', completed: true },
  { label: 'Pembayaran tercatat', completed: true },
  { label: 'Void/refund dicek', completed: false },
  { label: 'Selisih kas dicek', completed: false },
  { label: 'Closing selesai', completed: false },
]

export function buildDemoOutletDashboardData(): OutletDashboardData {
  const today = new Date().toISOString().slice(0, 10)

  return {
    mode: 'demo',
    outlet: { ...SEMAYOT_OUTLET },
    businessDate: today,
    sales: {
      revenueToday: 1_250_000,
      transactionCountToday: 18,
      averageOrderValue: 69_444,
      revenueTrend7Days: [
        { date: '2026-06-30', revenue: 980_000 },
        { date: '2026-07-01', revenue: 1_120_000 },
        { date: '2026-07-02', revenue: 1_350_000 },
        { date: '2026-07-03', revenue: 1_080_000 },
        { date: '2026-07-04', revenue: 1_420_000 },
        { date: '2026-07-05', revenue: 1_560_000 },
        { date: '2026-07-06', revenue: 1_250_000 },
      ],
    },
    inventory: {
      items: [
        {
          itemId: 'ayam',
          itemName: 'Ayam',
          currentStock: 2,
          unit: 'kg',
          estimatedDaysLeft: 1,
          affectedMenus: 7,
          status: 'critical',
          recommendation: 'Restock sebelum jam ramai sore.',
        },
        {
          itemId: 'beras',
          itemName: 'Beras',
          currentStock: 6,
          unit: 'kg',
          estimatedDaysLeft: 2,
          affectedMenus: 4,
          status: 'warning',
          recommendation: 'Cek kebutuhan untuk akhir pekan.',
        },
        {
          itemId: 'gula',
          itemName: 'Gula',
          currentStock: 18,
          unit: 'kg',
          estimatedDaysLeft: 12,
          affectedMenus: 2,
          status: 'safe',
          recommendation: 'Stok aman.',
        },
      ],
    },
    cashier: {
      activeUser: 'Kasir Demo',
      closingStatus: {
        cashierName: 'Kasir Demo',
        isActive: true,
        lastClosingAt: null,
        transactionCount: 18,
        cashDifference: null,
        status: 'incomplete',
        checklist: BASE_CHECKLIST.map((item) => ({ ...item })),
      },
    },
    customer: {
      satisfactionScore: null,
      sourceConnected: false,
    },
  }
}

export function buildEmptyOutletDashboardData(): OutletDashboardData {
  const today = new Date().toISOString().slice(0, 10)

  return {
    mode: 'empty',
    outlet: { ...SEMAYOT_OUTLET },
    businessDate: today,
    sales: {
      revenueToday: 0,
      transactionCountToday: 0,
      averageOrderValue: null,
      revenueTrend7Days: [],
    },
    inventory: { items: [] },
    cashier: {
      activeUser: null,
      closingStatus: {
        cashierName: null,
        isActive: false,
        lastClosingAt: null,
        transactionCount: 0,
        cashDifference: null,
        status: 'unknown',
        checklist: BASE_CHECKLIST.map((label) => ({ ...label, completed: false })),
      },
    },
    customer: {
      satisfactionScore: null,
      sourceConnected: false,
    },
  }
}
