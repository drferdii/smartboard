import { NextResponse } from 'next/server';
import type { ApiErrorBody } from '@/lib/http/errors';

export function apiData<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function apiError(status: number, code: string, message: string) {
  return NextResponse.json<ApiErrorBody>(
    {
      error: { code, message },
    },
    { status }
  );
}

export function logApiError(
  context: string,
  error: unknown,
  options?: {
    status?: number;
    code?: string;
    message?: string;
  }
) {
  console.error(`[${context}]`, error);

  return apiError(
    options?.status ?? 500,
    options?.code ?? 'INTERNAL_ERROR',
    options?.message ?? 'Terjadi kesalahan pada server.'
  );
}
