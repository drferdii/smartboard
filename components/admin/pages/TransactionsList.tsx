'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MoneyDisplay } from '@/components/admin/MoneyDisplay';
import { TransactionDetail } from './TransactionDetail';

type Transaction = {
  id: string;
  staff_id: string;
  total_cents: number;
  paid_cents: number;
  change_cents: number;
  note: string | null;
  created_at: string;
};

export function TransactionsList() {
  const pathname = usePathname();
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/transactions')
      .then((r) => r.json())
      .then((json) => {
        setItems(json.data ?? []);
        setLoading(false);
      });
  }, [pathname]);

  if (loading) {
    return (
      <div className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest py-8 animate-pulse">
        Menyelaraskan dengan database transaksi...
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-11 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block mb-1 font-bold">
            Buku Audit Keuangan
          </span>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground uppercase">
            Logbook Transaksi Kasir
          </h2>
        </div>
        <span className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline">
          DATABASE_LOGS
        </span>
      </div>

      {items.length === 0 ? (
        <div className="border border-border bg-card p-12 text-center">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Belum terdeteksi adanya data transaksi masuk.
          </p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-card border-b border-border">
                <th className="text-left font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">Waktu Input</th>
                <th className="text-left font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">ID Transaksi</th>
                <th className="text-right font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">Total Belanja</th>
                <th className="text-right font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">Tunai Diterima</th>
                <th className="text-right font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">Uang Kembali</th>
                <th className="text-right font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b border-border/60 hover:bg-card/30 transition-colors">
                  <td className="py-4 px-4 font-mono text-[10px] text-muted-foreground font-bold">
                    {new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' }).toUpperCase()}
                  </td>
                  <td className="py-4 px-4 font-mono text-[10px] font-bold text-foreground">
                    {t.id.slice(0, 8).toUpperCase()}_TX
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-xs font-bold text-foreground tabular-nums">
                    <MoneyDisplay cents={t.total_cents} />
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-xs font-bold text-muted-foreground tabular-nums">
                    <MoneyDisplay cents={t.paid_cents} />
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-xs font-bold text-muted-foreground tabular-nums">
                    <MoneyDisplay cents={t.change_cents} />
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-[9px] font-bold uppercase tracking-widest">
                    <button 
                      onClick={() => setSelected(t.id)} 
                      className="text-foreground hover:text-muted-foreground transition-colors border border-border px-3 py-1 bg-background"
                    >
                      DETAIL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        </div>
        {/* Vertical Branding */}
        <div className="hidden md:flex md:col-span-1 justify-center pt-16 select-none opacity-20 hover:opacity-40 transition-opacity duration-300">
          <div className="font-mono text-[9px] font-black uppercase tracking-[0.3em] branding-vertical text-center whitespace-nowrap">
            LOG TRANSAKSI SEMAYOT
          </div>
        </div>
      </div>
      {selected && <TransactionDetail id={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
