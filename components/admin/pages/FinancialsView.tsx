'use client'

import { FileText, Download, Calendar, Search } from 'lucide-react'
import React, { useState } from 'react'
import useSWR from 'swr'

import { MoneyDisplay } from '@/components/admin/MoneyDisplay'
import { formatDateRangeID, getDateParts } from '@/lib/admin/format/date'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const BUSINESS_TIMEZONE = 'Asia/Jakarta'

function getToday(): string {
  return getDateParts({ timeZone: BUSINESS_TIMEZONE }).isoDate
}

function getOneMonthAgo(today: string): string {
  const [y, m, d] = today.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCMonth(date.getUTCMonth() - 1)
  return date.toISOString().slice(0, 10)
}

export function FinancialsView() {
  const today = getToday()
  const [startDate, setStartDate] = useState<string>(() => getOneMonthAgo(today))
  const [endDate, setEndDate] = useState<string>(today)
  // Submitted range (drives the fetch). Decoupled from input so user can type freely.
  const [appliedRange, setAppliedRange] = useState<{ start: string; end: string } | null>(null)

  const query = appliedRange
    ? `/api/admin/financials?startDate=${appliedRange.start}&endDate=${appliedRange.end}`
    : '/api/admin/financials'
  const { data, isLoading } = useSWR(query, fetcher, { suspense: true })

  const pnl = data?.data || {
    revenue: 0,
    cogs: 0,
    gross_profit: 0,
    opex: 0,
    net_profit: 0,
  }

  const displayStart = appliedRange?.start ?? startDate
  const displayEnd = appliedRange?.end ?? endDate
  const periodLabel = formatDateRangeID(displayStart, displayEnd)

  const handleApply = () => {
    if (!startDate || !endDate) return
    if (startDate > endDate) return
    setAppliedRange({ start: startDate, end: endDate })
  }

  const handleReset = () => {
    setAppliedRange(null)
    setStartDate(getOneMonthAgo(today))
    setEndDate(today)
  }

  const isDirty =
    appliedRange === null || appliedRange.start !== startDate || appliedRange.end !== endDate

  const opexTotal = Number(pnl.opex) + Number(pnl.cogs)
  const netCents = Number(pnl.net_profit)

  return (
    <div className="animate-fade-in max-w-5xl relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-11 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-4">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block mb-1 font-bold">
                Konsolidasi Laba Rugi
              </span>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground uppercase">
                Keuangan (P&amp;L)
              </h2>
              <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Periode: {periodLabel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-background transition-colors">
                <Download className="w-3.5 h-3.5" /> EKSPOR
              </button>
              <button className="flex items-center gap-2 border border-foreground bg-foreground text-background px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300">
                <FileText className="w-3.5 h-3.5" /> CETAK
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Calendar className="w-3.5 h-3.5 text-[#FF4F79]" />
              <h3 className="font-mono text-[9px] font-bold uppercase tracking-widest text-foreground">
                Filter Periode Laporan
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label
                  htmlFor="startDate"
                  className="block font-mono text-[9px] font-bold uppercase text-muted-foreground tracking-widest mb-1.5"
                >
                  Tanggal Mulai
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  className="w-full px-3 py-2 border border-border bg-background font-mono text-xs font-bold text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="endDate"
                  className="block font-mono text-[9px] font-bold uppercase text-muted-foreground tracking-widest mb-1.5"
                >
                  Tanggal Akhir
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3 py-2 border border-border bg-background font-mono text-xs font-bold text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={!isDirty || !startDate || !endDate || startDate > endDate}
                  className="flex items-center gap-1.5 border border-foreground bg-foreground text-background px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Search className="w-3 h-3" /> TAMPILKAN
                </button>
                {appliedRange && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="border border-border bg-background px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-widest hover:bg-muted/10 transition-colors cursor-pointer"
                  >
                    RESET
                  </button>
                )}
              </div>
            </div>
            {startDate > endDate && (
              <p className="font-mono text-[9px] text-red-600 uppercase tracking-wider font-bold">
                Tanggal mulai tidak boleh setelah tanggal akhir.
              </p>
            )}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Pendapatan" valueCents={Number(pnl.revenue)} accent="success" />
            <StatCard label="Laba Kotor" valueCents={Number(pnl.gross_profit)} accent="neutral" />
            <StatCard label="Pengeluaran" valueCents={opexTotal} accent="danger" />
            <StatCard
              label="Laba Bersih"
              valueCents={netCents}
              accent={netCents >= 0 ? 'success' : 'danger'}
            />
          </div>

          {isLoading && (
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest font-bold animate-pulse">
              Memuat data periode...
            </p>
          )}

          {/* Profit Breakdown Table */}
          <div className="border border-border bg-card p-6">
            <h3 className="font-mono text-[10px] font-bold text-foreground uppercase tracking-widest mb-4">
              Rincian Perhitungan Laba
            </h3>
            <div className="space-y-2 divide-y divide-border/40">
              <Row label="Pendapatan Kotor" sign="+" cents={Number(pnl.revenue)} tone="pos" />
              <Row label="HPP / Bahan (est. 40%)" sign="−" cents={Number(pnl.cogs)} tone="neg" />
              <Row label="Laba Kotor" sign="=" cents={Number(pnl.gross_profit)} tone="strong" />
              <Row label="Pengeluaran Operasional" sign="−" cents={Number(pnl.opex)} tone="neg" />
              <Row
                label="Laba Bersih"
                sign="="
                cents={netCents}
                tone={netCents >= 0 ? 'pos-strong' : 'neg-strong'}
              />
            </div>
          </div>
        </div>

        {/* Vertical Branding */}
        <div className="hidden md:flex md:col-span-1 justify-center pt-16 select-none opacity-20 hover:opacity-40 transition-opacity duration-300">
          <div className="font-mono text-[9px] font-black uppercase tracking-[0.3em] branding-vertical text-center whitespace-nowrap">
            KEUANGAN SEMAYOT
          </div>
        </div>
      </div>
    </div>
  )
}

type Accent = 'success' | 'danger' | 'neutral'

function StatCard({
  label,
  valueCents,
  accent = 'neutral',
}: {
  label: string
  valueCents: number
  accent?: Accent
}) {
  const color =
    accent === 'success'
      ? 'text-emerald-700'
      : accent === 'danger'
        ? 'text-red-700'
        : 'text-foreground'
  return (
    <div
      className="border border-border p-6 bg-card hover:bg-background transition-colors duration-300"
      style={{ borderTopWidth: '3px' }}
    >
      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2">
        {label}
      </div>
      <div className={`font-display text-2xl font-semibold tracking-tight tabular-nums ${color}`}>
        <MoneyDisplay cents={valueCents} />
      </div>
    </div>
  )
}

type RowTone = 'pos' | 'neg' | 'strong' | 'pos-strong' | 'neg-strong'

function Row({
  label,
  sign,
  cents,
  tone,
}: {
  label: string
  sign: string
  cents: number
  tone: RowTone
}) {
  const toneClass: Record<RowTone, string> = {
    pos: 'text-emerald-700',
    neg: 'text-red-700',
    strong: 'text-foreground font-black',
    'pos-strong': 'text-emerald-700 font-black',
    'neg-strong': 'text-red-700 font-black',
  }
  const labelTone: Record<RowTone, string> = {
    pos: 'text-muted-foreground',
    neg: 'text-muted-foreground',
    strong: 'text-foreground font-black',
    'pos-strong': 'text-emerald-700 font-black',
    'neg-strong': 'text-red-700 font-black',
  }
  return (
    <div className="flex justify-between items-center py-2">
      <span className={`font-mono text-[10px] uppercase tracking-wider ${labelTone[tone]}`}>
        {label}
      </span>
      <span className={`font-mono text-xs tabular-nums ${toneClass[tone]}`}>
        {sign} <MoneyDisplay cents={cents} />
      </span>
    </div>
  )
}
