'use client'

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

import { CashierClosingAssistant } from './cashier-closing-assistant'
import { OutletHealthCard } from './outlet-health-card'
import { OverviewAnalytics } from './overview-analytics'
import { OverviewChatPanel } from './overview-chat-panel'
import { type GreetingState } from './overview-data'
import { OverviewHero } from './overview-hero'
import { OverviewKpis } from './overview-kpis'
import {
  getOverviewContainerVariants,
  getOverviewRevealVariants,
  getOverviewSlideVariants,
} from './overview-motion'
import { OverviewSidebar } from './overview-sidebar'
import { OverviewTransactions } from './overview-transactions'
import { SemaDailyBrief } from './sema-daily-brief'
import { SmartEmptyState } from './smart-empty-state'
import { StockRiskRadar } from './stock-risk-radar'
import { TodayPriorityPanel } from './today-priority-panel'
import { useOverviewState } from './use-overview-state'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildCashierClosingStatus,
  buildOutletHealthScore,
  buildSemaBrief,
  buildTodayPriorities,
} from '@/lib/admin/overview/intelligence'
import { adaptDashboardOverview } from '@/lib/admin/overview/outlet-adapter'
import type { DashboardMode } from '@/lib/admin/overview/outlet-contracts'
import { buildDemoOutletDashboardData } from '@/lib/admin/overview/outlet-fixtures'

type OverviewPageClientProps = {
  initialGreeting: GreetingState
}

export function OverviewPageClient({ initialGreeting }: OverviewPageClientProps) {
  const state = useOverviewState(initialGreeting)
  const isReduced = useReducedMotion()
  const [demoOverride, setDemoOverride] = useState(false)
  const pageVariants = getOverviewContainerVariants(isReduced, 0.1)
  const columnVariants = getOverviewContainerVariants(isReduced, 0.12)
  const leftPanelVariants = getOverviewRevealVariants(isReduced, 22)
  const rightPanelVariants = getOverviewSlideVariants(isReduced, 24)

  const outletData = useMemo(() => {
    if (demoOverride) {
      return buildDemoOutletDashboardData()
    }
    if (state.overviewData) {
      return adaptDashboardOverview(state.overviewData)
    }
    return null
  }, [demoOverride, state.overviewData])

  const mode: DashboardMode = demoOverride ? 'demo' : (outletData?.mode ?? 'empty')

  const healthScore = useMemo(
    () => (outletData ? buildOutletHealthScore(outletData) : null),
    [outletData]
  )
  const priorities = useMemo(
    () => (outletData ? buildTodayPriorities(outletData) : []),
    [outletData]
  )
  const cashierClosing = useMemo(
    () => (outletData ? buildCashierClosingStatus(outletData) : null),
    [outletData]
  )
  const semaBrief = useMemo(
    () => (outletData ? buildSemaBrief(outletData, priorities) : null),
    [outletData, priorities]
  )

  const handlePromptClick = (prompt: string) => {
    state.setChatInput(prompt)
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={pageVariants}
      className="relative z-30 py-6 page-overview select-none space-y-8"
    >
      {mode === 'empty' && healthScore?.status === 'insufficient_data' ? (
        <motion.div variants={leftPanelVariants}>
          <SmartEmptyState
            outletName={outletData?.outlet.name ?? 'Rumah Makan Semayot'}
            onActivateDemo={() => setDemoOverride(true)}
          />
        </motion.div>
      ) : (
        <>
          {/* KONSOL MALAM HARI — greeting paling atas */}
          <motion.div variants={leftPanelVariants}>
            <OverviewHero
              greeting={state.greeting}
              agentMessages={state.agentMessages}
              userFullName={state.userFullName}
            />
          </motion.div>

          {/* KPI OPERASIONAL — penjualan, rata2, transaksi, kepuasan */}
          <motion.div variants={leftPanelVariants}>
            <OverviewKpis kpis={state.kpis} />
          </motion.div>

          {/* SEMA CORNER + METRIK OPERASIONAL + KONTEN UTAMA — satu grid */}
          <motion.div
            variants={columnVariants}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <motion.div variants={leftPanelVariants} className="lg:col-span-8 space-y-8">
              <OverviewChatPanel
                chatContainerRef={state.chatContainerRef}
                chatError={state.chatError}
                chatInput={state.chatInput}
                chatLoading={state.chatLoading}
                chatMessages={state.chatMessages}
                isChatExpanded={state.isChatExpanded}
                onChatSubmit={state.onChatSubmit}
                setChatInput={state.setChatInput}
                setIsChatExpanded={state.setIsChatExpanded}
              />
              {healthScore && <OutletHealthCard score={healthScore} />}
              <TodayPriorityPanel
                priorities={priorities}
                onActivateDemo={() => setDemoOverride(true)}
              />
              <StockRiskRadar items={outletData?.inventory.items ?? []} />
              <OverviewAnalytics
                overviewData={state.overviewData}
                overviewError={state.overviewError}
                overviewLoading={state.overviewLoading}
              />
              <OverviewTransactions
                overviewData={state.overviewData}
                overviewError={state.overviewError}
                overviewLoading={state.overviewLoading}
                recentTransactions={state.recentTransactions}
              />
            </motion.div>
            <motion.div variants={rightPanelVariants} className="lg:col-span-4 space-y-8">
              {semaBrief && <SemaDailyBrief brief={semaBrief} onPromptClick={handlePromptClick} />}
              {cashierClosing && <CashierClosingAssistant status={cashierClosing} />}
              <OverviewSidebar
                overviewData={state.overviewData}
                overviewError={state.overviewError}
                overviewLoading={state.overviewLoading}
                userFullName={state.userFullName}
                userId={state.userId}
                userRole={state.userRole}
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
