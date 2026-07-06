# Contributing

Panduan kontribusi untuk `apps/clients/semayot`.

## Scope

Semayot adalah app hybrid dalam monorepo ABYSS dengan empat surface aktif:

- public restaurant site
- admin workspace
- Sentra Smartboard
- API dan AI routes

Kontribusi harus tetap berada dalam boundary app ini kecuali ada approval
eksplisit untuk cross-app work.

## Prasyarat

- Node.js 20+
- `pnpm`
- akses ke monorepo ABYSS

## Local workflow

```bash
pnpm dev
pnpm lint
pnpm test
pnpm build
```

Gunakan verifikasi sekecil mungkin lebih dulu. Jangan mulai dari build penuh
kalau perubahan hanya menyentuh copy atau dokumentasi.

## Repo discipline

- Gunakan `pnpm`, jangan `npm` atau `yarn`
- Jangan ubah auth, env handling, deployment, schema database, migration, atau
  config workspace tanpa scope yang jelas
- Jangan ekstrak shared abstraction keluar app ini tanpa approval
- Jangan commit secrets, `.env`, dump data, capture lokal, atau artefak AI
  eksperimen

## Code conventions

- TypeScript strict tetap jadi baseline
- Hindari `any`; utamakan narrowing dan type guards
- Ikuti struktur App Router dan pola folder yang sudah ada
- Pakai `@/` alias untuk import internal
- Pertahankan pemisahan antara:
  - deterministic intelligence
  - generative AI
  - UI rendering
  - Supabase access

## UI conventions

- Hormati visual language Sentra Smartboard yang sekarang
- Jangan ubah public dan admin menjadi dua sistem desain yang saling bertabrakan
- Motion harus punya tujuan operasional, bukan dekorasi semata
- Untuk dashboard, prioritaskan readability, actionability, dan honesty over
  visual noise

## AI conventions

- Jangan mengarang data bisnis, angka, atau availability
- Jelaskan feature AI berdasarkan perilaku aktual route dan UI saat ini
- Bedakan hasil deterministik dari hasil LLM di code maupun dokumentasi
- Jika AI route butuh key atau role tertentu, fail closed

## Commit format

Gunakan Conventional Commits:

```text
feat(scope): short summary
fix(scope): short summary
docs(scope): short summary
chore(scope): short summary
refactor(scope): short summary
test(scope): short summary
```

Contoh:

```text
docs(readme): rewrite smartboard architecture guide
chore(scaffold): add repo-standard contribution files
fix(overview): stabilize streaming chat bubble keys
```

## Pull request checklist

- [ ] Scope tetap di `apps/clients/semayot`
- [ ] Tidak ada secret atau data sensitif
- [ ] README dan scaffold tetap sinkron dengan produk aktual
- [ ] Verifikasi yang relevan sudah dijalankan atau alasan belum menjalankan
      sudah dicatat
- [ ] Perubahan UI tetap konsisten dengan Sentra Smartboard

## Related files

- `AGENTS.md` di root monorepo
- `apps/AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `.agent/HANDOFF.md`
