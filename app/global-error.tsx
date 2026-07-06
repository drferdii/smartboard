'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { safeUiErrorMessage } from '@/lib/http/errors';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
          <div className="max-w-md w-full border border-border bg-card p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/10 flex items-center justify-center rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
                Oops! Terjadi Kesalahan
              </h1>
              <p className="font-mono text-sm text-muted-foreground">
                {safeUiErrorMessage()}
              </p>
              {error.digest ? (
                <p className="font-mono text-xs text-muted-foreground/80">
                  Ref: {error.digest}
                </p>
              ) : null}
            </div>

            <button
              onClick={() => reset()}
              className="w-full flex items-center justify-center gap-2 border border-[#1C1917] bg-[#1C1917] text-white px-4 py-3 font-mono text-sm font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4" /> MUAT ULANG
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
