'use client'

import { motion } from 'framer-motion'

import {
  getOverviewContainerVariants,
  getOverviewPulseAnimation,
  getOverviewRevealVariants,
} from './overview-motion'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { formatDateID } from '@/lib/admin/format/date'
import type { DashboardOverviewData } from '@/lib/admin/overview/contracts'
import { buildFreshnessLabel, buildOverviewTopbarStatus } from '@/lib/admin/overview/view-model'

type OverviewSidebarProps = {
  overviewData?: DashboardOverviewData
  overviewError: string | null
  overviewLoading: boolean
  userFullName: string
  userId: string
  userRole: string
}

function formatDateTime(timestamp: string | undefined, timeZone: string): string {
  if (!timestamp) {
    return 'Belum ada sinkron'
  }

  return new Intl.DateTimeFormat('id-ID', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

function cashierStatusLabel(data: DashboardOverviewData | undefined): string {
  switch (data?.cashierConnection.status) {
    case 'connected':
      return 'TERHUBUNG'
    case 'disconnected':
      return 'BELUM AKTIF'
    case 'error':
      return 'ERROR'
    case 'not_configured':
      return 'BELUM DIATUR'
    default:
      return 'MEMUAT'
  }
}

export function OverviewSidebar({
  overviewData,
  overviewError,
  overviewLoading,
  userFullName,
  userId,
  userRole,
}: OverviewSidebarProps) {
  const isReduced = useReducedMotion()
  const topbarStatus = buildOverviewTopbarStatus(overviewData, overviewError)
  const weatherUnavailableReason =
    overviewData?.weather.unavailableReason || overviewError || 'Cuaca belum tersedia.'
  const inventoryUnavailableReason =
    overviewData?.inventoryStatus.unavailableReason || overviewError || 'Inventaris belum tersedia.'
  const operationalReason =
    overviewData?.operationalStatus.reason || overviewError || 'Ringkasan outlet sedang disiapkan.'

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={getOverviewContainerVariants(isReduced, 0.08)}
      className="border border-border bg-[#FFF3F5] p-6 space-y-6"
    >
      <motion.div
        variants={getOverviewRevealVariants(isReduced, 14)}
        className="border-b border-border pb-3 flex justify-between items-center"
      >
        <div>
          <span className="font-mono text-xs font-black text-[#FF4F79] uppercase tracking-[0.2em] block">
            KONDISI OUTLET
          </span>
          <h3 className="font-display font-semibold text-sm text-foreground uppercase tracking-[-0.02em] leading-none mt-1">
            Nadi Operasional
          </h3>
        </div>
        <div
          className="neumorphic-chip font-mono text-xs"
          data-tone={
            topbarStatus.tone === 'success'
              ? 'success'
              : topbarStatus.tone === 'accent'
                ? 'accent'
                : 'muted'
          }
        >
          <motion.span
            animate={getOverviewPulseAnimation(isReduced)}
            className={`w-1.5 h-1.5 rounded-full ${
              topbarStatus.tone === 'success'
                ? 'bg-emerald-500'
                : topbarStatus.tone === 'accent'
                  ? 'bg-[#FF4F79]'
                  : 'bg-muted-foreground'
            }`}
          />
          <span>{topbarStatus.label}</span>
        </div>
      </motion.div>
      <motion.p
        variants={getOverviewRevealVariants(isReduced, 16)}
        className="font-sans text-sm text-muted-foreground leading-relaxed"
      >
        {operationalReason}
      </motion.p>

      <motion.div variants={getOverviewContainerVariants(isReduced, 0.07)} className="space-y-4">
        <motion.div variants={getOverviewRevealVariants(isReduced, 14)} className="space-y-1.5">
          <span className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
            PENGGUNA AKTIF
          </span>
          <div className="flex justify-between items-center gap-3 bg-background border border-border/50 px-3 py-2">
            <div className="min-w-0">
              <span className="font-sans text-sm font-semibold text-foreground truncate block">
                {userFullName}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                ID {userId}
              </span>
            </div>
            <span className="neumorphic-chip text-xs" data-tone="accent">
              {userFullName.toLowerCase().includes('ferdi') ? 'DEVELOPER' : userRole}
            </span>
          </div>
        </motion.div>

        <motion.div variants={getOverviewRevealVariants(isReduced, 16)} className="space-y-1.5">
          <span className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
            STOK DAGING ASAP
          </span>
          <div className="bg-background border border-border/50 p-3 space-y-2">
            {overviewLoading ? (
              <div className="font-sans text-sm text-muted-foreground">
                Memuat ringkasan inventaris...
              </div>
            ) : overviewData?.inventoryStatus.coveragePercent !== null &&
              overviewData?.inventoryStatus.coveragePercent !== undefined ? (
              <>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">INVENTARIS</span>
                  <span className="text-foreground font-semibold">
                    {overviewData.inventoryStatus.coveragePercent}% ·{' '}
                    {overviewData.inventoryStatus.lowStockCount === 0
                      ? 'AMAN'
                      : `${overviewData.inventoryStatus.lowStockCount} PERLU CEK`}
                  </span>
                </div>
                <div className="h-1.5 bg-card border border-border/60 overflow-hidden">
                  <motion.div
                    className="h-full bg-foreground"
                    initial={isReduced ? false : { width: 0 }}
                    whileInView={
                      isReduced
                        ? undefined
                        : { width: `${overviewData.inventoryStatus.coveragePercent}%` }
                    }
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="font-sans text-xs text-muted-foreground leading-relaxed">
                  {overviewData.inventoryStatus.totalTrackedItems ?? 0} item dipantau untuk outlet
                  aktif.
                </div>
              </>
            ) : (
              <div className="font-sans text-sm text-muted-foreground leading-relaxed">
                {inventoryUnavailableReason}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={getOverviewRevealVariants(isReduced, 18)} className="space-y-1.5">
          <span className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
            CUACA {overviewData?.weather.location?.toUpperCase() || 'OUTLET'}
          </span>
          <div className="bg-background border border-border/50 p-3">
            {overviewLoading ? (
              <div className="font-sans text-sm text-muted-foreground">Memuat cuaca live...</div>
            ) : overviewData?.weather.temperature !== undefined &&
              overviewData.weather.condition ? (
              <>
                <div className="font-display font-semibold text-sm text-foreground uppercase">
                  {overviewData.weather.temperature}°C · {overviewData.weather.condition}
                </div>
                <div className="font-sans text-xs text-muted-foreground mt-1">
                  Kelembaban: {overviewData.weather.humidity ?? 'N/A'}% | Angin:{' '}
                  {overviewData.weather.windSpeedKmh ?? 'N/A'} km/h
                </div>
              </>
            ) : (
              <div className="font-sans text-sm text-muted-foreground leading-relaxed">
                {weatherUnavailableReason}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={getOverviewRevealVariants(isReduced, 20)} className="space-y-1.5">
          <span className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
            AKTIVITAS KASIR
          </span>
          <div className="bg-background border border-border/50 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-sans text-sm text-muted-foreground">KASIR / POS</span>
              <span
                className="neumorphic-chip text-xs"
                data-tone={
                  overviewData?.cashierConnection.status === 'connected'
                    ? 'success'
                    : overviewData?.cashierConnection.status === 'error'
                      ? 'accent'
                      : 'muted'
                }
              >
                {cashierStatusLabel(overviewData)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-muted-foreground">UPDATE TERAKHIR</span>
              <span className="font-sans text-sm text-foreground font-semibold text-right">
                {formatDateTime(
                  overviewData?.cashierConnection.lastSuccessfulSyncAt,
                  overviewData?.timezone || 'Asia/Jakarta'
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-muted-foreground">JEDA TERAKHIR</span>
              <span className="font-sans text-sm text-foreground font-semibold text-right">
                {buildFreshnessLabel(overviewData)}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={getOverviewRevealVariants(isReduced, 22)} className="space-y-1.5">
          <span className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
            CATATAN HARI INI
          </span>
          <div className="bg-background border border-border/50 p-3 leading-relaxed text-foreground font-sans space-y-2">
            {overviewLoading ? (
              <p className="font-sans text-sm text-muted-foreground">
                Menyiapkan catatan operasional...
              </p>
            ) : overviewData ? (
              <>
                <p className="font-sans text-sm">
                  <span className="font-semibold">Tanggal bisnis:</span>{' '}
                  {formatDateID(overviewData.businessDate)}
                </p>
                {overviewData.auditNotes.map((note, index) => (
                  <p key={`${note}-${index}`} className="font-sans text-sm text-muted-foreground">
                    {note}
                  </p>
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {overviewError || 'Catatan hari ini belum tersedia.'}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
