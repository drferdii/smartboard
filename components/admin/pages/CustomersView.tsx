'use client'

import { UserPlus, Download, MessageCircle } from 'lucide-react'
import React from 'react'
import useSWR from 'swr'

import { PageHeader } from '@/components/admin/PageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { VerticalBranding } from '@/components/admin/VerticalBranding'

type Customer = {
  id: string
  name: string
  phone: string
  points: number
  total_visits: number
  total_spent: number
  last_visit: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CustomersView() {
  const { data } = useSWR('/api/admin/customers', fetcher, { suspense: true })

  const getTier = (points: number) => {
    if (points >= 10000) return 'GOLD'
    if (points >= 5000) return 'SILVER'
    return 'BRONZE'
  }

  const customers: Customer[] = data?.data || []

  return (
    <div className="relative min-h-[80vh] flex flex-col page-customers animate-fade-in">
      <PageHeader
        label="CRM & PROGRAM LOYALITAS"
        title="Pelanggan"
        action={
          <>
            <button className="flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest hover:bg-muted/10 transition-colors">
              <Download className="w-4 h-4" /> EKSPOR DATA
            </button>
            <button className="flex items-center gap-2 border border-[#1C1917] bg-[#1C1917] text-white px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300">
              <UserPlus className="w-4 h-4" /> MEMBER BARU
            </button>
          </>
        }
      />

      <div className="mt-8 flex-1 scroll-indicator-wrapper">
        <div className="border border-border bg-card p-1 relative z-10 shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold">
                  ID Member
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold">
                  Nama Pelanggan
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold">
                  Kontak
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold text-center">
                  Total Pesanan
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold text-right">
                  Total Belanja
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold">
                  Tier
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground font-mono text-sm"
                  >
                    Tidak ada pelanggan terdaftar.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="border-b border-border/50 group hover:bg-background/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      {cust.id.slice(0, 8).toUpperCase()}...
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-display font-bold text-sm text-foreground uppercase tracking-wider">
                        {cust.name}
                      </div>
                      <div className="font-mono text-sm text-muted-foreground font-bold uppercase tracking-wider mt-1">
                        Terakhir:{' '}
                        {cust.last_visit
                          ? new Date(cust.last_visit).toLocaleDateString('id-ID')
                          : '-'}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm font-bold text-foreground tracking-wider">
                      {cust.phone}
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-sm font-bold text-foreground">
                      {cust.total_visits}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-mono text-sm font-bold text-foreground">
                        Rp {Number(cust.total_spent).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge
                        variant={
                          getTier(cust.points) === 'GOLD'
                            ? 'success'
                            : getTier(cust.points) === 'SILVER'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {getTier(cust.points)}
                      </StatusBadge>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="font-mono text-sm font-bold px-3 py-1.5 border border-border hover:bg-emerald-600 hover:border-emerald-600 hover:text-white uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto">
                        <MessageCircle className="w-3 h-3" />
                        PROMO WA
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VerticalBranding
        text="SEMAYOT // PELANGGAN"
        className="absolute -right-12 top-0 bottom-0 pointer-events-none"
      />
    </div>
  )
}
