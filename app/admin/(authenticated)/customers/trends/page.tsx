import { Suspense } from 'react'

import { CustomerTrendsView } from '@/components/admin/pages/CustomerTrendsView'

export const metadata = {
  title: 'Tren & Kepuasan Pelanggan | Admin Semayot',
}

export default function CustomerTrendsPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center font-mono text-sm">Memuat analisis tren...</div>}
    >
      <CustomerTrendsView />
    </Suspense>
  )
}
