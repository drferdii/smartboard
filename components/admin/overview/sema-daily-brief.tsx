'use client'

import { motion } from 'framer-motion'

import { getOverviewContainerVariants, getOverviewRevealVariants } from './overview-motion'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import type { SemaBrief } from '@/lib/admin/overview/outlet-contracts'

type SemaDailyBriefProps = {
  brief: SemaBrief
  onPromptClick?: (prompt: string) => void
}

export function SemaDailyBrief({ brief, onPromptClick }: SemaDailyBriefProps) {
  const isReduced = useReducedMotion()

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={getOverviewContainerVariants(isReduced, 0.08)}
      className="border border-border bg-[#FFF0F3] p-6 space-y-4 relative overflow-hidden"
    >
      <motion.div
        variants={getOverviewRevealVariants(isReduced, 12)}
        className="flex items-center gap-2"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#FF4F79]">
          SEMA DAILY BRIEF
        </span>
      </motion.div>

      <motion.div variants={getOverviewRevealVariants(isReduced, 14)} className="space-y-2">
        <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-foreground">
          {brief.greeting}
        </h3>
        <p className="font-sans text-sm text-foreground leading-relaxed">{brief.summary}</p>
      </motion.div>

      {brief.risks.length > 0 && (
        <motion.ul
          variants={getOverviewRevealVariants(isReduced, 16)}
          className="space-y-1.5 font-sans text-xs text-foreground leading-relaxed bg-background/60 border border-border/40 p-3"
        >
          {brief.risks.map((risk, index) => (
            <li key={`${risk.slice(0, 12)}-${index}`} className="flex gap-2">
              <span aria-hidden="true" className="text-[#FF4F79] mt-0.5">
                !
              </span>
              <span>{risk}</span>
            </li>
          ))}
        </motion.ul>
      )}

      {brief.recommendedActions.length > 0 && (
        <motion.div
          variants={getOverviewRevealVariants(isReduced, 18)}
          className="border-t border-border/60 pt-3 space-y-2"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
            AKSI YANG DIREKOMENDASIKAN
          </span>
          <ul className="space-y-1">
            {brief.recommendedActions.map((action) => (
              <li key={action.id} className="font-sans text-xs text-foreground flex gap-2">
                <span aria-hidden="true" className="text-muted-foreground">
                  →
                </span>
                <span>{action.title}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div
        variants={getOverviewRevealVariants(isReduced, 20)}
        className="flex flex-wrap gap-2 pt-2"
      >
        {brief.quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptClick?.(prompt)}
            className="neumorphic-chip font-mono text-[10px] hover:bg-card transition-colors"
            data-tone="accent"
          >
            {prompt}
          </button>
        ))}
      </motion.div>
    </motion.section>
  )
}
