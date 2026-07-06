import { cn } from '@/lib/utils';

interface VerticalBrandingProps {
  text: string;
  className?: string;
}

export function VerticalBranding({ text, className }: VerticalBrandingProps) {
  return (
    <div className={cn('hidden md:flex md:col-span-1 justify-center pt-16 select-none opacity-20 hover:opacity-40 transition-opacity duration-300', className)}>
      <div className="font-mono text-sm font-black uppercase tracking-[0.3em] branding-vertical text-center whitespace-nowrap">
        {text}
      </div>
    </div>
  );
}
