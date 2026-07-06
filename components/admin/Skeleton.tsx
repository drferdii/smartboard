import { cn } from '@/lib/utils';
import React from 'react';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-muted/20 border border-border/50", className)}
      {...props}
    />
  )
}

export { Skeleton }
