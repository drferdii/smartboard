import { FinancialsView } from '@/components/admin/pages/FinancialsView';

export const metadata = {
  title: 'Keuangan P&L | Admin Semayot',
};

import { Suspense } from 'react';

export default function FinancialsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono">Memuat...</div>}>
      <FinancialsView />
    </Suspense>
  );
}
