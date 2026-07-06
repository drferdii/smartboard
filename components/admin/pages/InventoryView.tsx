'use client'

import { PackagePlus, RefreshCw, Filter } from 'lucide-react'
import React from 'react'
import useSWR from 'swr'

import { PageHeader } from '@/components/admin/PageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { VerticalBranding } from '@/components/admin/VerticalBranding'

type InventoryItem = {
  id: string
  name: string
  category: string
  stock: number
  unit: string
  cost_per_unit: number
  min_stock_alert: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function InventoryView() {
  const { data } = useSWR('/api/admin/inventory', fetcher, { suspense: true })

  const getStatus = (item: InventoryItem) => {
    if (item.stock <= 0) return 'HABIS'
    if (item.stock <= item.min_stock_alert) return 'KRITIS'
    return 'AMAN'
  }

  const items: InventoryItem[] = data?.data || []

  return (
    <div className="relative min-h-[80vh] flex flex-col page-inventory animate-fade-in">
      <PageHeader
        label="MANAJEMEN BAHAN BAKU & HPP"
        title="Inventaris"
        action={
          <>
            <button className="flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest hover:bg-muted/10 transition-colors">
              <Filter className="w-4 h-4" /> FILTER
            </button>
            <button className="flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest hover:bg-muted/10 transition-colors">
              <RefreshCw className="w-4 h-4" /> SINKRONISASI STOK
            </button>
            <button className="flex items-center gap-2 border border-[#1C1917] bg-[#1C1917] text-white px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300">
              <PackagePlus className="w-4 h-4" /> TAMBAH ITEM
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
                  ID Item
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold">
                  Nama Item
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold">
                  Kategori
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold text-right">
                  Stok Aktual
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold text-right">
                  Status
                </th>
                <th className="py-4 px-6 font-mono text-sm uppercase tracking-widest text-muted-foreground font-bold text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground font-mono text-sm"
                  >
                    Tidak ada data inventaris.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 group hover:bg-background/50 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.id.slice(0, 8).toUpperCase()}...
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-display font-bold text-sm text-foreground uppercase tracking-wider">
                        {item.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm text-muted-foreground font-bold uppercase tracking-wider">
                      {item.category}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-mono text-sm font-bold text-foreground">
                        {item.stock.toLocaleString('id-ID')}{' '}
                        <span className="text-sm text-muted-foreground ml-1 uppercase">
                          {item.unit}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <StatusBadge
                        variant={
                          getStatus(item) === 'AMAN'
                            ? 'success'
                            : getStatus(item) === 'KRITIS'
                              ? 'warning'
                              : 'danger'
                        }
                      >
                        {getStatus(item)}
                      </StatusBadge>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button className="font-mono text-sm font-bold px-3 py-1.5 border border-border hover:bg-foreground hover:text-background uppercase tracking-widest transition-colors cursor-pointer">
                        DETAIL
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
        text="SEMAYOT // INVENTARIS"
        className="absolute -right-12 top-0 bottom-0 pointer-events-none"
      />
    </div>
  )
}
