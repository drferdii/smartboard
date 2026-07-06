'use client';

import React from 'react';
import useSWR from 'swr';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { VerticalBranding } from '@/components/admin/VerticalBranding';
import { FileText, Download } from 'lucide-react';
import { MoneyDisplay } from '@/components/admin/MoneyDisplay';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function FinancialsView() {
  const { data } = useSWR('/api/admin/financials', fetcher, { suspense: true });
  
  const pnl = data?.data || { revenue: 0, cogs: 0, opex: 0, net_profit: 0 };
  return (
    <div className="relative min-h-[80vh] flex flex-col page-financials animate-fade-in">
      <PageHeader
        label="KONSOLIDASI LABA RUGI"
        title="Keuangan (P&L)"
        action={
          <>
            <button className="flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest hover:bg-muted/10 transition-colors">
              <Download className="w-4 h-4" /> EKSPOR LAPORAN
            </button>
            <button className="flex items-center gap-2 border border-[#1C1917] bg-[#1C1917] text-white px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300">
              <FileText className="w-4 h-4" /> CETAK STATEMENT
            </button>
          </>
        }
      />

      <div className="mt-8 space-y-8 relative z-10">
        
        {/* BIG KPI CARDS */}
        <section>
          <span className="font-mono text-sm uppercase tracking-[0.2em] text-[#FF4F79] block font-black mb-4">
            IKHTISAR BULAN INI (JUNI 2026)
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              label="Pendapatan Kotor (Gross)"
              value={`Rp ${Number(pnl.revenue / 100).toLocaleString('id-ID')}`}
              delta="+14,2%"
              accent="success"
              className="p-6 border-emerald-600/30 bg-emerald-500/5"
            />
            <StatCard
              label="HPP / Harga Pokok Bahan"
              value={`Rp ${Number(pnl.cogs / 100).toLocaleString('id-ID')}`}
              delta="-2,1%"
              accent="success"
              className="p-6"
            />
            <StatCard
              label="Pengeluaran Operasional (Opex)"
              value={`Rp ${Number(pnl.opex / 100).toLocaleString('id-ID')}`}
              delta="+5,5%"
              accent="danger"
              className="p-6"
            />
            <StatCard
              label="Laba Bersih (Net Profit)"
              value={`Rp ${Number(pnl.net_profit / 100).toLocaleString('id-ID')}`}
              delta="+18,4%"
              accent="success"
              className="p-6 border-[#FF4F79]/30 bg-[#FF4F79]/5"
            />
          </div>
        </section>

        {/* CASH FLOW CHART PLACEHOLDER */}
        <section>
          <div className="border border-border p-6 bg-card space-y-4">
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                Arus Kas (Cash Flow) Harian
              </h3>
            </div>
            <div className="w-full h-64 opacity-90 relative">
              <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                <line x1="40" y1="50" x2="960" y2="50" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 2" />
                <line x1="40" y1="150" x2="960" y2="150" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 2" />
                <line x1="40" y1="250" x2="960" y2="250" stroke="var(--border)" strokeWidth="1" />
                
                {/* Revenue Line (Emerald) */}
                <polyline points="40,230 150,180 250,190 350,110 450,140 550,90 650,100 750,70 850,85 960,50" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {/* Expenses Line (Red) */}
                <polyline points="40,245 150,220 250,230 350,210 450,215 550,205 650,210 750,195 850,200 960,180" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <div className="absolute top-2 right-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Pemasukan
                </div>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> Pengeluaran
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <VerticalBranding text="SEMAYOT // KEUANGAN" className="absolute -right-12 top-0 bottom-0 pointer-events-none" />
    </div>
  );
}
