'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { ExpensesView } from './ExpensesView'

import { semayotBusinessInfo } from '@/lib/semayot/business-info'

type Tab = 'bisnis' | 'staff' | 'pengeluaran' | 'promo'

type Staff = {
  id: string
  full_name: string
  role: 'owner' | 'staff'
  is_active: boolean
  created_at: string
}

type Promo = {
  id: string
  name: string
  discount_pct: number
  is_active: boolean
  description: string
}

export function SettingsView() {
  const pathname = usePathname()
  const [tab, setTab] = useState<Tab>('bisnis')
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviting, setInviting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // --- NEW F&B PROMOS STATE ---
  const [promos, setPromos] = useState<Promo[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('semayot_promos')
      if (saved) return JSON.parse(saved)
    }
    return [
      {
        id: '1',
        name: 'Jumat Berkah',
        discount_pct: 20,
        is_active: true,
        description: 'Free Es Teh Manis khusus member tier Gold/Silver.',
      },
      {
        id: '2',
        name: 'Diskon Paket Asap',
        discount_pct: 10,
        is_active: true,
        description: 'Diskon khusus menu Paket Makan di Tempat (Asap).',
      },
      {
        id: '3',
        name: 'Promo Dayak Sore',
        discount_pct: 15,
        is_active: false,
        description: 'Diskon menu Dayak Tradisional jam 14.00 - 16.00.',
      },
    ]
  })

  const [newPromoName, setNewPromoName] = useState('')
  const [newPromoDiscount, setNewPromoDiscount] = useState('')
  const [newPromoDesc, setNewPromoDesc] = useState('')

  // Save promos to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('semayot_promos', JSON.stringify(promos))
  }, [promos])

  const biz = semayotBusinessInfo
  const [bizName, setBizName] = useState(() => biz.name)
  const [bizCategory, setBizCategory] = useState(() => biz.category)
  const [bizAddress, setBizAddress] = useState(() => biz.address)
  const [bizArea, setBizArea] = useState(() => biz.area)
  const [bizProvince, setBizProvince] = useState(() => biz.province)
  const [bizLandmark, setBizLandmark] = useState(() => biz.landmark)
  const [bizPhone, setBizPhone] = useState(() => biz.phone)
  const [bizWhatsapp, setBizWhatsapp] = useState(() => biz.whatsapp || '')
  const [bizMapsUrl, setBizMapsUrl] = useState(() => biz.googleMapsUrl)
  const [bizHoursStatus, setBizHoursStatus] = useState(() => biz.openingHoursStatus)
  const [bizClosingTime, setBizClosingTime] = useState(() => biz.closingTime)

  const saveBusinessInfo = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = {
      ...biz,
      name: bizName,
      category: bizCategory,
      address: bizAddress,
      area: bizArea,
      province: bizProvince,
      landmark: bizLandmark,
      phone: bizPhone,
      whatsapp: bizWhatsapp || null,
      googleMapsUrl: bizMapsUrl,
      openingHoursStatus: bizHoursStatus,
      closingTime: bizClosingTime,
    }
    localStorage.setItem('semayot_business_info', JSON.stringify(updated))
    setSuccessMsg('Informasi Operasional Bisnis berhasil diperbarui!')
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const loadStaff = async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/admin/staff')
      const j = await r.json()
      if (r.ok) setStaff(j.data ?? [])
      else setError(j.error?.message ?? 'Gagal memuat staff.')
    } catch (e: unknown) {
      console.error(e)
      const errMsg = e instanceof Error ? e.message : 'Koneksi jaringan terputus.'
      setError(e instanceof SyntaxError ? 'Respons server tidak valid (500).' : errMsg)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (tab === 'staff') {
      loadStaff()
    }
  }, [tab, pathname])

  const invite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const r = await fetch('/api/admin/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, full_name: inviteName }),
      })
      const j = await r.json()
      if (r.ok) {
        setSuccessMsg(`Undangan terkirim ke ${inviteEmail}.`)
        setInviteEmail('')
        setInviteName('')
        await loadStaff()
      } else {
        setError(j.error?.message ?? 'Gagal mengundang.')
      }
    } catch (e: unknown) {
      console.error(e)
      const errMsg = e instanceof Error ? e.message : 'Koneksi jaringan gagal.'
      setError(e instanceof SyntaxError ? 'Respons server tidak valid (500).' : errMsg)
    }
    setInviting(false)
  }

  const deactivate = async (id: string, name: string) => {
    if (!confirm(`Nonaktifkan staff "${name}"?`)) return
    const r = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' })
    if (r.ok) await loadStaff()
    else setError('Gagal menonaktifkan.')
  }

  const togglePromo = (id: string) => {
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p)))
  }

  const deletePromo = (id: string) => {
    if (!confirm('Hapus program promo ini?')) return
    setPromos((prev) => prev.filter((p) => p.id !== id))
  }

  const addPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPromoName || !newPromoDiscount) return
    const pct = parseInt(newPromoDiscount, 10)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      alert('Persentase diskon harus bernilai antara 0 s.d. 100.')
      return
    }
    const newPromo: Promo = {
      id: Date.now().toString(),
      name: newPromoName,
      discount_pct: pct,
      is_active: true,
      description: newPromoDesc,
    }
    setPromos((prev) => [...prev, newPromo])
    setNewPromoName('')
    setNewPromoDiscount('')
    setNewPromoDesc('')
    setSuccessMsg(`Promo "${newPromoName}" berhasil ditambahkan!`)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  return (
    <div className="animate-fade-in max-w-4xl relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-11 space-y-8">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border">
            <div className="flex border-b border-transparent overflow-x-auto w-full sm:w-auto">
              {(['bisnis', 'staff', 'pengeluaran', 'promo'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 sm:px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 -mb-[2px] whitespace-nowrap cursor-pointer ${
                    tab === t
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'bisnis'
                    ? 'Info Bisnis'
                    : t === 'staff'
                      ? 'Staf/Pengguna'
                      : t === 'pengeluaran'
                        ? 'Pengeluaran'
                        : 'Manajemen Promo'}
                </button>
              ))}
            </div>
            <span className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-widest pb-3 hidden sm:inline">
              KODE_MODUL: SETTINGS
            </span>
          </div>

          {error && (
            <div className="font-mono text-xs text-red-600 border border-red-600/20 bg-red-600/5 p-4 uppercase tracking-wider">
              SYSTEM_ERROR: {error}
            </div>
          )}
          {successMsg && (
            <div className="font-mono text-xs text-emerald-700 border border-emerald-600/20 bg-emerald-600/5 p-4 uppercase tracking-wider">
              PROSES_OK: {successMsg}
            </div>
          )}

          {tab === 'bisnis' && (
            <form
              onSubmit={saveBusinessInfo}
              className="border border-border bg-card p-6 space-y-6"
            >
              <div className="border-b border-border pb-4">
                <h3 className="font-display text-base font-semibold text-foreground uppercase tracking-wider">
                  Ubah Informasi Operasional Bisnis
                </h3>
                <p className="font-mono text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                  Data disimpan secara persisten di penyimpanan browser lokal (localStorage).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label
                    htmlFor="bizNameInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Nama Restoran
                  </label>
                  <input
                    id="bizNameInput"
                    type="text"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="bizCategoryInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Kategori Kuliner
                  </label>
                  <input
                    id="bizCategoryInput"
                    type="text"
                    value={bizCategory}
                    onChange={(e) => setBizCategory(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label
                    htmlFor="bizAddressInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Alamat Fisik Lengkap
                  </label>
                  <textarea
                    id="bizAddressInput"
                    rows={2}
                    value={bizAddress}
                    onChange={(e) => setBizAddress(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="bizAreaInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Area / Distrik
                  </label>
                  <input
                    id="bizAreaInput"
                    type="text"
                    value={bizArea}
                    onChange={(e) => setBizArea(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="bizProvinceInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Provinsi
                  </label>
                  <input
                    id="bizProvinceInput"
                    type="text"
                    value={bizProvince}
                    onChange={(e) => setBizProvince(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label
                    htmlFor="bizLandmarkInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Landmark Lokasi (Seed Clue)
                  </label>
                  <input
                    id="bizLandmarkInput"
                    type="text"
                    value={bizLandmark}
                    onChange={(e) => setBizLandmark(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="bizPhoneInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Nomor Telepon
                  </label>
                  <input
                    id="bizPhoneInput"
                    type="text"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="bizWhatsappInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    WhatsApp Bisnis (Bisa Kosong)
                  </label>
                  <input
                    id="bizWhatsappInput"
                    type="text"
                    value={bizWhatsapp}
                    onChange={(e) => setBizWhatsapp(e.target.value)}
                    placeholder="—"
                    className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label
                    htmlFor="bizMapsUrlInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Google Maps Link
                  </label>
                  <input
                    id="bizMapsUrlInput"
                    type="text"
                    value={bizMapsUrl}
                    onChange={(e) => setBizMapsUrl(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border bg-background font-mono text-[10px] text-muted-foreground break-all focus:outline-none focus:border-foreground focus:text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="bizHoursStatusInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Jadwal Buka (Status)
                  </label>
                  <input
                    id="bizHoursStatusInput"
                    type="text"
                    value={bizHoursStatus}
                    onChange={(e) => setBizHoursStatus(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="bizClosingTimeInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Waktu Tutup
                  </label>
                  <input
                    id="bizClosingTimeInput"
                    type="text"
                    value={bizClosingTime}
                    onChange={(e) => setBizClosingTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  className="border border-foreground bg-foreground text-background font-mono text-[10px] font-bold px-8 py-3.5 uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 cursor-pointer"
                >
                  SIMPAN INFORMASI BISNIS
                </button>
              </div>
            </form>
          )}

          {tab === 'staff' && (
            <div className="space-y-6">
              {/* Invite Form */}
              <form onSubmit={invite} className="border border-border bg-card p-6 space-y-4">
                <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                  Undang Staf Baru
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="inviteEmailInput"
                      className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                    >
                      Email Undangan
                    </label>
                    <input
                      id="inviteEmailInput"
                      type="email"
                      placeholder="staf@semayot.id"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="inviteNameInput"
                      className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                    >
                      Nama Lengkap
                    </label>
                    <input
                      id="inviteNameInput"
                      type="text"
                      placeholder="Nama Staf"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={inviting}
                  className="border border-foreground bg-foreground text-background font-mono text-[10px] font-bold px-6 py-3 uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {inviting ? 'Mengirim Undangan...' : 'Kirim Undangan'}
                </button>
              </form>

              {/* Staff List Table */}
              <div className="space-y-3">
                <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                  Daftar Staf Aktif
                </h3>

                {loading ? (
                  <div className="font-mono text-[10px] text-muted-foreground font-bold uppercase tracking-widest py-4 animate-pulse">
                    Menyinkronkan daftar pengguna...
                  </div>
                ) : staff.length === 0 ? (
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider py-8 text-center border border-border bg-card">
                    Belum ada staf terdaftar.
                  </p>
                ) : (
                  <div className="border border-border overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-card border-b border-border">
                          <th className="text-left font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                            Nama Staf
                          </th>
                          <th className="text-left font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest">
                            Akses Peran
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
                        {staff.map((s) => (
                          <tr
                            key={s.id}
                            className="border-b border-border/60 hover:bg-card/30 transition-colors"
                          >
                            <td className="py-4 px-4 font-display font-medium text-foreground">
                              {s.full_name}
                            </td>
                            <td className="py-4 px-4 font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              {s.role}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span
                                className={`inline-block font-mono text-[8px] font-bold px-2 py-1 border uppercase tracking-wider ${
                                  s.is_active
                                    ? 'border-emerald-600/30 text-emerald-700 bg-emerald-500/5'
                                    : 'border-border text-muted-foreground bg-background/50'
                                }`}
                              >
                                {s.is_active ? 'AKTIF' : 'NON-AKTIF'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {s.is_active && (
                                <button
                                  onClick={() => deactivate(s.id, s.full_name)}
                                  className="font-mono text-[9px] font-bold text-red-600 hover:text-red-800 uppercase tracking-widest cursor-pointer"
                                >
                                  NONAKTIFKAN
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'pengeluaran' && <ExpensesView />}

          {tab === 'promo' && (
            <div className="space-y-6 animate-fade-in">
              {/* Form Tambah Promo */}
              <form onSubmit={addPromo} className="border border-border bg-card p-6 space-y-4">
                <div className="border-b border-border pb-2.5">
                  <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                    Tambah Program Promo & Diskon Baru
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono text-[10px]">
                    Modul Pengaturan Promosi Rumah Makan Semayot (Akses Terbatas: Owner)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label
                      htmlFor="promoNameInput"
                      className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                    >
                      Nama Program Promo
                    </label>
                    <input
                      id="promoNameInput"
                      type="text"
                      placeholder="Contoh: Promo Weekend, Jumat Berkah..."
                      value={newPromoName}
                      onChange={(e) => setNewPromoName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="promoDiscountInput"
                      className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                    >
                      Diskon (%)
                    </label>
                    <input
                      id="promoDiscountInput"
                      type="number"
                      placeholder="10, 15, 20..."
                      value={newPromoDiscount}
                      onChange={(e) => setNewPromoDiscount(e.target.value)}
                      required
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:border-foreground font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="promoDescInput"
                    className="font-mono text-[8px] font-bold text-muted-foreground uppercase tracking-wider block"
                  >
                    Deskripsi & Syarat Ketentuan Promo
                  </label>
                  <textarea
                    id="promoDescInput"
                    placeholder="Contoh: Diskon 10% khusus menu Paket Makan di Tempat (Asap) dengan minimum pembelian..."
                    value={newPromoDesc}
                    onChange={(e) => setNewPromoDesc(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <button
                  type="submit"
                  className="border border-foreground bg-foreground text-background font-mono text-[10px] font-bold px-6 py-3 uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 cursor-pointer"
                >
                  TAMBAH PROMO BARU
                </button>
              </form>

              {/* Daftar Program Promo */}
              <div className="space-y-3">
                <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                  Program Promo Aktif & Tersimpan
                </h3>

                {promos.length === 0 ? (
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider py-8 text-center border border-border bg-card">
                    Belum ada program promo tersimpan.
                  </p>
                ) : (
                  <div className="border border-border overflow-hidden bg-card">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="text-left font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest w-[40%]">
                            Nama Promo & Ketentuan
                          </th>
                          <th className="text-center font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest w-[20%]">
                            Diskon
                          </th>
                          <th className="text-center font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest w-[20%]">
                            Status
                          </th>
                          <th className="text-right font-mono text-[9px] uppercase text-muted-foreground py-4 px-4 font-bold tracking-widest w-[20%]">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {promos.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-border/60 hover:bg-muted/10 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="font-display font-medium text-foreground text-xs uppercase font-bold">
                                {p.name}
                              </div>
                              <div className="font-sans text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                {p.description}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-xs font-bold text-foreground">
                              {p.discount_pct}% OFF
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => togglePromo(p.id)}
                                className={`inline-block font-mono text-[8px] font-bold px-2.5 py-1 border uppercase tracking-wider transition-all cursor-pointer ${
                                  p.is_active
                                    ? 'border-emerald-600/30 text-emerald-700 bg-emerald-500/5 hover:bg-emerald-500/10'
                                    : 'border-border text-muted-foreground bg-background/50 hover:bg-muted/20'
                                }`}
                              >
                                {p.is_active ? 'AKTIF' : 'NON-AKTIF'}
                              </button>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => deletePromo(p.id)}
                                className="font-mono text-[9px] font-bold text-red-600 hover:text-red-800 uppercase tracking-widest cursor-pointer"
                              >
                                HAPUS
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Vertical Branding */}
        <div className="hidden md:flex md:col-span-1 justify-center pt-16 select-none opacity-20 hover:opacity-40 transition-opacity duration-300">
          <div className="font-mono text-[9px] font-black uppercase tracking-[0.3em] branding-vertical text-center whitespace-nowrap">
            PENGATURAN KONSOL SEMAYOT
          </div>
        </div>
      </div>
    </div>
  )
}
