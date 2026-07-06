import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

import type { UserRole } from '@/lib/admin/supabase/types'

export function AdminShell({
  role,
  fullName,
  children,
}: {
  role: UserRole
  fullName: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-background text-foreground relative overflow-hidden">
      <div className="grid-overlay" />

      {/* Setengah Atas: Grid Background Garis Vertikal & Horisontal Jarang-Jarang & Random */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] overflow-hidden pointer-events-none z-0 opacity-[0.18] select-none text-foreground">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          {/* Garis Vertikal Random */}
          <line x1="8%" y1="0" x2="8%" y2="100%" stroke="currentColor" strokeWidth="1" />
          <line x1="22%" y1="0" x2="22%" y2="100%" stroke="currentColor" strokeWidth="1" />
          <line x1="47%" y1="0" x2="47%" y2="100%" stroke="currentColor" strokeWidth="1" />
          <line x1="63%" y1="0" x2="63%" y2="100%" stroke="currentColor" strokeWidth="1" />
          <line x1="81%" y1="0" x2="81%" y2="100%" stroke="currentColor" strokeWidth="1" />
          <line x1="94%" y1="0" x2="94%" y2="100%" stroke="currentColor" strokeWidth="1" />

          {/* Garis Horisontal Random */}
          <line x1="0" y1="12%" x2="100%" y2="12%" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="28%" x2="100%" y2="28%" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="52%" x2="100%" y2="52%" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="73%" x2="100%" y2="73%" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="89%" x2="100%" y2="89%" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <Sidebar role={role} fullName={fullName} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto w-full flex flex-col items-center">
          <div className="w-full max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Teks Vertikal Raksasa di Kanan (Branding Shadow Kanan) */}
      <div className="fixed right-6 top-28 bottom-12 pointer-events-none flex flex-col justify-start items-center opacity-[0.03] select-none z-0 branding-global">
        <div className="font-display text-[18px] font-black uppercase flex flex-col items-center gap-2.5 leading-none">
          {'SEMAYOT PROTOKOL'.split('').map((char, i) => (
            <span key={i} className="block leading-none">
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
