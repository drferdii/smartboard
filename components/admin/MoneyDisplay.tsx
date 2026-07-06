import { formatRupiah } from '@/lib/admin/format/money';

export function MoneyDisplay({ cents, className = '' }: { cents: number; className?: string }) {
  return <span className={className}>{formatRupiah(cents)}</span>;
}
