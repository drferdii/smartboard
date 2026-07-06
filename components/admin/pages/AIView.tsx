'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { SemayotMascot } from '@/components/semayot/semayot-mascot';

type Period = 'today' | '7d' | '30d';

const PERIOD_LABEL: Record<Period, string> = {
  today: 'Hari ini',
  '7d': '7 hari terakhir',
  '30d': '30 hari terakhir',
};

function messageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export function AIView() {
  const pathname = usePathname();
  const [tab, setTab] = useState<'summary' | 'chat'>('summary');
  const [period, setPeriod] = useState<Period>('today');
  const [summary, setSummary] = useState<{ text: string; cached: boolean; generatedAt?: string } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  const { messages, sendMessage, status, error: chatError } = useChat({
    id: 'admin-ai-chat',
    transport: new DefaultChatTransport({ api: '/api/admin/ai/chat' }),
  });
  const chatLoading = status === 'submitted' || status === 'streaming';

  const loadCached = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const r = await fetch(`/api/admin/ai/summary?period=${period}`);
      const j = await r.json();
      if (j.data?.cached) {
        setSummary({ text: j.data.summary_text, cached: true, generatedAt: j.data.generated_at });
      } else {
        setSummary(null);
      }
    } catch {
      setSummaryError('Gagal cek cache.');
    }
    setSummaryLoading(false);
  };

  useEffect(() => {
    if (tab === 'summary') {
      loadCached();
    }
  }, [tab, period, pathname]);

  const generate = async (force = false) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const r = await fetch('/api/admin/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, force }),
      });
      const j = await r.json();
      if (!r.ok) {
        setSummaryError(j.error?.message ?? 'Gagal generate.');
        return;
      }
      setSummary({ text: j.data.summary_text, cached: j.data.cached, generatedAt: new Date().toISOString() });
    } catch {
      setSummaryError('Gagal generate.');
    }
    setSummaryLoading(false);
  };

  const onChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    sendMessage({ text });
    setChatInput('');
  };

  return (
    <div className="animate-fade-in max-w-4xl relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-11 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block mb-1 font-bold">
            Asisten Keputusan AI
          </span>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground uppercase">
            Ringkasan & Konsultasi AI
          </h2>
        </div>
        <div className="flex border border-border p-1 bg-card font-mono text-[10px] font-bold">
          <button
            onClick={() => setTab('summary')}
            className={`px-4 py-2 uppercase tracking-wider transition-colors duration-200 ${
              tab === 'summary' 
                ? 'bg-foreground text-background' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setTab('chat')}
            className={`px-4 py-2 uppercase tracking-wider transition-colors duration-200 ${
              tab === 'chat' 
                ? 'bg-foreground text-background' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tanya AI
          </button>
        </div>
      </div>

      {tab === 'summary' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              Filter Periode:
            </span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="px-4 py-2 border border-border bg-card font-mono text-xs font-bold text-foreground focus:outline-none focus:border-foreground"
            >
              {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
                <option key={p} value={p}>{PERIOD_LABEL[p].toUpperCase()}</option>
              ))}
            </select>
            {summary?.cached && (
              <span className="font-mono text-[8px] font-bold border border-emerald-600/30 text-emerald-700 bg-emerald-500/5 px-2.5 py-1 uppercase tracking-widest">
                Tersimpan (Cache)
              </span>
            )}
          </div>

          {summaryError && (
            <div className="font-mono text-xs text-red-600 border border-red-600/20 bg-red-600/5 p-4 uppercase tracking-wider">
              STATUS_ERROR: {summaryError}
            </div>
          )}

          {summaryLoading ? (
            <div className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest py-8 animate-pulse">
              Memproses data analitik bisnis...
            </div>
          ) : summary ? (
            <div className="border border-border bg-card p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 font-display text-4xl font-bold uppercase tracking-[0.2em] select-none pointer-events-none">
                AI_SUMMARY
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                {summary.text}
              </pre>
              
              <div className="flex flex-wrap gap-3 pt-6 border-t border-border/60">
                <button
                  onClick={() => generate(true)}
                  disabled={summaryLoading}
                  className="border border-foreground bg-foreground text-background font-mono text-[10px] font-bold px-6 py-3 uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50"
                >
                  Regenerasi Ringkasan
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(summary.text)}
                  className="border border-border hover:border-foreground bg-transparent text-foreground font-mono text-[10px] font-bold px-6 py-3 uppercase tracking-widest hover:bg-card transition-all duration-300"
                >
                  Salin Teks
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-card p-12 text-center space-y-6">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Belum ada ringkasan terproses untuk periode ini.
              </p>
              <button
                onClick={() => generate(false)}
                disabled={summaryLoading}
                className="border border-foreground bg-foreground text-background font-mono text-[10px] font-bold px-8 py-4 uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50"
              >
                Mulai Proses Ringkasan
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <div className="space-y-6">
          {chatError && (
            <div className="font-mono text-xs text-red-600 border border-red-600/20 bg-red-600/5 p-4 uppercase tracking-wider">
              ERROR_STREAMING: {chatError.message}
            </div>
          )}

          <div className="border border-border bg-card p-6 h-[400px] overflow-y-auto space-y-4 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-75 select-none">
                <SemayotMascot variant="menu" size={85} />
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest max-w-sm font-bold leading-relaxed">
                  Masukkan pertanyaan mengenai transaksi, profitabilitas, pengeluaran, atau ketersediaan menu. AI memiliki akses database real-time.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`p-5 border max-w-[85%] font-mono text-xs leading-relaxed ${
                    m.role === 'user' 
                      ? 'border-foreground bg-foreground text-background ml-auto' 
                      : 'border-border bg-background text-foreground'
                  }`}
                >
                  <div className="text-[9px] opacity-60 font-bold uppercase tracking-widest mb-2">
                    {m.role === 'user' ? 'KLIEN / KASIR' : 'ASISTEN AI'}
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-sm">
                    {messageText(m.parts)}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="font-mono text-[9px] text-muted-foreground font-bold uppercase tracking-widest animate-pulse mt-2 pl-2">
                Memproses tanggapan dari database...
              </div>
            )}
          </div>

          <form onSubmit={onChatSubmit} className="flex gap-3">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Tulis kueri analitik (mis. 'berapa omzet babi panggang garing minggu ini?')"
              className="flex-1 px-4 py-3.5 border border-border bg-card font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="border border-foreground bg-foreground text-background font-mono text-[10px] font-bold px-8 py-3.5 uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50"
            >
              Kirim
            </button>
          </form>
        </div>
      )}
        </div>
        {/* Vertical Branding */}
        <div className="hidden md:flex md:col-span-1 justify-center pt-16 select-none opacity-20 hover:opacity-40 transition-opacity duration-300">
          <div className="font-mono text-[9px] font-black uppercase tracking-[0.3em] branding-vertical text-center whitespace-nowrap">
            ANALISIS AGEN AI SEMAYOT
          </div>
        </div>
      </div>
    </div>
  );
}
