export type DashboardCurrency = 'IDR';
export type DashboardDataSource = 'cashier' | 'pos' | 'database';
export type CashierConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'not_configured';
export type OperationalStatusLevel = 'normal' | 'warning' | 'critical' | 'unknown';

export type DashboardMetricDelta = {
  percentageChange: number | null;
  label: string;
  unavailableReason?: string;
};

export type DashboardSalesToday = {
  amountCents: number | null;
  currency: DashboardCurrency;
  source: DashboardDataSource;
  transactionIdsIncluded: string[];
  delta: DashboardMetricDelta;
  unavailableReason?: string;
};

export type DashboardAveragePurchase = {
  amountCents: number | null;
  currency: DashboardCurrency;
  calculation: 'salesToday / transactionCount';
  delta: DashboardMetricDelta;
  unavailableReason?: string;
};

export type DashboardTransactionCount = {
  count: number | null;
  source: DashboardDataSource;
  delta: DashboardMetricDelta;
  unavailableReason?: string;
};

export type DashboardCustomerSatisfaction = {
  value: number | null;
  unit: 'percent' | null;
  source: string | null;
  unavailableReason?: string;
};

export type DashboardWeather = {
  location: string;
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeedKmh?: number;
  source: string;
  fetchedAt?: string;
  unavailableReason?: string;
};

export type DashboardCashierConnection = {
  status: CashierConnectionStatus;
  provider: string;
  lastSuccessfulSyncAt?: string;
  lastError?: string;
};

export type DashboardOperationalStatus = {
  status: OperationalStatusLevel;
  reason: string;
  basedOn: string[];
};

export type DashboardRecentTransaction = {
  id: string;
  timestamp: string;
  totalAmountCents: number;
  currency: DashboardCurrency;
  paymentStatus: 'paid' | 'refunded' | 'void' | 'pending';
  source: DashboardDataSource;
  cashierName: string | null;
  itemSummary: string[];
};

export type DashboardTrendPoint = {
  date: string;
  salesCents: number;
  transactionCount: number;
};

export type DashboardTopMenuItem = {
  name: string;
  quantity: number;
  revenueCents: number;
  sharePercent: number;
};

export type DashboardInventoryStatus = {
  coveragePercent: number | null;
  lowStockCount: number | null;
  totalTrackedItems: number | null;
  source: string;
  unavailableReason?: string;
};

export type DashboardBranch = {
  id: string;
  name: string;
};

export type DashboardOverviewData = {
  businessDate: string;
  timezone: string;
  generatedAt: string;
  dataFreshnessSeconds: number;
  salesToday: DashboardSalesToday;
  averagePurchase: DashboardAveragePurchase;
  transactionCount: DashboardTransactionCount;
  customerSatisfaction: DashboardCustomerSatisfaction;
  weather: DashboardWeather;
  cashierConnection: DashboardCashierConnection;
  operationalStatus: DashboardOperationalStatus;
  recentTransactions: DashboardRecentTransaction[];
  dailySalesTrend: DashboardTrendPoint[];
  topMenuItems: DashboardTopMenuItem[];
  inventoryStatus: DashboardInventoryStatus;
  branches: DashboardBranch[];
  selectedBranchId: string | null;
  agentMessages: string[];
  auditNotes: string[];
};
