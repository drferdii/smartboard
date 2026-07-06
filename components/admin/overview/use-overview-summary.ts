'use client';

import useSWR from 'swr';
import type { DashboardOverviewData } from '@/lib/admin/overview/contracts';

type ApiEnvelope = {
  data: DashboardOverviewData;
};

function buildOverviewSummaryKey(branchId: string | null | undefined): string {
  if (!branchId) {
    return '/api/admin/overview/summary';
  }

  const params = new URLSearchParams({ branchId });
  return `/api/admin/overview/summary?${params.toString()}`;
}

async function fetchOverviewSummary(url: string): Promise<DashboardOverviewData> {
  const response = await fetch(url, {
    credentials: 'same-origin',
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  const errorMessage =
    typeof payload.error === 'object' &&
    payload.error !== null &&
    'message' in payload.error &&
    typeof payload.error.message === 'string'
      ? payload.error.message
      : null;

  if (!response.ok || !('data' in payload)) {
    throw new Error(errorMessage || `HTTP ${response.status}`);
  }

  return (payload as ApiEnvelope).data;
}

export function useOverviewSummary(branchId?: string | null, enabled = true) {
  return useSWR(enabled ? buildOverviewSummaryKey(branchId) : null, fetchOverviewSummary, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });
}
