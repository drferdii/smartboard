'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseCreateSchema, type ExpenseCreate } from '@/lib/admin/schemas/expense';
import { MoneyDisplay } from '@/components/admin/MoneyDisplay';

type Expense = {
  id: string;
  category: 'bahan' | 'operasional' | 'gaji' | 'lain';
  amount_cents: number;
  description: string | null;
  incurred_at: string;
  created_at: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  bahan: 'BAHAN BAKU',
  operasional: 'OPERASIONAL',
  gaji: 'GAJI KARYAWAN',
  lain: 'LAIN-LAIN',
};

export function ExpensesView() {
  const pathname = usePathname();
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [displayAmount, setDisplayAmount] = useState("");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseCreate>({
    resolver: zodResolver(expenseCreateSchema),
    defaultValues: {
      category: 'bahan',
      amount_cents: 0,
      description: '',
      incurred_at: new Date().toISOString().slice(0, 10),
    },
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/expenses');
      const j = await r.json();
      if (r.ok) setItems(j.data ?? []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [pathname]);

  const onSubmit = async (data: ExpenseCreate) => {
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const payload = { ...data, amount_cents: Math.round(data.amount_cents * 100) };
      const r = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (r.ok) {
        setSuccessMsg('Pengeluaran berhasil dicatat.');
        reset({ category: 'bahan', amount_cents: 0, description: '', incurred_at: new Date().toISOString().slice(0, 10) });
        setDisplayAmount("");
        await load();
      } else {
        setError(j.error?.message ?? 'Gagal menyimpan.');
      }
    } catch (e: any) {
      console.error(e);
      setError(e instanceof SyntaxError ? 'Respons server tidak valid (500).' : (e.message || 'Koneksi jaringan terputus.'));
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="font-mono text-xs text-red-600 border border-red-600/20 bg-red-600/5 p-4 uppercase tracking-wider">
          PROCESS_ERROR: {error}
        </div>
      )}
      {successMsg && (
        <div className="font-mono text-xs text-emerald-700 border border-emerald-600/20 bg-emerald-600/5 p-4 uppercase tracking-wider">
          RECORD_OK: {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Input */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-5 border border-border bg-card p-6 space-y-4">
          <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider border-b border-border pb-3">
            Catat Pengeluaran Baru
          </h3>

          <div className="space-y-1">
            <label className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Tanggal Transaksi *</label>
            <input 
              type="date" 
              {...register('incurred_at')} 
              className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground" 
            />
            {errors.incurred_at && <p className="font-mono text-[9px] text-red-600 mt-1 uppercase tracking-wider">{errors.incurred_at.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Kategori Biaya *</label>
            <select 
              {...register('category')} 
              className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground uppercase font-bold"
            >
              <option value="bahan">BAHAN BAKU</option>
              <option value="operasional">OPERASIONAL</option>
              <option value="gaji">GAJI KARYAWAN</option>
              <option value="lain">LAIN-LAIN</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Nominal (Rp) *</label>
            <input type="hidden" {...register('amount_cents', { valueAsNumber: true })} />
            <input
              type="text"
              value={displayAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setDisplayAmount(val ? parseInt(val, 10).toLocaleString('id-ID') : "");
                setValue('amount_cents', val ? parseInt(val, 10) : 0, { shouldValidate: true });
              }}
              className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
              placeholder="cth: 30.000"
            />
            {errors.amount_cents && <p className="font-mono text-[9px] text-red-600 mt-1 uppercase tracking-wider">{errors.amount_cents.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Deskripsi / Detail</label>
            <input 
              {...register('description')} 
              className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground" 
              placeholder="cth: Belu bumbu dapur atau sayur" 
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full border border-foreground bg-foreground text-background font-mono text-[10px] font-bold py-3.5 uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50"
          >
            {submitting ? 'Menyimpan Log...' : 'Catat Pengeluaran'}
          </button>
        </form>

        {/* History Table */}
        <div className="lg:col-span-7 border border-border bg-card overflow-hidden flex flex-col">
          <h3 className="font-display text-sm font-semibold text-foreground p-6 border-b border-border uppercase tracking-wider">
            Log Buku Pengeluaran
          </h3>
          
          {loading ? (
            <div className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest py-8 text-center animate-pulse">
              Sinkronisasi data buku besar...
            </div>
          ) : items.length === 0 ? (
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider py-12 text-center">
              Belum terdeteksi adanya catatan pengeluaran.
            </p>
          ) : (
            <div className="overflow-y-auto max-h-[420px]">
              <table className="w-full border-collapse">
                <thead className="bg-background sticky top-0 border-b border-border z-10">
                  <tr>
                    <th className="text-left font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">Tanggal</th>
                    <th className="text-left font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">Kategori</th>
                    <th className="text-left font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">Detail</th>
                    <th className="text-right font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-border/60 hover:bg-background/40 transition-colors">
                      <td className="py-4 px-4 font-mono text-[10px] text-muted-foreground font-bold">{it.incurred_at}</td>
                      <td className="py-4 px-4 font-mono text-[9px] font-bold text-foreground uppercase tracking-wider">
                        {CATEGORY_LABEL[it.category] ?? it.category}
                      </td>
                      <td className="py-4 px-4 text-sm text-foreground">{it.description ?? '—'}</td>
                      <td className="py-4 px-4 text-right font-mono text-xs font-bold text-red-700 tabular-nums">
                        <MoneyDisplay cents={it.amount_cents} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
