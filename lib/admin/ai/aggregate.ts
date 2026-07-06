import { createClient } from '@/lib/admin/supabase/server';
import { formatRupiahPlain } from './format';

export type Period = 'today' | '7d' | '30d';

export type AggregatedSummary = {
  period: Period;
  start_date: string;
  end_date: string;
  transaction_count: number;
  total_revenue_cents: number;
  total_expense_cents: number;
  net_profit_cents: number;
  top_items: Array<{ name: string; quantity: number; revenue_cents: number }>;
  expenses_by_category: Record<string, number>;
};

function periodDates(period: Period): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  let start: Date;
  if (period === 'today') {
    start = now;
  } else if (period === '7d') {
    start = new Date(now.getTime() - 6 * 86400000);
  } else {
    start = new Date(now.getTime() - 29 * 86400000);
  }
  return { start: start.toISOString().slice(0, 10), end };
}

export async function aggregateSummary(period: Period): Promise<AggregatedSummary> {
  const supabase = await createClient();
  const { start, end } = periodDates(period);

  const endExclusive = new Date(new Date(end).getTime() + 86400000)
    .toISOString()
    .slice(0, 10);

  const { data: txs } = await supabase
    .from('transactions')
    .select('id, total_cents')
    .gte('created_at', `${start}T00:00:00`)
    .lt('created_at', `${endExclusive}T00:00:00`);

  const { data: exps } = await supabase
    .from('expenses')
    .select('category, amount_cents')
    .gte('incurred_at', start)
    .lte('incurred_at', end);

  const txCount = txs?.length ?? 0;
  const revenue = (txs ?? []).reduce((s, t) => s + t.total_cents, 0);
  const expenseTotal = (exps ?? []).reduce((s, e) => s + e.amount_cents, 0);

  const expensesByCategory = (exps ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount_cents;
    return acc;
  }, {});

  const topItems: AggregatedSummary['top_items'] = [];
  const txIds = (txs ?? []).map((t) => t.id);
  if (txIds.length > 0) {
    const { data: items } = await supabase
      .from('transaction_items')
      .select('name_snapshot, quantity, subtotal_cents')
      .in('transaction_id', txIds);

    const itemMap = new Map<string, { quantity: number; revenue_cents: number }>();
    for (const it of items ?? []) {
      const cur = itemMap.get(it.name_snapshot) ?? { quantity: 0, revenue_cents: 0 };
      itemMap.set(it.name_snapshot, {
        quantity: cur.quantity + it.quantity,
        revenue_cents: cur.revenue_cents + it.subtotal_cents,
      });
    }
    for (const [name, v] of itemMap.entries()) {
      topItems.push({ name, quantity: v.quantity, revenue_cents: v.revenue_cents });
    }
    topItems.sort((a, b) => b.revenue_cents - a.revenue_cents);
    topItems.splice(5);
  }

  return {
    period,
    start_date: start,
    end_date: end,
    transaction_count: txCount,
    total_revenue_cents: revenue,
    total_expense_cents: expenseTotal,
    net_profit_cents: revenue - expenseTotal,
    top_items: topItems,
    expenses_by_category: expensesByCategory,
  };
}

export function formatSummaryForPrompt(s: AggregatedSummary): string {
  const lines: string[] = [];
  lines.push(`Periode: ${s.start_date} s/d ${s.end_date} (${s.period})`);
  lines.push(`Jumlah transaksi: ${s.transaction_count}`);
  lines.push(`Total pendapatan: ${formatRupiahPlain(s.total_revenue_cents)}`);
  lines.push(`Total pengeluaran: ${formatRupiahPlain(s.total_expense_cents)}`);
  lines.push(`Net profit: ${formatRupiahPlain(s.net_profit_cents)}`);
  if (Object.keys(s.expenses_by_category).length > 0) {
    lines.push('Pengeluaran per kategori:');
    for (const [cat, cents] of Object.entries(s.expenses_by_category)) {
      lines.push(`  - ${cat}: ${formatRupiahPlain(cents)}`);
    }
  }
  if (s.top_items.length > 0) {
    lines.push('Top menu (by revenue):');
    for (const it of s.top_items) {
      lines.push(`  - ${it.name}: ${it.quantity} porsi, ${formatRupiahPlain(it.revenue_cents)}`);
    }
  }
  return lines.join('\n');
}
