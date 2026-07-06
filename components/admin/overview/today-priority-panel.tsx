'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

import { getOverviewContainerVariants, getOverviewRevealVariants } from './overview-motion'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import type { ActionItem } from '@/lib/admin/overview/outlet-contracts'

type TodayPriorityPanelProps = {
  priorities: ActionItem[]
  onActivateDemo?: () => void
}

const SEVERITY_TONE: Record<ActionItem['severity'], 'accent' | 'muted'> = {
  critical: 'accent',
  important: 'accent',
  normal: 'muted',
}

const SEVERITY_LABEL: Record<ActionItem['severity'], string> = {
  critical: 'KRITIS',
  important: 'PENTING',
  normal: 'NORMAL',
}

const SEVERITY_DOT: Record<ActionItem['severity'], string> = {
  critical: 'bg-[#FF4F79]',
  important: 'bg-[#FF85A1]',
  normal: 'bg-muted-foreground',
}

export function TodayPriorityPanel({ priorities, onActivateDemo }: TodayPriorityPanelProps) {
  const isReduced = useReducedMotion()

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={getOverviewContainerVariants(isReduced, 0.08)}
      className="border border-border bg-[#FFF5F0] p-6 space-y-4"
    >
      <motion.div
        variants={getOverviewRevealVariants(isReduced, 12)}
        className="flex items-center justify-between"
      >
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#FF4F79] block">
            YANG PERLU DIKERJAKAN HARI INI
          </span>
          <h3 className="font-display text-sm font-semibold tracking-[-0.02em] text-foreground uppercase mt-1">
            Prioritas Operasional
          </h3>
        </div>
        <span
          className="neumorphic-chip font-mono text-[10px]"
          data-tone={priorities[0]?.severity === 'critical' ? 'accent' : 'muted'}
        >
          {priorities.length} AKSI
        </span>
      </motion.div>

      <motion.ul variants={getOverviewContainerVariants(isReduced, 0.07)} className="space-y-3">
        {priorities.map((priority, index) => (
          <motion.li
            key={priority.id}
            variants={getOverviewRevealVariants(isReduced, 14 + index * 4)}
            className="bg-background border border-border/60 p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    aria-hidden="true"
                    className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[priority.severity]}`}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {SEVERITY_LABEL[priority.severity]}
                  </span>
                </div>
                <h4 className="font-display text-sm font-semibold text-foreground leading-snug">
                  {priority.title}
                </h4>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed mt-1">
                  {priority.description}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              {priority.actionHref ? (
                <Link
                  href={priority.actionHref}
                  className="neumorphic-chip font-mono text-[10px] hover:bg-[#FFF0F3] transition-colors"
                  data-tone={SEVERITY_TONE[priority.severity]}
                >
                  {priority.actionLabel}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onActivateDemo}
                  className="neumorphic-chip font-mono text-[10px] hover:bg-[#FFF0F3] transition-colors"
                  data-tone={SEVERITY_TONE[priority.severity]}
                >
                  {priority.actionLabel}
                </button>
              )}
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </motion.section>
  )
}
