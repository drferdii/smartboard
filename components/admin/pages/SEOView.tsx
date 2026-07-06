'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Status = 'pending' | 'applied' | 'skipped';
type Rec = {
  id: string;
  title: string;
  why_it_matters: string;
  apply_at: string;
  copy_value: string | null;
  status: Status;
};

const STATUS_LABEL: Record<Status, string> = {
  pending: 'BELUM',
  applied: 'DITERAPKAN',
  skipped: 'DILEWATI',
};

const STATUS_BORDER: Record<Status, string> = {
  pending: 'border-border text-muted-foreground bg-background/50',
  applied: 'border-emerald-600/30 text-emerald-700 bg-emerald-500/5',
  skipped: 'border-amber-600/30 text-amber-700 bg-amber-500/5',
};

export function SEOView() {
  const pathname = usePathname();
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/seo/recommendations');
      const j = await r.json();
      if (r.ok) setRecs(j.data ?? []);
      else setError(j.error?.message ?? 'Gagal memuat.');
    } catch (e: any) {
      console.error(e);
      setError(e instanceof SyntaxError ? 'Respons server tidak valid (500).' : (e.message || 'Koneksi jaringan terputus.'));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [pathname]);

  const updateStatus = async (id: string, status: Status) => {
    const r = await fetch(`/api/admin/seo/recommendations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (r.ok) await load();
    else setError('Gagal update status.');
  };

  const copy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('Gagal menyalin ke clipboard.');
    }
  };

  if (loading) {
    return (
      <div className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest py-8 animate-pulse">
        Memuat rekomendasi optimasi SEO...
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-mono text-xs text-red-600 border border-red-600/20 bg-red-600/5 p-4 uppercase tracking-wider">
        AUDIT_ERROR: {error}
      </div>
    );
  }

  const counts = {
    pending: recs.filter((r) => r.status === 'pending').length,
    applied: recs.filter((r) => r.status === 'applied').length,
    skipped: recs.filter((r) => r.status === 'skipped').length,
  };

  return (
    <div className="animate-fade-in max-w-4xl relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-11 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block mb-1 font-bold">
            Konsol Pengindeksan & Search Engine
          </span>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground uppercase">
            Rekomendasi SEO
          </h2>
        </div>
        <div className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {counts.pending} BELUM &middot; {counts.applied} DITERAPKAN &middot; {counts.skipped} DILEWATI
        </div>
      </div>

      {/* Recommendations Checklist */}
      <div className="space-y-4">
        {recs.map((r) => (
          <div key={r.id} className="border border-border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground leading-snug">
                  {r.title}
                </h3>
                <div className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                  <span>Lokasi Penerapan:</span>
                  <span className="text-foreground">{r.apply_at}</span>
                </div>
              </div>
              
              <span className={`font-mono text-[8px] font-bold px-2.5 py-1 border uppercase tracking-widest ${STATUS_BORDER[r.status]}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-[70ch]">
              {r.why_it_matters}
            </p>

            {r.copy_value && (
              <div className="relative">
                <pre className="bg-foreground text-background font-mono text-[11px] p-4 overflow-x-auto max-h-40 border border-border">
                  {r.copy_value}
                </pre>
                <button
                  onClick={() => copy(r.id, r.copy_value!)}
                  className="absolute top-3 right-3 font-mono text-[9px] font-bold px-3 py-1.5 border border-border bg-background text-foreground hover:bg-foreground hover:text-background transition-all duration-300 uppercase tracking-widest"
                >
                  {copied === r.id ? '✓ TERSALIN' : 'SALIN'}
                </button>
              </div>
            )}

            {/* Status Switcher Buttons */}
            <div className="pt-2 flex flex-wrap gap-2 items-center">
              <span className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider mr-2">
                TANDAI STATUS:
              </span>
              {(['pending', 'applied', 'skipped'] as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(r.id, s)}
                  className={`font-mono text-[9px] font-bold px-3 py-1.5 border uppercase tracking-wider transition-all duration-300 ${
                    r.status === s 
                      ? 'border-foreground bg-foreground text-background' 
                      : 'border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
        {/* Vertical Branding */}
        <div className="hidden md:flex md:col-span-1 justify-center pt-16 select-none opacity-20 hover:opacity-40 transition-opacity duration-300">
          <div className="font-mono text-[9px] font-black uppercase tracking-[0.3em] branding-vertical text-center whitespace-nowrap">
            OPTIMASI SEO SEMAYOT
          </div>
        </div>
      </div>
    </div>
  );
}
