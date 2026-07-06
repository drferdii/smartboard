import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/admin/supabase/types';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  return createBrowserClient<Database>(url, key);
}
