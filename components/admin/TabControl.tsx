import { cn } from '@/lib/utils';

export type TabItem<T extends string> = {
  id: T;
  label: string;
};

interface TabControlProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (id: T) => void;
  variant?: 'toggle' | 'underline';
  className?: string;
}

export function TabControl<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  variant = 'toggle',
  className
}: TabControlProps<T>) {
  if (variant === 'underline') {
    return (
      <div className={cn('flex border-b border-transparent', className)}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={cn(
              'px-6 py-3.5 font-mono text-sm font-bold uppercase tracking-widest transition-all duration-300 border-b-2 -mb-[2px] cursor-pointer',
              activeTab === t.id
                ? 'border-foreground text-foreground bg-foreground/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  // Toggle variant
  return (
    <div className={cn('flex border border-border p-1 bg-card font-mono text-sm font-bold', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={cn(
            'px-5 py-2.5 uppercase tracking-wider transition-all duration-300 cursor-pointer',
            activeTab === t.id
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
