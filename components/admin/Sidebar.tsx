'use client'

import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Calculator,
  Receipt,
  TrendingUp,
  Bot,
  Globe,
  Settings,
  LogOut,
  Users,
  Heart,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { UserRole } from '@/lib/admin/supabase/types'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/overview', label: 'Ringkasan', icon: LayoutDashboard, roles: ['owner', 'staff'] },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed, roles: ['owner'] },
  { href: '/admin/pos', label: 'Kasir', icon: Calculator, roles: ['owner', 'staff'] },
  { href: '/admin/transactions', label: 'Transaksi', icon: Receipt, roles: ['owner', 'staff'] },
  { href: '/admin/reports', label: 'Laporan', icon: TrendingUp, roles: ['owner'] },
  { href: '/admin/customers', label: 'Pelanggan', icon: Users, roles: ['owner'] },
  { href: '/admin/customers/trends', label: 'Tren & Kepuasan', icon: Heart, roles: ['owner'] },
  { href: '/admin/ai', label: 'AI Ringkasan', icon: Bot, roles: ['owner'] },
  { href: '/admin/seo', label: 'SEO', icon: Globe, roles: ['owner'] },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings, roles: ['owner'] },
]

export function Sidebar({ role, fullName }: { role: UserRole; fullName: string }) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <aside className="w-[240px] flex-shrink-0 bg-[var(--sidebar-bg)] text-foreground flex flex-col p-5 relative z-20 shadow-xl border-r border-[#1C1917]/10 select-none">
      {/* Brand Header */}
      <div className="pb-6 mb-6 border-b border-[#1C1917]/10">
        <Link href="/admin/overview" className="flex items-center gap-3 group">
          <img
            src="/semayot/images/bird.png"
            className="w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
            alt="Semayot"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[1rem] font-semibold tracking-[-0.03em] text-foreground whitespace-nowrap">
              Smartboard
            </span>
            <span className="font-display text-[0.78rem] font-light tracking-[0.06em] text-[#FF4F79] uppercase whitespace-nowrap">
              Semayot
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative pl-10 pr-3 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-3 border ${
                isActive
                  ? 'bg-card text-foreground border-border shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-500/10 border-transparent'
              }`}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <motion.div
                  layoutId="active-sidebar-line"
                  className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FF4F79]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
                  isActive ? 'text-[#FF4F79]' : 'text-stone-500 group-hover:text-stone-800'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Session Footer */}
      <div className="pt-6 mt-6 border-t border-[#1C1917]/10 font-mono">
        <div className="text-xs font-bold text-foreground truncate tracking-wide">
          {fullName.toUpperCase()}
        </div>
        <div className="neumorphic-chip mt-2 text-xs" data-tone="accent" data-depth="subtle">
          {fullName.toLowerCase().includes('ferdi')
            ? 'DEVELOPER'
            : role === 'owner'
              ? 'OWNER / DIREKTUR'
              : 'STAFF OPERASIONAL'}
        </div>

        <form action="/api/admin/auth/logout" method="post" className="mt-5">
          <button
            type="submit"
            className="neumorphic-btn w-full flex items-center justify-center gap-2 font-mono text-xs font-bold py-2.5 uppercase tracking-widest cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOG OUT</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
