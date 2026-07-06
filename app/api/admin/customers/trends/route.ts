import { type NextRequest } from 'next/server'

import { requireActiveUser, requireRole } from '@/lib/admin/auth'
import { createClient } from '@/lib/admin/supabase/server'
import { apiData, logApiError } from '@/lib/http/responses'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await requireActiveUser(supabase)
    if (!auth.ok) {
      return auth.response
    }
    const roleResponse = requireRole(auth.profile, ['owner'])
    if (roleResponse) return roleResponse

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Base mock reviews (Google Reviews)
    const allReviews = [
      {
        id: 'rev-1',
        customerName: 'Ferdi Iskandar',
        phone: '0812****4321',
        sentiment: 'positif',
        rating: 5,
        comment:
          'Daging asap aroma kayu dayak-nya sangat meresap, kulitnya renyah. Porsi Babi Guling-nya pas mantap!',
        date: '2026-07-06',
        avatarColor: 'bg-[#FF4F79]/10 text-[#FF4F79]',
      },
      {
        id: 'rev-2',
        customerName: 'Alyn Kristiani',
        phone: '0813****9876',
        sentiment: 'positif',
        rating: 5,
        comment:
          'Keramahan staf luar biasa, suasana Bumi Amas sangat terasa kekeluargaannya. Paket Makan di Tempat (Asap) favorit!',
        date: '2026-07-05',
        avatarColor: 'bg-emerald-500/10 text-emerald-700',
      },
      {
        id: 'rev-3',
        customerName: 'Hendra Wijaya',
        phone: '0852****1122',
        sentiment: 'netral',
        rating: 4,
        comment:
          'Pekasam Babi Masak bintang 5 rasanya, tapi antrean kasir pada jam makan siang (12.30) agak padat. Semoga bisa dipercepat.',
        date: '2026-07-04',
        avatarColor: 'bg-amber-500/10 text-amber-700',
      },
      {
        id: 'rev-4',
        customerName: 'Dewi Sartika',
        phone: '0896****5544',
        sentiment: 'positif',
        rating: 5,
        comment:
          'Pekasam Babi 1 Kg sangat pas dibeli bawa pulang. Rasanya hangat menyegarkan, recommended untuk keluarga.',
        date: '2026-07-03',
        avatarColor: 'bg-[#FF4F79]/10 text-[#FF4F79]',
      },
      {
        id: 'rev-5',
        customerName: 'Rian Bengkayang',
        phone: '0821****8877',
        sentiment: 'kritis',
        rating: 3,
        comment:
          'Labi-Labi Mentah-nya segar, namun area parkir di depan kantor camat agak penuh di akhir pekan. Pelayanan oke.',
        date: '2026-06-25',
        avatarColor: 'bg-red-500/10 text-red-700',
      },
      {
        id: 'rev-6',
        customerName: 'Budi Santoso',
        phone: '0811****2233',
        sentiment: 'positif',
        rating: 5,
        comment:
          'Es Jeruknya manis alami segar sekali. Labi-Labi Mentah bumbu kuning mantap, recommended!',
        date: '2026-06-15',
        avatarColor: 'bg-emerald-500/10 text-emerald-700',
      },
      {
        id: 'rev-7',
        customerName: 'Siti Rahma',
        phone: '0815****4455',
        sentiment: 'kritis',
        rating: 2,
        comment:
          'Babi Guling agak dingin pas disajikan tadi siang, mungkin karena terlalu ramai. Mohon dijaga kehangatannya.',
        date: '2026-05-10',
        avatarColor: 'bg-red-500/10 text-red-700',
      },
    ]

    // Filter reviews based on range
    let filteredReviews = allReviews
    let csat = 4.9
    let nps = 78
    let repeatRate = 74.5
    let totalMembers = 1280
    let csatDelta = '+0.1'
    let membersDelta = '+15.2%'
    let repeatRateDelta = '+2.3%'
    let npsDelta = '+4'

    if (range === '7d') {
      filteredReviews = allReviews.filter((r) => {
        const diff =
          (new Date('2026-07-06').getTime() - new Date(r.date).getTime()) / (1000 * 3600 * 24)
        return diff <= 7
      })
      csat = 4.87
      nps = 76
      repeatRate = 72.8
      totalMembers = 1245
      csatDelta = '+0.05'
      membersDelta = '+2.1%'
      repeatRateDelta = '+0.8%'
      npsDelta = '+2'
    } else if (range === '30d') {
      filteredReviews = allReviews.filter((r) => {
        const diff =
          (new Date('2026-07-06').getTime() - new Date(r.date).getTime()) / (1000 * 3600 * 24)
        return diff <= 30
      })
      csat = 4.9
      nps = 78
      repeatRate = 74.5
      totalMembers = 1280
      csatDelta = '+0.1'
      membersDelta = '+15.2%'
      repeatRateDelta = '+2.3%'
      npsDelta = '+4'
    } else if (range === '90d') {
      filteredReviews = allReviews.filter((r) => {
        const diff =
          (new Date('2026-07-06').getTime() - new Date(r.date).getTime()) / (1000 * 3600 * 24)
        return diff <= 90
      })
      csat = 4.81
      nps = 72
      repeatRate = 70.2
      totalMembers = 1180
      csatDelta = '+0.08'
      membersDelta = '+8.5%'
      repeatRateDelta = '+1.5%'
      npsDelta = '+3'
    } else {
      // all time
      filteredReviews = allReviews
      csat = 4.78
      nps = 70
      repeatRate = 68.5
      totalMembers = 1280
      csatDelta = '+0.25'
      membersDelta = '+45.8%'
      repeatRateDelta = '+8.2%'
      npsDelta = '+10'
    }

    const data = {
      summary: {
        csat,
        csatDelta,
        totalMembers,
        membersDelta,
        repeatRate,
        repeatRateDelta,
        nps,
        npsDelta,
      },
      monthlyTrends: [
        { month: 'JAN', csat: 4.75, loyaltyActive: 850 },
        { month: 'FEB', csat: 4.8, loyaltyActive: 920 },
        { month: 'MAR', csat: 4.82, loyaltyActive: 1010 },
        { month: 'APR', csat: 4.85, loyaltyActive: 1100 },
        { month: 'MEI', csat: 4.88, loyaltyActive: 1180 },
        { month: 'JUN', csat: csat, loyaltyActive: totalMembers },
      ],
      satisfactionFactors: [
        {
          factor: 'Rasa Hidangan',
          score: range === '7d' ? 99 : 98,
          reviewsCount: range === '7d' ? 45 : 420,
        },
        {
          factor: 'Keramahan Staf',
          score: range === '7d' ? 95 : 94,
          reviewsCount: range === '7d' ? 40 : 380,
        },
        {
          factor: 'Kecepatan Sajian',
          score: range === '7d' ? 90 : 92,
          reviewsCount: range === '7d' ? 38 : 350,
        },
        {
          factor: 'Kesesuaian Harga',
          score: range === '7d' ? 92 : 91,
          reviewsCount: range === '7d' ? 32 : 310,
        },
      ],
      keywords: [
        { text: 'BABI GULING', value: 64, sentiment: 'positif' },
        { text: 'BABI ASAP', value: 55, sentiment: 'positif' },
        { text: 'PEKASAM BABI', value: 48, sentiment: 'positif' },
        { text: 'LABI-LABI', value: 38, sentiment: 'positif' },
        { text: 'TUPAI MENTAH', value: 24, sentiment: 'positif' },
        { text: 'ANTREAN KASIR', value: 15, sentiment: 'kritis' },
        { text: 'PARKIR SEMPIT', value: 12, sentiment: 'kritis' },
      ],
      reviews: filteredReviews,
    }

    return apiData(data)
  } catch (error: unknown) {
    return logApiError('api/admin/customers/trends', error, {
      message: 'Gagal memuat analisis tren pelanggan.',
    })
  }
}
