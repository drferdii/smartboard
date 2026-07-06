'use client';

import React from 'react';
import useSWR from 'swr';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { VerticalBranding } from '@/components/admin/VerticalBranding';
import { UserPlus, ShieldAlert, Clock } from 'lucide-react';

type FraudLog = {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  profiles: { full_name: string } | null;
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function StaffView() {
  const { data } = useSWR('/api/admin/staff/fraud', fetcher, { suspense: true });
  
  const fraudLogs: FraudLog[] = data?.data || [];

  return (
    <div className="relative min-h-[80vh] flex flex-col page-staff animate-fade-in">
      <PageHeader
        label="MANAJEMEN KARYAWAN & SHIFT"
        title="Staf & Keamanan"
        action={
          <>
            <button className="flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest hover:bg-muted/10 transition-colors">
              <Clock className="w-4 h-4" /> LOG AKTIVITAS
            </button>
            <button className="flex items-center gap-2 border border-[#1C1917] bg-[#1C1917] text-white px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300">
              <UserPlus className="w-4 h-4" /> TAMBAH STAF
            </button>
          </>
        }
      />

      <div className="mt-8 flex-1 border border-border bg-card p-1 relative z-10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold">Waktu Kejadian</th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold">Nama Kasir</th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold text-center">Tipe Aksi (Fraud)</th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold">Deskripsi Tambahan</th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {fraudLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground font-mono text-sm">
                    Aman terkendali. Tidak ada indikasi fraud.
                  </td>
                </tr>
              ) : fraudLogs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 group hover:bg-background/50 transition-colors bg-red-500/5">
                  <td className="py-4 px-6 font-mono text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-display font-bold text-sm text-foreground uppercase tracking-wider">
                      {log.profiles?.full_name || 'Kasir (Tidak diketahui)'}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-red-600 border border-red-600/30 bg-red-600/10 px-2 py-0.5 uppercase">
                      <ShieldAlert className="w-3 h-3" />
                      {log.action_type.replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-sm font-bold text-foreground tracking-wider">
                    {log.description}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <StatusBadge variant="danger">
                      SUSPICIOUS
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <VerticalBranding text="SEMAYOT // STAF" className="absolute -right-12 top-0 bottom-0 pointer-events-none" />
    </div>
  );
}
