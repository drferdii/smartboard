'use client'

import { motion } from 'framer-motion'

import { getOverviewContainerVariants, getOverviewRevealVariants } from './overview-motion'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import type { OutletHealthScore } from '@/lib/admin/overview/outlet-contracts'

type OutletHealthCardProps = {
  score: OutletHealthScore
}

const STATUS_TONE: Record<OutletHealthScore['status'], 'success' | 'accent' | 'muted'> = {
  healthy: 'success',
  stable: 'success',
  warning: 'accent',
  critical: 'accent',
  insufficient_data: 'muted',
}

const STATUS_ACCENT_BAR: Record<OutletHealthScore['status'], string> = {
  healthy: 'bg-emerald-500',
  stable: 'bg-emerald-500',
  warning: 'bg-[#FF4F79]',
  critical: 'bg-[#FF4F79]',
  insufficient_data: 'bg-muted-foreground',
}

export function OutletHealthCard({ score }: OutletHealthCardProps) {
  const isReduced = useReducedMotion()
  const tone = STATUS_TONE[score.status]
  const scoreDisplay = score.score === null ? '--' : `${score.score}`
  const scoreMax = score.score === null ? 100 : Math.max(0, Math.min(100, score.score))

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={getOverviewContainerVariants(isReduced, 0.1)}
      className="border border-border bg-[#FFE8EE] p-6 relative overflow-hidden flex flex-col gap-5"
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 h-full w-[3px] ${STATUS_ACCENT_BAR[score.status]}`}
      />

      <motion.div
        variants={getOverviewRevealVariants(isReduced, 14)}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#FF4F79] block">
            NADI OUTLET
          </span>
          <h2 className="font-display text-base font-semibold tracking-[-0.02em] text-foreground uppercase mt-1">
            {score.label}
          </h2>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold tabular-nums text-foreground leading-none">
            {scoreDisplay}
            <span className="font-mono text-sm text-muted-foreground font-normal">/100</span>
          </div>
          <div className="neumorphic-chip font-mono text-[10px] mt-2" data-tone={tone}>
            {score.score === null ? 'NADI BELUM AKTIF' : 'NADI AKTIF'}
          </div>
        </div>
      </motion.div>

      {score.score !== null && (
        <motion.div
          variants={getOverviewRevealVariants(isReduced, 16)}
          className="h-1.5 bg-background border border-border/60 overflow-hidden"
        >
          <motion.div
            className={`h-full ${STATUS_ACCENT_BAR[score.status]}`}
            initial={isReduced ? false : { width: 0 }}
            whileInView={isReduced ? undefined : { width: `${scoreMax}%` }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      )}

      <motion.p
        variants={getOverviewRevealVariants(isReduced, 18)}
        className="font-sans text-sm text-foreground leading-relaxed"
      >
        {score.summary}
      </motion.p>

      {score.reasons.length > 0 && score.status !== 'insufficient_data' && (
        <motion.ul
          variants={getOverviewRevealVariants(isReduced, 20)}
          className="space-y-1.5 font-sans text-xs text-muted-foreground leading-relaxed"
        >
          {score.reasons.map((reason, index) => (
            <li key={`${reason.slice(0, 12)}-${index}`} className="flex gap-2">
              <span aria-hidden="true" className="text-[#FF4F79] mt-0.5">
                •
              </span>
              <span>{reason}</span>
            </li>
          ))}
        </motion.ul>
      )}

      <motion.div
        variants={getOverviewRevealVariants(isReduced, 22)}
        className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
            REKOMENDASI
          </span>
          <p className="font-sans text-sm text-foreground mt-0.5">{score.recommendedAction}</p>
        </div>
      </motion.div>
    </motion.section>
  )
}
