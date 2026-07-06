import { redirect } from 'next/navigation'

import { AdminShell } from '@/components/admin/AdminShell'
import { createClient } from '@/lib/admin/supabase/server'
import type { UserRole } from '@/lib/admin/supabase/types'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, is_active')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/admin/login?error=profile_missing')
  }

  if (!profile.is_active) {
    redirect('/admin/login?error=inactive')
  }

  return (
    <AdminShell role={profile.role as UserRole} fullName={profile.full_name}>
      {children}
    </AdminShell>
  )
}
