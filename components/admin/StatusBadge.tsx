import { cn } from '@/lib/utils';

export type StatusVariant = 'success' | 'danger' | 'warning' | 'neutral';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  const variants = {
    success: 'border-emerald-600/30 text-emerald-700 bg-emerald-500/5',
    danger: 'border-red-600/30 text-red-700 bg-red-600/5',
    warning: 'border-amber-600/30 text-amber-700 bg-amber-500/5',
    neutral: 'border-border text-muted-foreground bg-background/50',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono text-sm font-bold px-2.5 py-1 border uppercase tracking-wider',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
