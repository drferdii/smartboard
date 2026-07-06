import { InventoryView } from '@/components/admin/pages/InventoryView';

export const metadata = {
  title: 'Inventaris | Admin Semayot',
};

import { Suspense } from 'react';

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono">Memuat...</div>}>
      <InventoryView />
    </Suspense>
  );
}
