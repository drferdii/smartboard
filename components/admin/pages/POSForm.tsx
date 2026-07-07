'use client'

import {
  User,
  BookOpen,
  Clock,
  AlertTriangle,
  Tag,
  Sparkles,
  TrendingUp,
  Coins,
  Printer,
  Split,
  Search,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { MoneyDisplay } from '@/components/admin/MoneyDisplay'
import { createClient } from '@/lib/admin/supabase/client'

type MenuItem = {
  id: string
  name: string
  price_cents: number
  category: 'dayak' | 'smoked' | 'pedas' | 'minuman'
}

type CartItem = {
  menuItem: MenuItem
  quantity: number
  confirmed: boolean
  isComplimentary?: boolean
}

export function POSForm() {
  const router = useRouter()
  const pathname = usePathname()
  const [items, setItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [paidInput, setPaidInput] = useState('')
  const [paidCents, setPaidCents] = useState(0)
  const [customerPhone, setCustomerPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Cashier Active Session Information
  const [cashierName, setCashierName] = useState('Petugas Kasir')
  const [cashierRole, setCashierRole] = useState('Staff')
  const [shiftStart] = useState(() =>
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  )

  // --- NEW F&B STATE VARIABLES ---
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in')
  const [tableNumber, setTableNumber] = useState('')
  const [happyHourActive, setHappyHourActive] = useState(() => {
    const hour = new Date().getHours()
    return hour >= 14 && hour < 16
  })
  const [taxEnabled, setTaxEnabled] = useState(true)
  const [serviceEnabled, setServiceEnabled] = useState(true)

  // Modals
  const [kotPreviewOpen, setKotPreviewOpen] = useState(false)
  const [splitBillOpen, setSplitBillOpen] = useState(false)

  // Split bill assignments: maps item ID to 'customer_a' or 'customer_b'
  const [splitAssignments, setSplitAssignments] = useState<
    Record<string, 'customer_a' | 'customer_b'>
  >({})

  const getDisplayRole = (name: string, role: string) => {
    if (name.toLowerCase().includes('ferdi')) return 'DEVELOPER'
    if (role === 'owner') return 'OWNER / DIREKTUR'
    if (role === 'staff') return 'STAFF OPERASIONAL'
    return role.toUpperCase()
  }

  useEffect(() => {
    // Fetch active user
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCashierName(data.user.user_metadata.full_name || 'Petugas Kasir')
        setCashierRole(data.user.user_metadata.role || 'staff')
      }
    })
  }, [])

  useEffect(() => {
    fetch('/api/admin/menu')
      .then((r) => r.json())
      .then((json) => {
        setItems(json.data ?? [])
        setLoading(false)
      })
  }, [pathname])

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id)
      if (existing) {
        return prev.map((c) => (c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
      }
      return [...prev, { menuItem: item, quantity: 1, confirmed: false, isComplimentary: false }]
    })
  }

  const toggleConfirm = (id: string) => {
    setCart((prev) =>
      prev.map((c) => (c.menuItem.id === id ? { ...c, confirmed: !c.confirmed } : c))
    )
  }

  const toggleComplimentary = (id: string) => {
    setCart((prev) =>
      prev.map((c) => (c.menuItem.id === id ? { ...c, isComplimentary: !c.isComplimentary } : c))
    )
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.menuItem.id !== id))
      return
    }
    setCart((prev) => prev.map((c) => (c.menuItem.id === id ? { ...c, quantity: qty } : c)))
  }

  // --- NEW F&B CALCULATIONS ---
  const subtotalCents = cart.reduce((sum, c) => {
    let price = c.menuItem.price_cents
    if (c.isComplimentary) {
      price = 0
    } else if (happyHourActive && c.menuItem.category === 'minuman') {
      price = Math.round(c.menuItem.price_cents * 0.8)
    }
    return sum + price * c.quantity
  }, 0)

  const packagingFeeCents = orderType === 'takeaway' ? 200000 : 0 // Rp 2.000 in cents
  const taxCents = taxEnabled ? Math.round(subtotalCents * 0.1) : 0 // PB1 10%
  const serviceChargeCents = serviceEnabled ? Math.round(subtotalCents * 0.05) : 0 // Service 5%
  const totalCents = subtotalCents + packagingFeeCents + taxCents + serviceChargeCents
  const changeCents = paidCents - totalCents
  const canSubmit = cart.length > 0 && paidCents >= totalCents && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch('/api/admin/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((c) => ({
            menu_item_id: c.menuItem.id,
            quantity: c.quantity,
            is_complimentary: !!c.isComplimentary,
          })),
          paid_cents: paidCents,
          customer_phone: customerPhone || undefined,
          note: tableNumber ? `Meja ${tableNumber}` : undefined,
          order_type: orderType,
          table_number: orderType === 'dine_in' ? tableNumber : undefined,
          tax_enabled: taxEnabled,
          service_enabled: serviceEnabled,
          happy_hour_active: happyHourActive,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setSuccessMsg(`Transaksi #${json.data.id.slice(0, 8).toUpperCase()} berhasil dicatat!`)
        setCart([])
        setPaidInput('')
        setPaidCents(0)
        setCustomerPhone('')
        setTableNumber('')
        setSplitAssignments({})
        setTimeout(() => router.push('/admin/transactions'), 1200)
      } else {
        setError(json.error?.message ?? 'Gagal menyimpan transaksi.')
      }
    } catch (e) {
      console.error(e)
      const message = e instanceof Error ? e.message : 'Koneksi jaringan terputus.'
      setError(e instanceof SyntaxError ? 'Respons server tidak valid (500).' : message)
    } finally {
      setSubmitting(false)
    }
  }

  const getCustomCategory = (item: MenuItem): 'makanan_besar' | 'makanan_kecil' | 'minuman' => {
    if (item.category === 'minuman') return 'minuman'
    const lowerName = item.name.toLowerCase()
    if (
      lowerName.includes('mentah') ||
      lowerName.includes('1 kg') ||
      lowerName.includes('sate') ||
      lowerName.includes('kerupuk') ||
      lowerName.includes('cemilan')
    ) {
      return 'makanan_kecil'
    }
    return 'makanan_besar'
  }

  const filteredItems = searchQuery.trim()
    ? items.filter((item) => item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : items

  const itemsByCategory = filteredItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const customCat = getCustomCategory(item)
    ;(acc[customCat] ??= []).push(item)
    return acc
  }, {})

  const categoryOrder = ['makanan_besar', 'makanan_kecil', 'minuman']
  const categoryLabel: Record<string, string> = {
    makanan_besar: 'MAKANAN BESAR',
    makanan_kecil: 'MAKANAN KECIL',
    minuman: 'MINUMAN SEGAR',
  }

  // Color mappings for Category borders and hover effects
  const categoryColors: Record<
    string,
    { border: string; bg: string; text: string; hover: string }
  > = {
    makanan_besar: {
      border: 'border-t-amber-700',
      bg: 'bg-[#FCF6F0] hover:bg-[#F7EADF]',
      text: 'text-amber-800',
      hover: 'hover:border-amber-700/60',
    },
    makanan_kecil: {
      border: 'border-t-emerald-600',
      bg: 'bg-[#EBF7F2] hover:bg-[#D7EFE4]',
      text: 'text-emerald-800',
      hover: 'hover:border-emerald-600/60',
    },
    minuman: {
      border: 'border-t-sky-600',
      bg: 'bg-[#F2F8FC] hover:bg-[#E1EDF7]',
      text: 'text-sky-800',
      hover: 'hover:border-sky-600/60',
    },
  }

  // Kitchen Ticket (KOT) split calculations
  const getKOTItems = (type: 'makanan_besar' | 'makanan_kecil' | 'minuman') => {
    return cart.filter((c) => getCustomCategory(c.menuItem) === type)
  }

  // Split bill calculations
  const getSplitSubtotal = (cust: 'customer_a' | 'customer_b') => {
    return cart.reduce((sum, c) => {
      const assignment = splitAssignments[c.menuItem.id] || 'customer_a'
      if (assignment !== cust) return sum

      let price = c.menuItem.price_cents
      if (c.isComplimentary) price = 0
      else if (happyHourActive && c.menuItem.category === 'minuman')
        price = Math.round(c.menuItem.price_cents * 0.8)

      return sum + price * c.quantity
    }, 0)
  }

  if (loading) {
    return (
      <div className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest py-8 animate-pulse">
        Menyiapkan terminal kasir...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl relative">
      {error && (
        <div className="font-mono text-xs text-red-600 border border-red-600/20 bg-red-600/5 p-4 uppercase tracking-wider">
          KASIR_ERROR: {error}
        </div>
      )}
      {successMsg && (
        <div className="font-mono text-xs text-emerald-700 border border-emerald-600/20 bg-emerald-600/5 p-4 uppercase tracking-wider">
          KASIR_SUKSES: {successMsg}
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: Menu Items Grid (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Menu Search Bar */}
          <div className="flex items-center gap-2 border border-border bg-card px-4 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu makanan / minuman..."
              className="w-full bg-transparent font-mono text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/70"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="font-mono text-[9px] font-black uppercase text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Menu Catalog Header with Happy Hour Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card border border-border p-4 gap-3">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-black uppercase text-[#FF4F79] tracking-wider">
                KATALOG MENU
              </span>
              <span className="font-sans text-xs text-muted-foreground">
                Klik hidangan untuk menambah ke keranjang belanja kasir.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setHappyHourActive(!happyHourActive)}
              className={`flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                happyHourActive
                  ? 'bg-amber-500 border-amber-500 text-black animate-pulse'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${happyHourActive ? 'bg-black' : 'bg-muted-foreground'}`}
              />
              HAPPY HOUR {happyHourActive ? 'AKTIF (20% OFF MINUMAN)' : 'NONAKTIF'}
            </button>
          </div>

          {filteredItems.length === 0 && searchQuery.trim() && (
            <div className="border border-dashed border-border bg-card p-10 text-center">
              <p className="font-mono text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Tidak ada menu yang cocok dengan &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 font-mono text-[9px] font-black uppercase text-[#FF4F79] hover:underline cursor-pointer tracking-widest"
              >
                RESET PENCARIAN
              </button>
            </div>
          )}

          {categoryOrder.map((cat) => {
            const catItems = itemsByCategory[cat]
            const colors = categoryColors[cat] || {
              border: '',
              bg: '',
              text: 'text-stone-800',
              hover: '',
            }
            if (!catItems || catItems.length === 0) return null
            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-1">
                  <h3 className="font-mono text-[9px] font-black text-foreground uppercase tracking-widest">
                    {categoryLabel[cat]}
                  </h3>
                  <span
                    className={`font-mono text-[8px] px-2 py-0.5 border border-current font-bold uppercase tracking-wider ${colors.text} ${colors.bg}`}
                  >
                    {cat.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {catItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addToCart(item)}
                      className={`p-4 border border-border text-left transition-all duration-300 flex flex-col justify-between h-24 hover:scale-[1.01] hover:shadow-md cursor-pointer border-t-[3px] ${colors.border} ${colors.bg} ${colors.hover}`}
                    >
                      <div className="font-display font-semibold text-sm text-foreground uppercase tracking-wide leading-snug line-clamp-2">
                        {item.name}
                      </div>
                      <div className="font-mono text-[10px] font-black text-muted-foreground mt-2 tabular-nums flex items-center gap-2">
                        {happyHourActive && item.category === 'minuman' ? (
                          <>
                            <span className="line-through text-red-500 text-[9px] font-normal">
                              <MoneyDisplay cents={item.price_cents} />
                            </span>
                            <span className="text-amber-700 font-bold text-[11px]">
                              <MoneyDisplay cents={Math.round(item.price_cents * 0.8)} />
                            </span>
                          </>
                        ) : (
                          <MoneyDisplay cents={item.price_cents} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* COLUMN 2: Cart Summary & Operational Info (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Summary & Payment Card */}
          <div className="border border-border bg-[#FCF6F6] p-5 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                Ringkasan Pesanan
              </h3>
              <span className="font-mono text-[9px] px-2 py-0.5 bg-muted text-foreground border border-border font-bold uppercase tracking-wider tabular-nums">
                {cart.reduce((sum, c) => sum + c.quantity, 0)} item
              </span>
            </div>

            {/* Dine-in / Takeaway Toggle */}
            <div className="grid grid-cols-2 gap-2 border-b border-border/60 pb-4">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`py-2 font-mono text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                  orderType === 'dine_in'
                    ? 'bg-[#FF4F79] text-white border-[#FF4F79]'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                DINE IN (MAKAN SINI)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('takeaway')}
                className={`py-2 font-mono text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                  orderType === 'takeaway'
                    ? 'bg-[#FF4F79] text-white border-[#FF4F79]'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                TAKEAWAY (BUNGKUS)
              </button>
            </div>

            {/* Table Number Input for Dine In */}
            {orderType === 'dine_in' && (
              <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                <label
                  htmlFor="tableNumber"
                  className="font-mono text-[9px] font-black uppercase text-muted-foreground tracking-widest shrink-0"
                >
                  NOMOR MEJA:
                </label>
                <input
                  id="tableNumber"
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Contoh: Meja 5, Meja 12..."
                  className="w-full bg-background border border-border px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none focus:border-[#FF4F79]"
                />
              </div>
            )}

            {cart.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest py-16 text-center leading-relaxed">
                Keranjang masih kosong.
                <br />
                Pilih hidangan di kolom sebelah kiri.
              </p>
            ) : (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {cart.map((c) => (
                  <div
                    key={c.menuItem.id}
                    className={`flex items-center justify-between text-xs border-b border-border/40 pb-3 pt-2 px-2 transition-all duration-300 ${
                      c.confirmed
                        ? 'bg-emerald-500/10 border-l-[3px] border-l-emerald-500 pl-3'
                        : 'border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => toggleConfirm(c.menuItem.id)}
                          className={`w-4.5 h-4.5 border flex items-center justify-center transition-colors cursor-pointer text-[10px] font-bold rounded-none ${
                            c.confirmed
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : 'bg-background border-border text-transparent hover:border-foreground'
                          }`}
                        >
                          ✓
                        </button>
                        <div
                          className={`font-display font-semibold truncate uppercase tracking-wide text-xs ${c.confirmed ? 'text-emerald-700 font-bold' : 'text-foreground'}`}
                        >
                          {c.menuItem.name}
                        </div>

                        {/* Complimentary Badge Trigger */}
                        <button
                          type="button"
                          onClick={() => toggleComplimentary(c.menuItem.id)}
                          className={`font-mono text-[8px] font-black uppercase px-1 py-0.2 rounded border transition-all shrink-0 cursor-pointer ${
                            c.isComplimentary
                              ? 'bg-rose-500 text-white border-rose-600'
                              : 'bg-transparent text-muted-foreground border-border hover:border-rose-500 hover:text-rose-500'
                          }`}
                        >
                          {c.isComplimentary ? 'KOMPLIMEN' : 'NORMAL'}
                        </button>
                      </div>
                      <div className="font-mono text-[9px] text-muted-foreground mt-1 pl-6.5 tabular-nums flex items-center gap-2 flex-wrap">
                        {c.isComplimentary ? (
                          <span className="text-rose-600 font-bold">Rp 0 (Complimentary)</span>
                        ) : happyHourActive && c.menuItem.category === 'minuman' ? (
                          <>
                            <span className="line-through text-red-500">
                              <MoneyDisplay cents={c.menuItem.price_cents} />
                            </span>
                            <span className="text-amber-700 font-bold">
                              <MoneyDisplay cents={Math.round(c.menuItem.price_cents * 0.8)} />
                            </span>
                          </>
                        ) : (
                          <MoneyDisplay cents={c.menuItem.price_cents} />
                        )}
                        <span>&times; {c.quantity}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <button
                        type="button"
                        onClick={() => updateQty(c.menuItem.id, c.quantity - 1)}
                        className="w-8 h-8 border border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center font-bold cursor-pointer"
                      >
                        &minus;
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">
                        {c.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(c.menuItem.id, c.quantity + 1)}
                        className="w-8 h-8 border border-border bg-background text-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KOT & Split Bill Buttons */}
            {cart.length > 0 && (
              <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setKotPreviewOpen(true)}
                  className="flex items-center justify-center gap-1.5 border border-border bg-card p-2 font-mono text-[9px] font-black uppercase text-foreground hover:bg-foreground hover:text-background transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> PREVIEW STRUK DAPUR
                </button>
                <button
                  type="button"
                  onClick={() => setSplitBillOpen(true)}
                  className="flex items-center justify-center gap-1.5 border border-border bg-card p-2 font-mono text-[9px] font-black uppercase text-foreground hover:bg-foreground hover:text-background transition-all cursor-pointer"
                >
                  <Split className="w-3.5 h-3.5" /> SIMULASI SPLIT BILL
                </button>
              </div>
            )}

            {/* Checkout Calculations */}
            <div className="border-t-[3px] border-double border-foreground pt-4 space-y-3 font-mono text-xs">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground uppercase font-bold">SUBTOTAL</span>
                <span className="font-bold text-foreground tabular-nums">
                  <MoneyDisplay cents={subtotalCents} />
                </span>
              </div>

              {/* Packaging Fee (Takeaway only) */}
              {orderType === 'takeaway' && (
                <div className="flex justify-between items-center text-[10px] text-emerald-700">
                  <span className="uppercase font-bold">BIAYA KEMASAN (TAKEAWAY)</span>
                  <span className="font-bold tabular-nums">
                    <MoneyDisplay cents={packagingFeeCents} />
                  </span>
                </div>
              )}

              {/* Tax PB1 10% */}
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-1.5">
                  <input
                    id="taxEnabled"
                    type="checkbox"
                    checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#FF4F79] cursor-pointer"
                  />
                  <label
                    htmlFor="taxEnabled"
                    className="text-muted-foreground uppercase font-bold cursor-pointer select-none"
                  >
                    PAJAK PB1 (10%)
                  </label>
                </div>
                <span className="font-bold text-foreground tabular-nums">
                  <MoneyDisplay cents={taxCents} />
                </span>
              </div>

              {/* Service Charge 5% */}
              <div className="flex justify-between items-center text-[10px] border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <input
                    id="serviceEnabled"
                    type="checkbox"
                    checked={serviceEnabled}
                    onChange={(e) => setServiceEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#FF4F79] cursor-pointer"
                  />
                  <label
                    htmlFor="serviceEnabled"
                    className="text-muted-foreground uppercase font-bold cursor-pointer select-none"
                  >
                    SERVICE CHARGE (5%)
                  </label>
                </div>
                <span className="font-bold text-foreground tabular-nums">
                  <MoneyDisplay cents={serviceChargeCents} />
                </span>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-muted-foreground font-black text-sm uppercase">
                  TOTAL AKHIR
                </span>
                <span className="font-display font-semibold text-xl text-foreground tabular-nums">
                  <MoneyDisplay cents={totalCents} />
                </span>
              </div>

              {/* Customer Phone */}
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <label htmlFor="customerPhone" className="text-muted-foreground font-bold">
                  MEMBER (NO HP)
                </label>
                <input
                  id="customerPhone"
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-36 px-3 py-2 border border-border bg-background font-mono text-xs text-foreground text-right focus:outline-none focus:border-foreground"
                  placeholder="0812..."
                />
              </div>

              {/* Paid Cash Input */}
              <div className="flex items-center justify-between">
                <label htmlFor="paidInput" className="text-muted-foreground font-bold">
                  UANG TUNAI (RP)
                </label>
                <input
                  id="paidInput"
                  type="text"
                  value={paidInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setPaidInput(val ? parseInt(val, 10).toLocaleString('id-ID') : '')
                    const num = parseInt(val, 10)
                    setPaidCents(isNaN(num) ? 0 : num * 100)
                  }}
                  className="w-36 px-3 py-2 border border-border bg-background font-mono text-xs text-foreground text-right focus:outline-none focus:border-foreground font-bold"
                  placeholder="0"
                />
              </div>

              {paidCents > 0 && (
                <div className="flex justify-between items-baseline border-t border-border/60 pt-3">
                  <span className="text-muted-foreground font-bold">UANG KEMBALIAN</span>
                  <span
                    className={`font-bold tabular-nums text-sm ${changeCents >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
                  >
                    <MoneyDisplay cents={Math.max(0, changeCents)} />
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full border border-foreground bg-foreground text-background font-mono text-[10px] font-bold py-3.5 uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'MEMPROSES TRANSAKSI...' : 'CATAT TRANSAKSI KASIR'}
            </button>
          </div>

          {/* Cashier Info Widgets Row 1 (Shift Stats & Kitchen Alert) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shift Stats Card */}
            <div className="border border-border bg-[#FFF3F5] p-5 space-y-4 font-sans">
              <div className="border-b border-border pb-2.5 flex justify-between items-center">
                <div>
                  <span className="font-mono text-[8px] font-black text-[#FF4F79] uppercase tracking-[0.2em] block">
                    TERMINAL SHIFT
                  </span>
                  <h4 className="font-display font-semibold text-xs text-foreground uppercase tracking-tight mt-0.5">
                    Informasi Sesi
                  </h4>
                </div>
                <User className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between font-sans">
                  <span className="text-muted-foreground">Kasir Aktif</span>
                  <span className="font-semibold text-foreground">{cashierName}</span>
                </div>
                <div className="flex justify-between font-sans">
                  <span className="text-muted-foreground">Peran</span>
                  <span className="font-mono text-[10px] font-black text-[#FF4F79] uppercase">
                    {getDisplayRole(cashierName, cashierRole)}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-muted-foreground">Mulai Shift</span>
                  <span className="font-bold flex items-center gap-1 text-foreground">
                    <Clock className="w-3 h-3 text-muted-foreground" /> {shiftStart}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px] pt-1.5 border-t border-border/40">
                  <span className="text-muted-foreground">Trans. Shift</span>
                  <span className="font-bold flex items-center gap-1 text-foreground">
                    <TrendingUp className="w-3 h-3 text-emerald-600" /> 18 Tx
                  </span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-muted-foreground">Omzet Shift</span>
                  <span className="font-bold flex items-center gap-1 text-foreground">
                    <Coins className="w-3 h-3 text-emerald-600" /> Rp 1.250.000
                  </span>
                </div>
              </div>
            </div>

            {/* Kitchen Stock Alerts Card */}
            <div className="border border-border bg-red-600/5 border-red-600/20 p-5 space-y-3.5 font-sans">
              <div className="border-b border-red-600/10 pb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h4 className="font-display font-semibold text-xs text-red-950 uppercase tracking-tight">
                  Peringatan Stok Dapur
                </h4>
              </div>

              <div className="space-y-2 font-mono text-[10px] font-bold">
                <div className="flex justify-between items-center bg-red-600/10 text-red-800 px-2 py-1">
                  <span>BABI HUTAN MENTAH</span>
                  <span className="px-1 py-0.5 bg-red-600 text-white text-[8px]">KRITIS</span>
                </div>
                <div className="flex justify-between items-center bg-amber-500/10 text-amber-800 px-2 py-1">
                  <span>LABI-LABI MENTAH</span>
                  <span className="px-1 py-0.5 bg-amber-500 text-white text-[8px]">SISA 2</span>
                </div>
                <div className="flex justify-between items-center text-emerald-800 px-2 py-1">
                  <span>LAINNYA (DAGING ASAP / ES)</span>
                  <span className="text-[8px] uppercase">AMAN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cashier Info Widgets Row 2 (SOP & Promo Active) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SOP Card */}
            <div className="border border-border bg-card p-5 space-y-3.5 font-sans">
              <div className="border-b border-border pb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF4F79]" />
                <h4 className="font-display font-semibold text-xs text-foreground uppercase tracking-tight">
                  SOP Kasir Semayot
                </h4>
              </div>

              <ul className="space-y-2 text-[11px] leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF4F79] font-bold">&middot;</span>
                  <span>Tawarkan program loyalty member dengan menanyakan No. HP pelanggan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF4F79] font-bold">&middot;</span>
                  <span>
                    Gunakan fitur centang{' '}
                    <span className="text-emerald-700 font-bold">✓ Confirmed</span> setelah membaca
                    ulang pesanan ke pelanggan.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF4F79] font-bold">&middot;</span>
                  <span>Hitung dan sebutkan nominal kembalian tunai secara jelas dan terbuka.</span>
                </li>
              </ul>
            </div>

            {/* Active Promo Announcements */}
            <div className="border border-border bg-amber-500/5 border-amber-600/20 p-5 space-y-3.5 font-sans">
              <div className="border-b border-amber-600/10 pb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                <h4 className="font-display font-semibold text-xs text-amber-900 uppercase tracking-tight">
                  Promo Aktif Hari Ini
                </h4>
              </div>

              <ul className="space-y-2.5 text-[11px] text-amber-800 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Jumat Berkah:</strong> Free Es Teh Manis khusus member tier Gold/Silver.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Diskon 10% khusus menu <strong>Paket Makan di Tempat (Asap)</strong>.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* --- KOT (KITCHEN ORDER TICKET) PREVIEW MODAL --- */}
      {kotPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-foreground max-w-md w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto font-mono text-xs text-stone-900 shadow-2xl rounded-none">
            <div className="border-b-2 border-dashed border-stone-400 pb-4 text-center">
              <span className="text-[10px] font-black uppercase text-[#FF4F79] tracking-widest">
                PREVIEW STRUK DAPUR (KOT)
              </span>
              <h2 className="font-display font-black text-base mt-1 text-stone-950 uppercase tracking-tight">
                RM BUMI AMAS SEMAYOT
              </h2>
              <div className="text-[9px] text-stone-500 mt-2 space-y-0.5">
                <div>
                  WAKTU: {new Date().toLocaleDateString('id-ID')} -{' '}
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="font-bold">
                  LAYANAN:{' '}
                  {orderType === 'dine_in'
                    ? `DINE-IN (${tableNumber || 'TANPA MEJA'})`
                    : 'TAKEAWAY (BUNGKUS)'}
                </div>
                <div>KASIR: {cashierName.toUpperCase()}</div>
              </div>
            </div>

            {/* Department Split Tickets */}
            <div className="space-y-6">
              {/* 1. Dapur Utama (Makanan Besar) */}
              {getKOTItems('makanan_besar').length > 0 && (
                <div className="border border-amber-900/20 bg-amber-500/5 p-3 space-y-2">
                  <div className="flex justify-between border-b border-amber-900/20 pb-1 font-black text-[9px] text-amber-900 uppercase tracking-wider">
                    <span>[TICKET-A] DAPUR UTAMA</span>
                    <span>MAKANAN BESAR</span>
                  </div>
                  <div className="space-y-1.5 font-bold">
                    {getKOTItems('makanan_besar').map((c) => (
                      <div key={c.menuItem.id} className="flex justify-between items-baseline">
                        <span>
                          {c.menuItem.name} {c.isComplimentary && '[VIP/COMP]'}
                        </span>
                        <span>QTY: {c.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Dapur Cemilan (Makanan Kecil) */}
              {getKOTItems('makanan_kecil').length > 0 && (
                <div className="border border-emerald-900/20 bg-emerald-500/5 p-3 space-y-2">
                  <div className="flex justify-between border-b border-emerald-900/20 pb-1 font-black text-[9px] text-emerald-900 uppercase tracking-wider">
                    <span>[TICKET-B] DAPUR CEMILAN</span>
                    <span>MAKANAN KECIL / MENTAH</span>
                  </div>
                  <div className="space-y-1.5 font-bold">
                    {getKOTItems('makanan_kecil').map((c) => (
                      <div key={c.menuItem.id} className="flex justify-between items-baseline">
                        <span>
                          {c.menuItem.name} {c.isComplimentary && '[VIP/COMP]'}
                        </span>
                        <span>QTY: {c.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Bar Minuman (Minuman Segar) */}
              {getKOTItems('minuman').length > 0 && (
                <div className="border border-sky-900/20 bg-sky-500/5 p-3 space-y-2">
                  <div className="flex justify-between border-b border-sky-900/20 pb-1 font-black text-[9px] text-sky-900 uppercase tracking-wider">
                    <span>[TICKET-C] BAR MINUMAN</span>
                    <span>MINUMAN SEGAR</span>
                  </div>
                  <div className="space-y-1.5 font-bold">
                    {getKOTItems('minuman').map((c) => (
                      <div key={c.menuItem.id} className="flex justify-between items-baseline">
                        <span>
                          {c.menuItem.name} {c.isComplimentary && '[VIP/COMP]'}
                        </span>
                        <span>QTY: {c.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-stone-300 pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setKotPreviewOpen(false)}
                className="flex-1 border border-stone-400 bg-transparent py-2.5 font-bold text-center hover:bg-stone-100 transition-all cursor-pointer uppercase text-[10px]"
              >
                TUTUP PREVIEW
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Instruksi cetak dikirim ke printer masing-masing area dapur!')
                  setKotPreviewOpen(false)
                }}
                className="flex-1 border border-foreground bg-foreground text-background py-2.5 font-black text-center hover:bg-stone-800 transition-all cursor-pointer uppercase text-[10px]"
              >
                CETAK STRUK DAPUR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SPLIT BILL SIMULATOR MODAL --- */}
      {splitBillOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl rounded-none">
            <div className="border-b border-border pb-3 text-center sm:text-left">
              <span className="font-mono text-[9px] font-black uppercase text-[#FF4F79] tracking-widest">
                SIMULATOR PEMBAGIAN TAGIHAN
              </span>
              <h2 className="font-display font-bold text-base mt-1 text-foreground uppercase tracking-tight">
                Pemisahan Struk Pembayaran (Split Bill)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Tentukan pembagian tagihan item belanjaan untuk Meja {tableNumber || '(Umum)'}.
              </p>
            </div>

            {/* Split Allocations List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {cart.map((c) => {
                const assignedTo = splitAssignments[c.menuItem.id] || 'customer_a'
                return (
                  <div
                    key={c.menuItem.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-muted/30 border border-border/40 gap-3"
                  >
                    <div className="font-sans text-xs">
                      <div className="font-bold uppercase text-foreground leading-snug">
                        {c.menuItem.name}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        <MoneyDisplay
                          cents={
                            c.isComplimentary
                              ? 0
                              : happyHourActive && c.menuItem.category === 'minuman'
                                ? Math.round(c.menuItem.price_cents * 0.8)
                                : c.menuItem.price_cents
                          }
                        />{' '}
                        &times; {c.quantity}
                      </div>
                    </div>

                    {/* Toggle Customer Selection */}
                    <div className="flex gap-1 font-mono text-[9px] font-black shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() =>
                          setSplitAssignments((prev) => ({
                            ...prev,
                            [c.menuItem.id]: 'customer_a',
                          }))
                        }
                        className={`flex-1 sm:flex-none px-3 py-1.5 border transition-all cursor-pointer ${
                          assignedTo === 'customer_a'
                            ? 'bg-[#FF4F79] text-white border-[#FF4F79]'
                            : 'bg-card border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        PELANGGAN A
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSplitAssignments((prev) => ({
                            ...prev,
                            [c.menuItem.id]: 'customer_b',
                          }))
                        }
                        className={`flex-1 sm:flex-none px-3 py-1.5 border transition-all cursor-pointer ${
                          assignedTo === 'customer_b'
                            ? 'bg-[#FF4F79] text-white border-[#FF4F79]'
                            : 'bg-card border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        PELANGGAN B
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Split Price Summary Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4 font-mono text-xs">
              {/* Customer A Column */}
              <div className="border border-border p-4 bg-muted/10 space-y-2.5">
                <span className="font-black text-[9px] text-[#FF4F79] uppercase block border-b border-border pb-1">
                  STRUK PELANGGAN A
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold">
                      <MoneyDisplay cents={getSplitSubtotal('customer_a')} />
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>PB1 Tax (10%):</span>
                    <span>
                      <MoneyDisplay
                        cents={taxEnabled ? Math.round(getSplitSubtotal('customer_a') * 0.1) : 0}
                      />
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service (5%):</span>
                    <span>
                      <MoneyDisplay
                        cents={
                          serviceEnabled ? Math.round(getSplitSubtotal('customer_a') * 0.05) : 0
                        }
                      />
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Kemasan (50%):</span>
                    <span>
                      <MoneyDisplay cents={orderType === 'takeaway' ? 100000 : 0} />
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 font-bold text-foreground text-xs">
                    <span>TOTAL A:</span>
                    <span>
                      <MoneyDisplay
                        cents={
                          getSplitSubtotal('customer_a') +
                          (taxEnabled ? Math.round(getSplitSubtotal('customer_a') * 0.1) : 0) +
                          (serviceEnabled ? Math.round(getSplitSubtotal('customer_a') * 0.05) : 0) +
                          (orderType === 'takeaway' ? 100000 : 0)
                        }
                      />
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer B Column */}
              <div className="border border-border p-4 bg-muted/10 space-y-2.5">
                <span className="font-black text-[9px] text-[#FF4F79] uppercase block border-b border-border pb-1">
                  STRUK PELANGGAN B
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold">
                      <MoneyDisplay cents={getSplitSubtotal('customer_b')} />
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>PB1 Tax (10%):</span>
                    <span>
                      <MoneyDisplay
                        cents={taxEnabled ? Math.round(getSplitSubtotal('customer_b') * 0.1) : 0}
                      />
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service (5%):</span>
                    <span>
                      <MoneyDisplay
                        cents={
                          serviceEnabled ? Math.round(getSplitSubtotal('customer_b') * 0.05) : 0
                        }
                      />
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Kemasan (50%):</span>
                    <span>
                      <MoneyDisplay cents={orderType === 'takeaway' ? 100000 : 0} />
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2 font-bold text-foreground text-xs">
                    <span>TOTAL B:</span>
                    <span>
                      <MoneyDisplay
                        cents={
                          getSplitSubtotal('customer_b') +
                          (taxEnabled ? Math.round(getSplitSubtotal('customer_b') * 0.1) : 0) +
                          (serviceEnabled ? Math.round(getSplitSubtotal('customer_b') * 0.05) : 0) +
                          (orderType === 'takeaway' ? 100000 : 0)
                        }
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSplitBillOpen(false)}
                className="border border-foreground bg-foreground text-background px-6 py-2.5 font-mono text-[9px] font-black uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all cursor-pointer"
              >
                TUTUP SIMULATOR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
