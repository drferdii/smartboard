export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/lib/admin/supabase/generated-types';

export type UserRole = 'owner' | 'staff';
export type MenuCategory = 'dayak' | 'smoked' | 'pedas' | 'minuman';
export type ExpenseCategory = 'bahan' | 'operasional' | 'gaji' | 'lain';
export type SummaryPeriod = 'today' | '7d' | '30d';
