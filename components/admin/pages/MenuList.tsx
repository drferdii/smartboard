'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { MoneyDisplay } from '@/components/admin/MoneyDisplay'

type MenuItem = {
  id: string
  name: string
  description: string | null
  price_cents: number
  category: 'dayak' | 'smoked' | 'pedas' | 'minuman'
  photo_url: string | null
  badge: string | null
  is_active: boolean
}

const CATEGORY_LABEL: Record<string, string> = {
  dayak: 'DAYAK TRADISIONAL',
  smoked: 'ASAP OTENTIK',
  pedas: 'CITA RASA PEDAS',
  minuman: 'MINUMAN SEGAR',
}

export function MenuList() {
  const router = useRouter()
  const pathname = usePathname()
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/menu?include_inactive=true')
      const json = await res.json()
      if (res.ok) {
        setItems(json.data)
        setError(null)
      } else {
        setError(json.error?.message ?? 'Gagal memuat menu.')
      }
    } catch (e) {
      console.error(e)
      const message = e instanceof Error ? e.message : 'Koneksi jaringan terputus.'
      setError(e instanceof SyntaxError ? 'Respons server tidak valid (500).' : message)
    }
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    const run = async () => {
      await Promise.resolve()
      if (!active) return
      load()
    }
    run()
    return () => {
      active = false
    }
  }, [pathname])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus menu "${name}" secara permanen?`)) return
    const res = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' })
    if (res.ok) {
      await load()
    } else {
      alert('Gagal menghapus menu.')
    }
  }

  if (loading) {
    return (
      <div className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest py-8 animate-pulse">
        Menyinkronkan katalog menu kuliner...
      </div>
    )
  }

  if (error) {
    return (
      <div className="font-mono text-xs text-red-600 border border-red-600/20 bg-red-600/5 p-4 uppercase tracking-wider animate-fade-in">
        CATALOG_ERROR: {error}
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-5xl relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-11 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-end border-b border-border pb-4">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block mb-1 font-bold">
                Konsol Katalog Produk
              </span>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground uppercase">
                Daftar Menu Hidangan
              </h2>
            </div>
            <button
              onClick={() => router.push('/admin/menu/new')}
              className="neumorphic-btn font-mono text-[10px] font-bold px-5 py-3 uppercase tracking-widest"
            >
              + Tambah Menu Baru
            </button>
          </div>

          {items.length === 0 ? (
            <div className="border border-border bg-card p-12 text-center">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-4">
                Katalog makanan dan minuman masih kosong.
              </p>
              <button
                onClick={() => router.push('/admin/menu/new')}
                className="neumorphic-btn font-mono text-[10px] font-bold px-6 py-3 uppercase tracking-widest"
              >
                Tambah Item Pertama
              </button>
            </div>
          ) : (
            <div className="scroll-indicator-wrapper">
              <div className="border border-border overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-card border-b border-border">
                      <th className="text-left font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                        Nama Menu
                      </th>
                      <th className="text-left font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                        Kategori
                      </th>
                      <th className="text-right font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                        Harga Satuan
                      </th>
                      <th className="text-center font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                        Status
                      </th>
                      <th className="text-right font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-border/60 hover:bg-card/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-display font-medium text-foreground">
                          <div>{item.name}</div>
                          {item.badge && (
                            <span className="inline-block font-mono text-[7px] font-bold tracking-widest border border-foreground/20 text-foreground px-1.5 py-0.5 uppercase mt-1">
                              {item.badge}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {CATEGORY_LABEL[item.category] ?? item.category}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-xs font-bold text-foreground tabular-nums">
                          <MoneyDisplay cents={item.price_cents} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-block font-mono text-[8px] font-bold px-2 py-1 border uppercase tracking-wider ${
                              item.is_active
                                ? 'border-emerald-600/30 text-emerald-700 bg-emerald-500/5'
                                : 'border-border text-muted-foreground bg-background/50'
                            }`}
                          >
                            {item.is_active ? 'AKTIF' : 'NON-AKTIF'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-[9px] font-bold uppercase tracking-widest space-x-4">
                          <button
                            onClick={() => router.push(`/admin/menu/${item.id}`)}
                            className="text-foreground hover:text-muted-foreground transition-colors cursor-pointer"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="text-red-700 hover:text-red-900 transition-colors cursor-pointer"
                          >
                            HAPUS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        {/* Vertical Branding */}
        <div className="hidden md:flex md:col-span-1 justify-center pt-16 select-none opacity-20 hover:opacity-40 transition-opacity duration-300">
          <div className="font-mono text-[9px] font-black uppercase tracking-[0.3em] branding-vertical text-center whitespace-nowrap">
            KATALOG MENU SEMAYOT
          </div>
        </div>
      </div>
    </div>
  )
}
