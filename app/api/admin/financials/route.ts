import { requireActiveUser, requireRole } from '@/lib/admin/auth'
import { buildBusinessDateRange, getDateParts, isIsoCalendarDate } from '@/lib/admin/format/date'
import { createClient } from '@/lib/admin/supabase/server'
import { apiData, apiError, logApiError } from '@/lib/http/responses'

const BUSINESS_TIMEZONE = 'Asia/Jakarta'
// For MVP, approximate COGS as 40% of revenue (existing convention)
const COGS_RATE = 0.4

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await requireActiveUser(supabase)
    if (!auth.ok) {
      return auth.response
    }
    const roleResponse = requireRole(auth.profile, ['owner'])
    if (roleResponse) return roleResponse

    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')?.trim()
    const endDateParam = searchParams.get('endDate')?.trim()

    const today = getDateParts({ timeZone: BUSINESS_TIMEZONE })

    let startDate: string
    let endDateExclusive: string

    if (startDateParam && endDateParam) {
      if (!isIsoCalendarDate(startDateParam) || !isIsoCalendarDate(endDateParam)) {
        return apiError(400, 'VALIDATION_ERROR', 'Format tanggal tidak valid. Gunakan YYYY-MM-DD.')
      }
      if (startDateParam > endDateParam) {
        return apiError(400, 'VALIDATION_ERROR', 'Tanggal mulai tidak boleh setelah tanggal akhir.')
      }
      startDate = startDateParam
      // Inclusive end date -> exclusive next-day boundary for transaction timestamps
      const [y, m, d] = endDateParam.split('-').map(Number)
      const endDateTime = new Date(Date.UTC(y, m - 1, d))
      endDateTime.setUTCDate(endDateTime.getUTCDate() + 1)
      endDateExclusive = endDateTime.toISOString().slice(0, 10)
    } else {
      // Default: current month (backward compatible)
      startDate = `${today.year}-${String(today.month).padStart(2, '0')}-01`
      const endMonth = today.month === 12 ? 1 : today.month + 1
      const endYear = today.month === 12 ? today.year + 1 : today.year
      endDateExclusive = `${endYear}-${String(endMonth).padStart(2, '0')}-01`
    }

    // Transactions use timestamp with timezone -> business-date-aware bounds
    const startRange = buildBusinessDateRange(startDate, BUSINESS_TIMEZONE)
    const endRange = buildBusinessDateRange(endDateExclusive, BUSINESS_TIMEZONE)

    const { data: txs, error: txError } = await supabase
      .from('transactions')
      .select('total_cents, paid_cents')
      .gte('created_at', startRange.start)
      .lt('created_at', endRange.start)

    if (txError) throw txError

    // Expenses use calendar date column (incurred_at YYYY-MM-DD)
    const { data: expenses, error: expError } = await supabase
      .from('expenses')
      .select('amount_cents')
      .gte('incurred_at', startDate)
      .lt('incurred_at', endDateExclusive)

    if (expError) throw expError

    const paidTxs = (txs ?? []).filter((t) => t.paid_cents >= t.total_cents)
    const revenueCents = paidTxs.reduce((sum, t) => sum + t.total_cents, 0)
    const opexCents = (expenses ?? []).reduce((sum, e) => sum + e.amount_cents, 0)
    const cogsCents = Math.floor(revenueCents * COGS_RATE)
    const grossProfitCents = revenueCents - cogsCents
    const netProfitCents = grossProfitCents - opexCents

    return apiData({
      start_date: startDate,
      end_date: endDateExclusive,
      revenue: revenueCents,
      cogs: cogsCents,
      gross_profit: grossProfitCents,
      opex: opexCents,
      net_profit: netProfitCents,
    })
  } catch (error: unknown) {
    return logApiError('api/admin/financials', error, {
      message: 'Gagal memuat ringkasan finansial.',
    })
  }
}
