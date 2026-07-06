import { createGreeting } from '@/components/admin/overview/overview-data';
import { OverviewPageClient } from '@/components/admin/overview/overview-page-client';

export default function OverviewPage() {
  return <OverviewPageClient initialGreeting={createGreeting(new Date().getHours())} />;
}
