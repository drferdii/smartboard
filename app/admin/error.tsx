'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="relative min-h-[80vh] flex flex-col page-error animate-fade-in">
      <PageHeader
        label="SISTEM KEAMANAN"
        title="Terjadi Kesalahan (500)"
        action={
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest hover:bg-muted/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> COBA LAGI
          </button>
        }
      />
      <div className="flex flex-col items-center justify-center flex-1 mt-8 border border-red-500/20 bg-red-500/5 p-8 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="font-display text-2xl font-bold uppercase tracking-widest text-foreground mb-4">
          Akses Gagal / Kegagalan Sistem
        </h2>
        <p className="font-mono text-muted-foreground mb-8 max-w-xl">
          {error.message || 'Terjadi kesalahan internal pada dashboard admin. Silakan muat ulang halaman atau hubungi dukungan teknis.'}
        </p>
      </div>
    </div>
  );
}
