'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

import { getOverviewContainerVariants, getOverviewRevealVariants } from './overview-motion'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import type { CashierClosingStatus as CashierClosingStatusValue } from '@/lib/admin/overview/outlet-contracts'

type CashierClosingAssistantProps = {
  status: CashierClosingStatusValue
}

const STATE_TONE: Record<CashierClosingStatusValue['status'], 'success' | 'accent' | 'muted'> = {
  complete: 'success',
  incomplete: 'accent',
  needs_review: 'accent',
  unknown: 'muted',
}

const STATE_LABEL: Record<CashierClosingStatusValue['status'], string> = {
  complete: 'CLOSING LENGKAP',
  incomplete: 'CLOSING BELUM LENGKAP',
  needs_review: 'PERLU DICEK',
  unknown: 'BELUM ADA CLOSING',
}

export function CashierClosingAssistant({ status }: CashierClosingAssistantProps) {
  const isReduced = useReducedMotion()
  const completedCount = status.checklist.filter((item) => item.completed).length
  const totalCount = status.checklist.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={getOverviewContainerVariants(isReduced, 0.08)}
      className="border border-border bg-[#FFF0ED] p-6 space-y-4"
    >
      <motion.div
        variants={getOverviewRevealVariants(isReduced, 12)}
        className="flex items-center justify-between"
      >
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#FF4F79] block">
            ASISTEN CLOSING KASIR
          </span>
          <h3 className="font-display text-sm font-semibold tracking-[-0.02em] text-foreground uppercase mt-1">
            {STATE_LABEL[status.status]}
          </h3>
        </div>
        <span
          className="neumorphic-chip font-mono text-[10px]"
          data-tone={STATE_TONE[status.status]}
        >
          {completedCount}/{totalCount}
        </span>
      </motion.div>

      <motion.div variants={getOverviewRevealVariants(isReduced, 14)} className="space-y-1.5">
        <div className="h-1.5 bg-background border border-border/60 overflow-hidden">
          <motion.div
            className="h-full bg-foreground"
            initial={isReduced ? false : { width: 0 }}
            whileInView={isReduced ? undefined : { width: `${progress}%` }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {progress}% TERVERIFIKASI
        </div>
      </motion.div>

      <motion.ul variants={getOverviewContainerVariants(isReduced, 0.07)} className="space-y-2">
        {status.checklist.map((item, index) => (
          <motion.li
            key={item.label}
            variants={getOverviewRevealVariants(isReduced, 16 + index * 3)}
            className="flex items-center justify-between bg-background border border-border/60 px-3 py-2"
          >
            <span className="font-sans text-xs text-foreground flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-sm ${item.completed ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
              />
              {item.label}
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-wider"
              data-tone={item.completed ? 'success' : 'muted'}
            >
              {item.completed ? 'OK' : 'BELUM'}
            </span>
          </motion.li>
        ))}
      </motion.ul>

      {status.transactionCount > 0 && (
        <motion.div
          variants={getOverviewRevealVariants(isReduced, 22)}
          className="flex items-center justify-between font-mono text-xs border-t border-border pt-3"
        >
          <span className="text-muted-foreground uppercase tracking-wider">Transaksi</span>
          <span className="text-foreground font-bold">{status.transactionCount}</span>
        </motion.div>
      )}

      <motion.div variants={getOverviewRevealVariants(isReduced, 24)} className="flex justify-end">
        <Link
          href="/admin/transactions"
          className="neumorphic-chip font-mono text-[10px] hover:bg-[#FFF0F3] transition-colors"
          data-tone="muted"
        >
          BUKA TRANSAKSI
        </Link>
      </motion.div>
    </motion.section>
  )
}
