'use client'

import { TrendingUp, MessageSquare, Star, ShieldCheck } from 'lucide-react'
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import useSWR from 'swr'

import { PageHeader } from '@/components/admin/PageHeader'
import { StatCard } from '@/components/admin/StatCard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { VerticalBranding } from '@/components/admin/VerticalBranding'

type TrendSummary = {
  csat: number
  csatDelta: string
  totalMembers: number
  membersDelta: string
  repeatRate: number
  repeatRateDelta: string
  nps: number
  npsDelta: string
}

type MonthlyTrend = {
  month: string
  csat: number
  loyaltyActive: number
}

type SatisfactionFactor = {
  factor: string
  score: number
  reviewsCount: number
}

type ReviewKeyword = {
  text: string
  value: number
  sentiment: 'positif' | 'kritis'
}

type CustomerReview = {
  id: string
  customerName: string
  phone: string
  sentiment: 'positif' | 'netral' | 'kritis'
  rating: number
  comment: string
  date: string
  avatarColor: string
}

type CustomerTrendsData = {
  summary: TrendSummary
  monthlyTrends: MonthlyTrend[]
  satisfactionFactors: SatisfactionFactor[]
  keywords: ReviewKeyword[]
  reviews: CustomerReview[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function CustomerTrendsView() {
  const [range, setRange] = React.useState('30d')
  const { data } = useSWR(`/api/admin/customers/trends?range=${range}`, fetcher, { suspense: true })

  const trends: CustomerTrendsData = data?.data || {
    summary: {
      csat: 0,
      csatDelta: '',
      totalMembers: 0,
      membersDelta: '',
      repeatRate: 0,
      repeatRateDelta: '',
      nps: 0,
      npsDelta: '',
    },
    monthlyTrends: [],
    satisfactionFactors: [],
    keywords: [],
    reviews: [],
  }

  const sentimentLabel: Record<string, string> = {
    positif: 'POSITIF',
    netral: 'NETRAL',
    kritis: 'KRITIS',
  }

  const sentimentBadgeVariant = (sentiment: string) => {
    if (sentiment === 'positif') return 'success'
    if (sentiment === 'kritis') return 'danger'
    return 'neutral'
  }

  // Convert monthly data for Recharts scale
  const lineChartData = trends.monthlyTrends.map((t) => ({
    name: t.month,
    'Skor CSAT (x10)': t.csat * 10,
    'Member Aktif': t.loyaltyActive,
  }))

  return (
    <div className="relative min-h-[80vh] flex flex-col page-customers-trends animate-fade-in">
      <PageHeader
        label="CRM & ANALISIS SENTIMEN"
        title="Tren & Kepuasan Pelanggan"
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 border border-border bg-card px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[#FF4F79] border-[#FF4F79]/20 shrink-0">
              <ShieldCheck className="w-4 h-4" /> INTEGRASI GOOGLE MAPS
            </div>
            <div className="flex items-center gap-2 border border-border bg-card px-3 py-1 font-sans text-xs text-foreground">
              <label
                htmlFor="timeRange"
                className="font-mono text-[9px] font-black text-muted-foreground uppercase tracking-widest shrink-0"
              >
                RENTANG:
              </label>
              <select
                id="timeRange"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-transparent border-none py-1 pr-8 pl-1 font-mono text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="7d">7 HARI</option>
                <option value="30d">30 HARI</option>
                <option value="90d">90 HARI</option>
                <option value="all">SEMUA</option>
              </select>
            </div>
          </div>
        }
      />

      <div className="mt-8 space-y-8 relative z-10">
        {/* KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Skor Kepuasan (CSAT)"
            value={`${trends.summary.csat} / 5.0`}
            delta={trends.summary.csatDelta}
            accent="success"
            className="p-6 border-emerald-600/30 bg-emerald-500/5"
          />
          <StatCard
            label="Loyalty Members"
            value={trends.summary.totalMembers.toLocaleString('id-ID')}
            delta={trends.summary.membersDelta}
            accent="success"
            className="p-6"
          />
          <StatCard
            label="Repeat Order Rate"
            value={`${trends.summary.repeatRate}%`}
            delta={trends.summary.repeatRateDelta}
            accent="success"
            className="p-6"
          />
          <StatCard
            label="Net Promoter Score"
            value={trends.summary.nps.toString()}
            delta={trends.summary.npsDelta}
            accent="success"
            className="p-6 border-[#FF4F79]/30 bg-[#FF4F79]/5"
          />
        </section>

        {/* Charts & Factors Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart Card */}
          <div className="lg:col-span-8 border border-border bg-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start border-b border-border pb-4 mb-6">
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                  Tren Kepuasan & Retensi Member
                </h3>
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mt-1">
                  Rata-rata penilaian POS & Pertumbuhan Member Baru (6 Bulan Terakhir)
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-stone-500" />
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 10, right: 10, bottom: 5, left: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(88% 0.01 130)"
                    strokeWidth={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 'bold' }}
                    stroke="oklch(65% 0.01 160)"
                  />
                  <YAxis
                    tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 'bold' }}
                    stroke="oklch(65% 0.01 160)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(98% 0.005 85)',
                      border: '1px solid oklch(88% 0.01 130)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                    }}
                    formatter={(value, name) => {
                      if (name === 'Skor CSAT (x10)')
                        return [`${(Number(value) / 10).toFixed(2)} / 5.0`, 'CSAT']
                      return [value, name]
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      fontWeight: 'bold',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Skor CSAT (x10)"
                    stroke="#FF4F79"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Skor CSAT (x10)"
                  />
                  <Line
                    type="monotone"
                    dataKey="Member Aktif"
                    stroke="oklch(35% 0.02 160)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                    name="Member Aktif"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Factors & Sentiment Card */}
          <div className="lg:col-span-4 border border-border bg-card p-6 flex flex-col justify-between">
            <div className="border-b border-border pb-4 mb-6">
              <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                Pilar Kepuasan
              </h3>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mt-1">
                Kinerja berdasarkan 4 faktor utama ulasan
              </p>
            </div>

            <div className="space-y-6 flex-1">
              {trends.satisfactionFactors.map((factor) => (
                <div key={factor.factor} className="space-y-2">
                  <div className="flex justify-between font-mono text-xs font-bold uppercase">
                    <span className="text-foreground">{factor.factor}</span>
                    <span className="text-[#FF4F79]">{factor.score}%</span>
                  </div>
                  <div className="h-2 bg-[#FBEFEF] border border-border/50 overflow-hidden">
                    <div className="h-full bg-[#FF4F79]" style={{ width: `${factor.score}%` }} />
                  </div>
                  <div className="flex justify-between font-mono text-[8px] text-muted-foreground uppercase">
                    <span>Sampel Ulasan</span>
                    <span>{factor.reviewsCount} Kueri</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Word Cloud & Wall Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sentiment Word Cloud */}
          <div className="lg:col-span-4 border border-border bg-card p-6 space-y-4">
            <div className="border-b border-border pb-4">
              <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                Awan Kata Sentimen
              </h3>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mt-1">
                Kata kunci ulasan terpopuler di kasir & Google
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 py-4 justify-center items-center">
              {trends.keywords.map((word) => {
                const isPos = word.sentiment === 'positif'
                return (
                  <span
                    key={word.text}
                    className={`font-mono font-bold uppercase tracking-wider px-3 py-1.5 border transition-all hover:scale-105 select-none ${
                      isPos
                        ? 'border-emerald-600/20 text-emerald-700 bg-emerald-500/5'
                        : 'border-red-600/20 text-red-700 bg-red-600/5'
                    }`}
                    style={{ fontSize: `${Math.max(10, Math.min(16, 9 + word.value / 6))}px` }}
                  >
                    {word.text}
                  </span>
                )
              })}
            </div>

            <div className="pt-2 font-sans text-xs text-muted-foreground leading-relaxed text-center">
              Kata berukuran besar menunjukkan frekuensi kueri yang lebih tinggi.
            </div>
          </div>

          {/* Wall of Customer Feedback */}
          <div className="lg:col-span-8 border border-border bg-card p-6 space-y-6">
            <div className="flex justify-between items-end border-b border-border pb-4">
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                  Dinding Ulasan Pelanggan
                </h3>
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mt-1">
                  Ulasan operasional real-time terbaru dari POS
                </p>
              </div>
              <MessageSquare className="w-5 h-5 text-stone-500" />
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {trends.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-border/80 bg-background/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 flex items-center justify-center font-display font-black text-xs uppercase border border-[#1C1917]/10 ${review.avatarColor}`}
                      >
                        {review.customerName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-display font-semibold text-xs text-foreground uppercase tracking-wide">
                          {review.customerName}
                        </div>
                        <div className="font-mono text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                          {review.phone} &middot; {review.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? 'fill-[#FF4F79] text-[#FF4F79]' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <StatusBadge variant={sentimentBadgeVariant(review.sentiment)}>
                        {sentimentLabel[review.sentiment]}
                      </StatusBadge>
                    </div>
                  </div>

                  <p className="font-sans text-sm text-foreground leading-relaxed">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <VerticalBranding
        text="SEMAYOT // TREN KEPUASAN"
        className="absolute -right-12 top-0 bottom-0 pointer-events-none"
      />
    </div>
  )
}
