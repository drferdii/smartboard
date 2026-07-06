'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

import { getOverviewContainerVariants, getOverviewRevealVariants } from './overview-motion'

import { useReducedMotion } from '@/hooks/use-reduced-motion'
import type { StockRiskItem } from '@/lib/admin/overview/outlet-contracts'

type StockRiskRadarProps = {
  items: StockRiskItem[]
}

const GROUP_ORDER: Array<{
  key: StockRiskItem['status']
  label: string
  tone: 'accent' | 'muted' | 'success'
}> = [
  { key: 'critical', label: 'Kritis', tone: 'accent' },
  { key: 'warning', label: 'Perlu cek', tone: 'accent' },
  { key: 'safe', label: 'Aman', tone: 'success' },
  { key: 'unknown', label: 'Belum ada data', tone: 'muted' },
]

function groupItems(items: StockRiskItem[]) {
  return GROUP_ORDER.map((group) => ({
    ...group,
    items: items.filter((item) => item.status === group.key),
  })).filter((group) => group.items.length > 0)
}

export function StockRiskRadar({ items }: StockRiskRadarProps) {
  const isReduced = useReducedMotion()
  const groups = groupItems(items)
  const isEmpty = items.length === 0

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={getOverviewContainerVariants(isReduced, 0.08)}
      className="border border-border bg-[#FFECF0] p-6 space-y-4"
    >
      <motion.div
        variants={getOverviewRevealVariants(isReduced, 12)}
        className="flex items-center justify-between"
      >
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#FF4F79] block">
            RADAR STOK
          </span>
          <h3 className="font-display text-sm font-semibold tracking-[-0.02em] text-foreground uppercase mt-1">
            Pantauan Inventaris
          </h3>
        </div>
        <Link
          href="/admin/inventory"
          className="neumorphic-chip font-mono text-[10px] hover:bg-[#FFF0F3] transition-colors"
          data-tone="muted"
        >
          BUKA INVENTARIS
        </Link>
      </motion.div>

      {isEmpty ? (
        <motion.div
          variants={getOverviewRevealVariants(isReduced, 16)}
          className="bg-background border border-border/60 p-4"
        >
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            Data stok belum tersedia. Input stok awal untuk mengaktifkan radar stok.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={getOverviewContainerVariants(isReduced, 0.07)} className="space-y-4">
          {groups.map((group, groupIndex) => (
            <motion.div
              key={group.key}
              variants={getOverviewRevealVariants(isReduced, 14 + groupIndex * 4)}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
                <span className="neumorphic-chip font-mono text-[10px]" data-tone={group.tone}>
                  {group.items.length} ITEM
                </span>
              </div>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item.itemId}
                    className="bg-background border border-border/60 p-3 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-display text-sm font-semibold text-foreground">
                        {item.itemName}
                      </span>
                      {item.estimatedDaysLeft !== null ? (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          ~{item.estimatedDaysLeft} HARI
                        </span>
                      ) : null}
                    </div>
                    <div className="font-sans text-xs text-muted-foreground leading-relaxed">
                      {item.currentStock !== null
                        ? `Sisa ${item.currentStock} ${item.unit}${item.affectedMenus > 0 ? ` · ${item.affectedMenus} menu terdampak` : ''}`
                        : 'Stok belum diinput.'}
                    </div>
                    <div className="font-sans text-xs text-foreground leading-relaxed pt-1 border-t border-border/40">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
                        REKOMENDASI
                      </span>
                      {item.recommendation}
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  )
}
