import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { Database } from '@/lib/admin/supabase/types'

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Component — ignore (handled by middleware)
        }
      },
    },
  })
}

export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
  return createServerClient<Database>(url, serviceKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No-op for admin client
      },
    },
  })
}
