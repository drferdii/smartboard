# Security Policy

Kebijakan keamanan untuk `apps/clients/semayot`.

## Supported scope

Policy ini berlaku untuk surface aktif berikut:

- public site
- admin workspace
- Sentra Smartboard
- `app/api/**`
- Supabase-bound auth and data flows
- AI summary, AI chat, dan memory routes

## Reporting a vulnerability

Jangan laporkan vulnerability sensitif lewat issue publik.

Laporkan melalui channel internal resmi Sentra / maintainer yang berwenang
dengan isi minimal:

1. deskripsi masalah
2. impact
3. langkah reproduksi
4. scope file atau route yang terdampak
5. screenshot atau proof-of-concept yang aman

## Response targets

- acknowledgement: 48 jam
- triage awal: 5 hari kerja
- critical remediation plan: secepat mungkin setelah validasi

## High-risk areas

Perubahan pada area berikut harus dianggap sensitif:

- `/admin` auth boundary
- `/api/admin/**`
- Supabase session, server client, dan generated types
- laporan finansial
- transaksi POS
- customer/staff data
- AI memory
- export routes

## Security principles

- Fail closed bila auth, role, atau config hilang
- Jangan expose raw internal exception ke client
- Jangan commit `.env`, keys, token, atau credentials
- Jangan log data sensitif tanpa kebutuhan yang sah
- Gunakan data sintetik untuk fixture/test bila memungkinkan
- Angka bisnis dan output AI tidak boleh mengaburkan batas antara fakta dan
  inferensi

## Out of scope

Yang tidak dianggap deployment surface:

- `scratch/`
- `.playwright-mcp/`
- `.agents/`
- `.mimocode/`
- local screenshots, logs, atau audit captures yang sudah di-ignore

## Disclosure notes

Semayot saat ini memakai:

- Next.js App Router
- Supabase auth/data access
- AI SDK + Google Gemini

Kerentanan yang menyentuh integrasi tersebut tetap harus dilaporkan dengan scope
file yang spesifik, bukan asumsi umum.
