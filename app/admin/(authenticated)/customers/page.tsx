import { CustomersView } from '@/components/admin/pages/CustomersView';

export const metadata = {
  title: 'Pelanggan | Admin Semayot',
};

import { Suspense } from 'react';

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono">Memuat...</div>}>
      <CustomersView />
    </Suspense>
  );
}
