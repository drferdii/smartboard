import { StaffView } from '@/components/admin/pages/StaffView';

export const metadata = {
  title: 'Staf & Shift | Admin Semayot',
};

import { Suspense } from 'react';

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono">Memuat...</div>}>
      <StaffView />
    </Suspense>
  );
}
