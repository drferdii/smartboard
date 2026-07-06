'use client'

import { motion } from 'framer-motion'

import { MoneyDisplay } from '@/components/admin/MoneyDisplay'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value?: string | number
  valueCents?: number
  accent?: 'success' | 'danger' | 'neutral'
  delta?: string
  sparkline?: string
  className?: string
}

export function StatCard({
  label,
  value,
  valueCents,
  accent = 'neutral',
  delta,
  sparkline,
  className,
}: StatCardProps) {
  const colorMap = {
    success: 'text-emerald-700',
    danger: 'text-red-700',
    neutral: 'text-foreground',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'border border-border border-t-[3px] p-6 bg-card hover:bg-background transition-colors duration-300 flex flex-col justify-between',
        className
      )}
      style={{ borderTopWidth: '3px', borderTopColor: 'var(--foreground)' }}
    >
      <div>
        <div className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-muted-foreground mb-3">
          {label}
        </div>
        <div
          className={cn(
            'font-display text-2xl font-semibold tracking-tight tabular-nums',
            colorMap[accent]
          )}
        >
          {valueCents !== undefined ? <MoneyDisplay cents={valueCents} /> : (value ?? '—')}
        </div>
      </div>

      {(delta || sparkline) && (
        <div className="mt-5">
          {delta && (
            <div
              className={cn(
                'font-mono text-sm font-bold px-2 py-0.5 border inline-block uppercase tracking-wider',
                accent === 'success' || accent === 'neutral'
                  ? 'text-emerald-700 bg-emerald-500/5 border-emerald-600/20'
                  : 'text-red-700 bg-red-600/5 border-red-600/20'
              )}
            >
              {delta}
            </div>
          )}
          {sparkline && (
            <div className="mt-4 h-6 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                <polyline
                  points={sparkline}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <polygon
                  points={`${sparkline} 100,24 0,24`}
                  fill="var(--foreground)"
                  opacity="0.05"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
