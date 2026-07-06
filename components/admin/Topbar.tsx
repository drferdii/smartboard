'use client'

import { LayoutGroup, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { DashboardModeBadge } from './overview/dashboard-mode-badge'
import { useOverviewSummary } from './overview/use-overview-summary'

import { getTodayID, formatDateID } from '@/lib/admin/format/date'
import { buildOverviewTopbarStatus } from '@/lib/admin/overview/view-model'

const TextRotate = dynamic(() => import('@/components/ui/text-rotate').then((m) => m.TextRotate), {
  ssr: false,
})

const PAGE_TITLES: Record<string, string> = {
  '/admin/overview': 'Dashboard Semayot',
  '/admin/menu': 'Menu',
  '/admin/pos': 'Kasir',
  '/admin/transactions': 'Transaksi',
  '/admin/reports': 'Laporan',
  '/admin/ai': 'AI Ringkasan',
  '/admin/seo': 'SEO',
  '/admin/settings': 'Pengaturan',
}

export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOverviewPage = pathname === '/admin/overview'
  const selectedBranchId = searchParams.get('branchId')
  const overviewSummary = useOverviewSummary(selectedBranchId, isOverviewPage)
  const title = PAGE_TITLES[pathname] ?? 'ADMINISTRASI'
  const today = formatDateID(getTodayID())
  const overviewError =
    overviewSummary.error instanceof Error
      ? overviewSummary.error.message
      : overviewSummary.error
        ? 'Gagal memuat status operasional.'
        : null
  const topbarStatus = buildOverviewTopbarStatus(overviewSummary.data, overviewError)
  const branches = isOverviewPage ? (overviewSummary.data?.branches ?? []) : []
  const branchValue = overviewSummary.data?.selectedBranchId ?? selectedBranchId
  const activeBranchId =
    branchValue && branches.some((branch) => branch.id === branchValue)
      ? branchValue
      : 'unavailable'

  const dashboardMode = isOverviewPage
    ? overviewSummary.data
      ? 'live'
      : overviewSummary.isLoading
        ? undefined
        : 'empty'
    : undefined

  const handleBranchChange = async (nextBranchId: string) => {
    if (nextBranchId === 'add_branch') {
      const name = prompt('Masukkan nama outlet baru:')
      if (!name || !name.trim()) {
        return
      }

      try {
        const response = await fetch('/api/admin/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        })

        if (!response.ok) {
          const errData = await response.json()
          alert(errData.error || 'Gagal menambahkan outlet.')
          return
        }

        const newBranch = await response.json()
        alert(`Outlet "${newBranch.name}" berhasil ditambahkan!`)

        const nextParams = new URLSearchParams(searchParams.toString())
        nextParams.set('branchId', newBranch.id)
        const query = nextParams.toString()

        window.location.search = query
      } catch {
        alert('Terjadi kesalahan saat menambahkan outlet.')
      }
      return
    }

    const nextParams = new URLSearchParams(searchParams.toString())

    if (!nextBranchId || nextBranchId === 'unavailable') {
      nextParams.delete('branchId')
    } else {
      nextParams.set('branchId', nextBranchId)
    }

    const query = nextParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <header className="h-24 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-8 flex-shrink-0 relative z-20">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-baseline gap-3">
          {isOverviewPage ? (
            <LayoutGroup>
              <div>
                <motion.div className="flex items-baseline gap-2 overflow-hidden" layout>
                  <motion.span
                    className="font-display font-semibold text-base md:text-xl text-foreground uppercase leading-none tracking-[-0.02em]"
                    layout
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  >
                    Dashboard{' '}
                  </motion.span>
                  <TextRotate
                    texts={['Semayot', 'Pemasukan', 'Transaksi', 'Stok', 'Laporan']}
                    mainClassName="px-2 py-0.5 bg-[#FF4F79]/10 border border-[#FF4F79]/20 overflow-hidden justify-center"
                    elementLevelClassName="font-display font-semibold text-base md:text-xl text-[#FF4F79] uppercase tracking-[-0.02em]"
                    staggerFrom="last"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-120%' }}
                    staggerDuration={0.03}
                    splitLevelClassName="overflow-hidden pb-0.5"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    rotationInterval={2500}
                  />
                </motion.div>
                {dashboardMode && (
                  <div className="mt-1.5">
                    <DashboardModeBadge mode={dashboardMode} />
                  </div>
                )}
              </div>
            </LayoutGroup>
          ) : (
            <h1 className="font-display text-base md:text-xl font-semibold tracking-[-0.02em] text-foreground uppercase leading-none">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-8 font-mono">
          {isOverviewPage ? (
            <div className="hidden lg:flex items-center gap-3">
              <select
                className="neumorphic-select text-foreground text-sm font-bold uppercase tracking-widest px-4 py-2 pr-9 focus:outline-none"
                value={activeBranchId}
                onChange={(event) => handleBranchChange(event.target.value)}
              >
                {branches.length > 0 ? (
                  branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))
                ) : (
                  <option value="unavailable">OUTLET BELUM TERSEDIA</option>
                )}
                <option value="add_branch" className="text-[#FF4F79] font-bold">
                  + TAMBAH OUTLET BARU
                </option>
              </select>
            </div>
          ) : null}

          <div className="hidden lg:flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
              {today}
            </span>
            {isOverviewPage ? <div className="opacity-20 text-foreground">|</div> : null}
          </div>

          {isOverviewPage ? (
            <div className="flex items-center gap-2">
              <span
                className="neumorphic-chip text-xs"
                data-tone={
                  topbarStatus.tone === 'success'
                    ? 'success'
                    : topbarStatus.tone === 'accent'
                      ? 'accent'
                      : 'muted'
                }
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    topbarStatus.tone === 'success'
                      ? 'bg-emerald-500'
                      : topbarStatus.tone === 'accent'
                        ? 'bg-[#FF4F79]'
                        : 'bg-muted-foreground'
                  } animate-pulse-soft`}
                />
                {topbarStatus.label}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
