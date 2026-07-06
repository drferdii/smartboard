'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createClient } from '@/lib/admin/supabase/client'

function getAuthErrorMessage(message?: string) {
  const normalized = message?.toLowerCase() ?? ''

  if (normalized.includes('email not confirmed')) {
    return 'Akun belum menyelesaikan konfirmasi email atau setup undangan.'
  }

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('email or password')
  ) {
    return 'Email atau password salah.'
  }

  if (normalized.includes('invalid api key') || normalized.includes('anonymous key')) {
    return 'Konfigurasi auth Supabase tidak valid. Periksa NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  }

  if (normalized.includes('email rate limit exceeded') || normalized.includes('rate limit')) {
    return 'Terlalu banyak percobaan login. Tunggu sebentar lalu coba lagi.'
  }

  if (message?.trim()) {
    return `AUTH_ERROR: ${message}`
  }

  return 'Autentikasi gagal. Periksa konfigurasi Supabase dan status akun Anda.'
}

function getLoginErrorMessage(errorCode?: string) {
  if (errorCode === 'inactive') {
    return 'Akun Anda nonaktif. Hubungi owner untuk mengaktifkannya kembali.'
  }

  if (errorCode === 'profile_missing') {
    return 'Akun berhasil masuk, tetapi profil admin belum tersedia. Pastikan tabel profiles sudah memiliki baris untuk akun ini.'
  }

  return null
}

export function LoginForm({ redirect, loginError }: { redirect: string; loginError?: string }) {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(() => getLoginErrorMessage(loginError))
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes('placeholder') ||
      supabaseKey.includes('placeholder-anon-key')
    ) {
      setError(
        'KONFIGURASI_ERROR: Variabel lingkungan Supabase belum diatur di server hosting (Vercel). Silakan tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di panel kontrol Vercel Anda.'
      )
      return
    }

    startTransition(async () => {
      try {
        const supabase = createClient()

        // Timeout 15 detik untuk menghindari UI hang
        const timeoutPromise = new Promise<{ error: Error }>((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error('Koneksi ke server terlalu lama (Timeout). Silakan coba lagi nanti.')
              ),
            15000
          )
        })

        // Race antara autentikasi dan timeout
        const authPromise = supabase.auth.signInWithPassword({ email, password })

        const response = (await Promise.race([authPromise, timeoutPromise])) as Awaited<
          typeof authPromise
        >

        if (response.error) {
          setError(getAuthErrorMessage(response.error.message))
          return
        }

        router.push(redirect)
        router.refresh()
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan jaringan atau server tidak merespons.'
        setError(message)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center select-none">
          <img
            src="/semayot/images/bird.png"
            className="w-10 h-10 object-contain mb-3"
            alt="Semayot"
          />
          <div className="flex flex-col leading-tight brand-text-neu">
            <span className="font-display text-xl font-bold tracking-[-0.03em] text-[#1C1917] uppercase">
              Smartboard
            </span>
            <span className="font-display text-xs font-semibold tracking-[0.08em] text-[#FF4F79] uppercase">
              Semayot
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card p-6 border-1.5 border-[#1C1917] shadow-[2.5px_2.5px_0px_#1C1917] rounded-none space-y-4"
        >
          {error && (
            <div className="font-mono text-xs text-red-600 border border-red-600/20 bg-red-600/5 p-3 rounded-none uppercase tracking-wider">
              LOGIN_ERROR: {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-none border-1.5 border-[#1C1917] bg-[#FCF9F2] font-mono text-xs text-foreground focus:outline-none focus:border-[#FF4F79]"
              placeholder="admin@semayot.id"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-none border-1.5 border-[#1C1917] bg-[#FCF9F2] font-mono text-xs text-foreground focus:outline-none focus:border-[#FF4F79]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full border-1.5 border-[#1C1917] bg-[#FF4F79] hover:bg-[#E03D63] text-white py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-[1.5px_1.5px_0px_#1C1917] hover:shadow-[2px_2px_0px_#1C1917] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none rounded-none cursor-pointer"
          >
            {isPending ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
