'use client';

import { useEffect, useState } from 'react';
import { MoneyDisplay } from '@/components/admin/MoneyDisplay';

type TxItem = {
  id: string;
  menu_item_id: string;
  name_snapshot: string;
  price_cents_snapshot: number;
  quantity: number;
  subtotal_cents: number;
};

type Transaction = {
  id: string;
  total_cents: number;
  paid_cents: number;
  change_cents: number;
  note: string | null;
  created_at: string;
  transaction_items: TxItem[];
};

export function TransactionDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const [data, setData] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/transactions/${id}`)
      .then((r) => r.json())
      .then((json) => {
        setData(json.data ?? null);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-card border-2 border-foreground max-w-md w-full max-h-[85vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-background">
          <div>
            <span className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">
              TRANSAKSI_LOG
            </span>
            <h3 className="font-display font-bold text-base text-foreground uppercase tracking-wider">
              Detail Transaksi Kasir
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="font-mono text-xs font-bold text-foreground hover:text-muted-foreground border border-border px-3 py-1.5 bg-card transition-colors"
          >
            TUTUP
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest py-8 text-center animate-pulse">
              Memuat data kuitansi...
            </div>
          ) : !data ? (
            <div className="font-mono text-xs text-red-600 border border-red-600/20 bg-red-600/5 p-4 uppercase tracking-wider">
              ERROR: Transaksi tidak ditemukan.
            </div>
          ) : (
            <>
              {/* Meta Info */}
              <div className="font-mono text-[10px] text-muted-foreground space-y-1 pb-4 border-b border-border/60">
                <div>
                  <span className="font-bold">WAKTU INPUT:</span>{' '}
                  <span className="text-foreground font-bold">
                    {new Date(data.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' }).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-bold">ID REFERENSI:</span>{' '}
                  <span className="text-foreground font-bold">{data.id.toUpperCase()}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-foreground">
                    <th className="text-left font-mono text-[9px] uppercase text-muted-foreground pb-2 font-bold tracking-widest">Daftar Item</th>
                    <th className="text-right font-mono text-[9px] uppercase text-muted-foreground pb-2 font-bold tracking-widest">Qty</th>
                    <th className="text-right font-mono text-[9px] uppercase text-muted-foreground pb-2 font-bold tracking-widest">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.transaction_items ?? []).map((it) => (
                    <tr key={it.id} className="border-b border-border/40 hover:bg-background/25">
                      <td className="py-3">
                        <div className="font-display font-medium text-sm text-foreground">{it.name_snapshot}</div>
                        <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
                          <MoneyDisplay cents={it.price_cents_snapshot} /> / unit
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-xs font-bold text-muted-foreground tabular-nums">
                        {it.quantity}
                      </td>
                      <td className="py-3 text-right font-mono text-xs font-bold text-foreground tabular-nums">
                        <MoneyDisplay cents={it.subtotal_cents} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="border-t-[3px] border-double border-foreground pt-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-bold">TOTAL TAGIHAN</span>
                  <span className="font-bold text-foreground tabular-nums">
                    <MoneyDisplay cents={data.total_cents} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-bold">TUNAI DIBAYAR</span>
                  <span className="text-muted-foreground font-bold tabular-nums">
                    <MoneyDisplay cents={data.paid_cents} />
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 text-sm">
                  <span className="text-foreground font-bold">KEMBALIAN</span>
                  <span className="text-emerald-700 font-bold tabular-nums">
                    <MoneyDisplay cents={data.change_cents} />
                  </span>
                </div>
              </div>

              {/* Note */}
              {data.note && (
                <div className="p-4 border border-border bg-background/50 font-mono text-[10px] text-muted-foreground space-y-1">
                  <div className="font-bold uppercase tracking-wider">CATATAN TRANSAKSI:</div>
                  <p className="font-sans text-xs text-foreground leading-relaxed">{data.note}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
