'use client'

import { motion } from 'framer-motion'

import { getOverviewContainerVariants, getOverviewRevealVariants } from './overview-motion'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { formatDateID } from '@/lib/admin/format/date'
import { formatRupiah } from '@/lib/admin/format/money'
import type { DashboardOverviewData, DashboardTrendPoint } from '@/lib/admin/overview/contracts'
import {
  buildFreshnessLabel,
  buildTopItemSummary,
  buildTrendCaption,
  buildOverviewTopbarStatus,
} from '@/lib/admin/overview/view-model'

type OverviewAnalyticsProps = {
  overviewData?: DashboardOverviewData
  overviewError: string | null
  overviewLoading: boolean
}

function buildTrendPolyline(points: DashboardTrendPoint[]): string | null {
  if (points.length === 0) {
    return null
  }

  const values = points.map((point) => point.salesCents)
  const max = Math.max(...values, 1)

  return values
    .map((value, index) => {
      const x = 40 + index * 70
      const y = 180 - (value / max) * 140
      return `${x},${Math.round(y)}`
    })
    .join(' ')
}

function formatDateTime(timestamp: string, timeZone: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

export function OverviewAnalytics({
  overviewData,
  overviewError,
  overviewLoading,
}: OverviewAnalyticsProps) {
  const isReduced = useReducedMotion()
  const trendPolyline = buildTrendPolyline(overviewData?.dailySalesTrend ?? [])
  const topbarStatus = buildOverviewTopbarStatus(overviewData, overviewError)
  const topItems = overviewData?.topMenuItems ?? []

  return (
    <>
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={getOverviewContainerVariants(isReduced, 0.08)}
        className="space-y-4"
      >
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF4F79] block font-black">
          ANALISIS TREN & DISTRIBUSI MENU
        </span>
        <motion.div
          variants={getOverviewContainerVariants(isReduced, 0.1)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            variants={getOverviewRevealVariants(isReduced, 22)}
            whileHover={isReduced ? undefined : { y: -4, scale: 1.008 }}
            className="border border-border p-6 bg-card space-y-4 flex flex-col justify-between hover:bg-background transition-colors duration-300 hover:shadow-md"
          >
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-[-0.02em]">
                Tren Penjualan Harian (7 Hari Terakhir)
              </h3>
            </div>
            {overviewLoading ? (
              <div className="h-44 flex items-center justify-center font-sans text-sm text-muted-foreground">
                Memuat tren penjualan terverifikasi...
              </div>
            ) : overviewError ? (
              <div className="h-44 flex items-center justify-center font-sans text-sm text-muted-foreground text-center">
                {overviewError}
              </div>
            ) : trendPolyline ? (
              <div className="w-full opacity-90 space-y-3 overflow-hidden">
                <div className="h-44">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <line
                      x1="40"
                      y1="20"
                      x2="480"
                      y2="20"
                      stroke="var(--border)"
                      strokeWidth="0.5"
                      strokeDasharray="4 2"
                    />
                    <line
                      x1="40"
                      y1="80"
                      x2="480"
                      y2="80"
                      stroke="var(--border)"
                      strokeWidth="0.5"
                      strokeDasharray="4 2"
                    />
                    <line
                      x1="40"
                      y1="140"
                      x2="480"
                      y2="140"
                      stroke="var(--border)"
                      strokeWidth="0.5"
                      strokeDasharray="4 2"
                    />
                    <line
                      x1="40"
                      y1="180"
                      x2="480"
                      y2="180"
                      stroke="var(--border)"
                      strokeWidth="1"
                    />
                    <motion.polyline
                      points={trendPolyline}
                      fill="none"
                      stroke="var(--foreground)"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      initial={isReduced ? false : { pathLength: 0, opacity: 0.5 }}
                      whileInView={isReduced ? undefined : { pathLength: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </svg>
                </div>
                <div className="flex justify-between font-mono text-xs text-muted-foreground font-bold px-8">
                  {(overviewData?.dailySalesTrend ?? []).map((point) => (
                    <span key={point.date}>
                      {formatDateID(point.date).slice(0, 3).toUpperCase()}
                    </span>
                  ))}
                </div>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  {buildTrendCaption(overviewData?.dailySalesTrend ?? [])}
                </p>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center font-sans text-sm text-muted-foreground text-center">
                Belum ada data penjualan 7 hari terakhir.
              </div>
            )}
          </motion.div>

          <motion.div
            variants={getOverviewRevealVariants(isReduced, 26)}
            whileHover={isReduced ? undefined : { y: -4, scale: 1.008 }}
            className="border border-border p-6 bg-card space-y-4 flex flex-col justify-between hover:bg-background transition-colors duration-300 hover:shadow-md"
          >
            <div>
              <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-[-0.02em]">
                Distribusi Porsi Penjualan Menu
              </h3>
            </div>
            {overviewLoading ? (
              <div className="h-44 flex items-center justify-center font-sans text-sm text-muted-foreground">
                Memuat distribusi transaksi...
              </div>
            ) : overviewError ? (
              <div className="h-44 flex items-center justify-center font-sans text-sm text-muted-foreground text-center">
                {overviewError}
              </div>
            ) : topItems.length > 0 ? (
              <div className="w-full h-44 flex flex-col justify-center gap-3">
                {topItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={isReduced ? false : { opacity: 0, y: 10 }}
                    whileInView={isReduced ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.08 + index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="space-y-1"
                  >
                    <div className="flex justify-between font-mono text-xs font-bold">
                      <span className="text-foreground uppercase tracking-wider">{item.name}</span>
                      <span className="text-muted-foreground">
                        {formatRupiah(item.revenueCents)} ({item.sharePercent}%)
                      </span>
                    </div>
                    <div className="h-2 bg-background border border-border/60 overflow-hidden">
                      <motion.div
                        className="h-full bg-[#1C1917]"
                        initial={isReduced ? false : { width: 0 }}
                        whileInView={isReduced ? undefined : { width: `${item.sharePercent}%` }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{
                          duration: 0.9,
                          delay: 0.15 + index * 0.06,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  {buildTopItemSummary(topItems)}
                </p>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center font-sans text-sm text-muted-foreground text-center">
                {overviewData?.recentTransactions.length
                  ? 'Detail item transaksi belum tersedia untuk menghitung distribusi menu.'
                  : 'Belum ada transaksi hari ini untuk menghitung distribusi menu.'}
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={getOverviewContainerVariants(isReduced, 0.1)}
        className="space-y-4"
      >
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF4F79] block font-black">
          KEPUASAN PELANGGAN & RINGKASAN OUTLET
        </span>
        <motion.div
          variants={getOverviewContainerVariants(isReduced, 0.12)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            variants={getOverviewRevealVariants(isReduced, 22)}
            whileHover={isReduced ? undefined : { y: -4, scale: 1.008 }}
            className="border border-border p-6 bg-card space-y-4 flex flex-col justify-between hover:bg-background transition-colors duration-300 hover:shadow-md"
          >
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-[-0.02em]">
                Kepuasan Pelanggan
              </h3>
              <div
                className="neumorphic-chip font-mono text-xs"
                data-tone={
                  overviewData?.customerSatisfaction.value !== null &&
                  overviewData?.customerSatisfaction.value !== undefined
                    ? 'success'
                    : 'muted'
                }
              >
                {overviewData?.customerSatisfaction.value !== null &&
                overviewData?.customerSatisfaction.value !== undefined
                  ? 'LIVE'
                  : 'BELUM TERHUBUNG'}
              </div>
            </div>
            <div className="space-y-2">
              {overviewData?.customerSatisfaction.value !== null &&
              overviewData?.customerSatisfaction.value !== undefined ? (
                <>
                  <div className="font-display font-extrabold text-2xl text-foreground">
                    {overviewData.customerSatisfaction.value.toLocaleString('id-ID', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </div>
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                    Sumber: {overviewData.customerSatisfaction.source}
                  </p>
                </>
              ) : (
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {overviewData?.customerSatisfaction.unavailableReason ||
                    'Data kepuasan pelanggan belum tersedia.'}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={getOverviewRevealVariants(isReduced, 24)}
            whileHover={isReduced ? undefined : { y: -4, scale: 1.008 }}
            className="border border-border p-6 bg-card space-y-4 flex flex-col justify-between hover:bg-background transition-colors duration-300 hover:shadow-md"
          >
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-[-0.02em]">
                Ringkasan Operasional
              </h3>
              <span
                className="neumorphic-chip font-mono text-xs"
                data-tone={
                  topbarStatus.tone === 'success'
                    ? 'success'
                    : topbarStatus.tone === 'accent'
                      ? 'accent'
                      : 'muted'
                }
              >
                {topbarStatus.label}
              </span>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs text-muted-foreground font-bold block uppercase tracking-widest">
                RANGKUMAN DATA
              </span>
              <div className="font-sans text-sm text-foreground leading-relaxed space-y-2">
                <p>
                  <span className="font-bold">Tanggal bisnis:</span>{' '}
                  {overviewData ? formatDateID(overviewData.businessDate) : 'Memuat...'}
                </p>
                <p>
                  <span className="font-bold">Diperbarui:</span>{' '}
                  {overviewData
                    ? formatDateTime(overviewData.generatedAt, overviewData.timezone)
                    : 'Memuat...'}
                </p>
                <p>
                  <span className="font-bold">Pembaruan kasir:</span>{' '}
                  {buildFreshnessLabel(overviewData)}
                </p>
                <p>
                  <span className="font-bold">Gambaran outlet:</span>{' '}
                  {overviewData?.operationalStatus.reason ||
                    overviewError ||
                    'Menunggu ringkasan backend.'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </>
  )
}
