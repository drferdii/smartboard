'use client'

import type { DashboardMode } from '@/lib/admin/overview/outlet-contracts'

type DashboardModeBadgeProps = {
  mode: DashboardMode
  onExitDemo?: () => void
}

const MODE_CONFIG: Record<
  DashboardMode,
  { label: string; description: string; tone: 'success' | 'accent' | 'muted' }
> = {
  live: {
    label: 'LIVE',
    description: 'Data berasal dari sumber operasional aktif.',
    tone: 'success',
  },
  demo: {
    label: 'DEMO MODE',
    description: 'Data contoh untuk preview dashboard.',
    tone: 'accent',
  },
  empty: {
    label: 'DATA BELUM ADA',
    description: 'Menunggu data valid dari operasional outlet.',
    tone: 'muted',
  },
}

export function DashboardModeBadge({ mode, onExitDemo }: DashboardModeBadgeProps) {
  const config = MODE_CONFIG[mode]

  return (
    <div className="flex items-center gap-3">
      <span className="neumorphic-chip font-mono text-[10px]" data-tone={config.tone}>
        <span
          aria-hidden="true"
          className={`w-1.5 h-1.5 rounded-full ${
            config.tone === 'success'
              ? 'bg-emerald-500'
              : config.tone === 'accent'
                ? 'bg-[#FF4F79]'
                : 'bg-muted-foreground'
          }`}
        />
        {config.label}
      </span>
      <span className="font-sans text-xs text-muted-foreground leading-relaxed hidden sm:block">
        {config.description}
      </span>
      {mode === 'demo' && onExitDemo && (
        <button
          type="button"
          onClick={onExitDemo}
          className="neumorphic-chip font-mono text-[10px] hover:bg-[#FFF0F3] transition-colors"
          data-tone="muted"
        >
          KELUAR DEMO
        </button>
      )}
    </div>
  )
}
