import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertBannerProps {
  variant: AlertVariant;
  prefix?: string;
  message: string;
  className?: string;
}

export function AlertBanner({ variant, prefix, message, className }: AlertBannerProps) {
  const styles = {
    error: 'text-red-600 border-red-600/20 bg-red-600/5',
    success: 'text-emerald-700 border-emerald-600/20 bg-emerald-600/5',
    warning: 'text-amber-700 border-amber-600/20 bg-amber-500/5',
    info: 'text-foreground border-border bg-card',
  };

  const icons = {
    error: <AlertCircle className="w-4 h-4 shrink-0" />,
    success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 shrink-0" />,
    info: <Info className="w-4 h-4 shrink-0" />,
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'font-mono text-sm border p-4 uppercase tracking-wider flex items-start gap-3 animate-fade-in',
        styles[variant],
        className
      )}
    >
      {icons[variant]}
      <div className="flex-1 mt-[1px]">
        {prefix && <span className="font-black mr-2">{prefix}:</span>}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
