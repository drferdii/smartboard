'use client'

import { motion } from 'framer-motion'

import { getOverviewContainerVariants, getOverviewRevealVariants } from './overview-motion'
import type { RecentTransaction } from './use-overview-state'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import type { DashboardOverviewData } from '@/lib/admin/overview/contracts'

type OverviewTransactionsProps = {
  overviewData?: DashboardOverviewData
  overviewError: string | null
  overviewLoading: boolean
  recentTransactions: RecentTransaction[]
}

function buildTransactionFeedStatus(input: {
  overviewData?: DashboardOverviewData
  overviewError: string | null
  overviewLoading: boolean
}) {
  if (input.overviewLoading) {
    return { label: 'MEMUAT', tone: 'muted' as const }
  }

  if (input.overviewError || input.overviewData?.cashierConnection.status === 'error') {
    return { label: 'DATA TERBATAS', tone: 'accent' as const }
  }

  if (input.overviewData?.cashierConnection.status === 'connected') {
    return { label: 'SUMBER DATABASE', tone: 'success' as const }
  }

  return { label: 'BELUM TERHUBUNG', tone: 'muted' as const }
}

export function OverviewTransactions({
  overviewData,
  overviewError,
  overviewLoading,
  recentTransactions,
}: OverviewTransactionsProps) {
  const isReduced = useReducedMotion()
  const feedStatus = buildTransactionFeedStatus({
    overviewData,
    overviewError,
    overviewLoading,
  })

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={getOverviewContainerVariants(isReduced, 0.08)}
      className="space-y-4"
    >
      <motion.div
        variants={getOverviewRevealVariants(isReduced, 18)}
        className="flex justify-between items-end border-b border-border pb-3"
      >
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-1 font-bold">
            Buku Log Transaksi Langsung
          </span>
          <h3 className="font-display text-lg font-semibold text-foreground uppercase tracking-[-0.02em]">
            Transaksi Terkini
          </h3>
        </div>
        <span
          className="neumorphic-chip hidden font-mono text-xs md:inline-flex"
          data-tone={feedStatus.tone}
        >
          {feedStatus.label}
        </span>
      </motion.div>

      <motion.div
        variants={getOverviewRevealVariants(isReduced, 22)}
        className="overflow-x-auto border border-border"
      >
        {recentTransactions.length === 0 ? (
          <div className="p-6 font-sans text-sm text-muted-foreground leading-relaxed">
            {overviewData?.cashierConnection.status === 'connected'
              ? 'Belum ada transaksi tercatat untuk outlet atau periode ini.'
              : 'Koneksi kasir belum aktif atau data transaksi belum tersedia.'}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="text-left font-mono text-xs uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                  Waktu
                </th>
                <th className="text-left font-mono text-xs uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                  ID Transaksi
                </th>
                <th className="text-left font-mono text-xs uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                  Item Belanja / Menu
                </th>
                <th className="text-left font-mono text-xs uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                  Kasir
                </th>
                <th className="text-right font-mono text-xs uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                  Nominal
                </th>
                <th className="text-right font-mono text-xs uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={isReduced ? false : { opacity: 0, x: -12 }}
                  whileInView={isReduced ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.06 + index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={isReduced ? undefined : { backgroundColor: 'rgba(28, 25, 23, 0.03)' }}
                  className="border-b border-border/60 group transition-colors duration-200"
                >
                  <td className="py-4 px-4 font-mono text-xs text-muted-foreground font-bold">
                    {transaction.time}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-foreground">
                    {transaction.id}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-display font-medium text-sm text-foreground tracking-tight">
                      {transaction.menu}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {transaction.cashier}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs font-bold text-foreground text-right tabular-nums">
                    {transaction.total}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className="neumorphic-chip font-mono text-xs"
                      data-tone={transaction.statusTone === 'success' ? 'success' : 'muted'}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.section>
  )
}
