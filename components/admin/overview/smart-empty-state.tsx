'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

import { getOverviewContainerVariants, getOverviewRevealVariants } from './overview-motion'

import { useReducedMotion } from '@/hooks/use-reduced-motion'

type SmartEmptyStateProps = {
  outletName: string
  onActivateDemo?: () => void
}

const STARTER_STEPS = [
  {
    label: 'Input transaksi pertama',
    href: '/admin/pos',
    description: 'Buka POS dan catat penjualan pertama hari ini.',
  },
  {
    label: 'Cek stok awal',
    href: '/admin/inventory',
    description: 'Validasi stok awal sebelum jam ramai.',
  },
  {
    label: 'Validasi kasir aktif',
    href: '/admin/staff',
    description: 'Pastikan kasir bertugas dan dapat mencatat transaksi.',
  },
]

export function SmartEmptyState({ outletName, onActivateDemo }: SmartEmptyStateProps) {
  const isReduced = useReducedMotion()

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={getOverviewContainerVariants(isReduced, 0.08)}
      className="border border-border bg-card p-6 space-y-6 relative overflow-hidden"
    >
      <motion.div variants={getOverviewRevealVariants(isReduced, 12)} className="space-y-2">
        <span className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#FF4F79] block">
          {outletName.toUpperCase()} · BELUM ADA DATA
        </span>
        <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-foreground">
          Outlet belum memiliki transaksi valid hari ini.
        </h3>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-prose">
          Dashboard menahan semua klaim performa sampai data valid tersedia. Mulai dari salah satu
          langkah berikut untuk mengaktifkan Nadi Outlet.
        </p>
      </motion.div>

      <motion.ul variants={getOverviewContainerVariants(isReduced, 0.07)} className="space-y-3">
        {STARTER_STEPS.map((step, index) => (
          <motion.li
            key={step.label}
            variants={getOverviewRevealVariants(isReduced, 16 + index * 4)}
            className="bg-background border border-border/60 p-4 flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  LANGKAH {index + 1}
                </span>
              </div>
              <h4 className="font-display text-sm font-semibold text-foreground">{step.label}</h4>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed mt-1">
                {step.description}
              </p>
            </div>
            <Link
              href={step.href}
              className="neumorphic-chip font-mono text-[10px] hover:bg-[#FFF0F3] transition-colors"
              data-tone="accent"
            >
              BUKA
            </Link>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div
        variants={getOverviewRevealVariants(isReduced, 28)}
        className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <p className="font-sans text-xs text-muted-foreground leading-relaxed max-w-md">
          Ingin melihat tampilan dashboard dengan data contoh? Aktifkan Demo Mode — data tidak akan
          dikirim atau disimpan.
        </p>
        <button
          type="button"
          onClick={onActivateDemo}
          className="neumorphic-chip font-mono text-[10px] hover:bg-[#FFF0F3] transition-colors"
          data-tone="muted"
        >
          AKTIFKAN DEMO MODE
        </button>
      </motion.div>
    </motion.section>
  )
}
