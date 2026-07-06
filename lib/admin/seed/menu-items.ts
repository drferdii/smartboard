/**
 * Seed data: 3 featured items dari lib/semayot/menu-data.ts.
 * Dijalankan SATU KALI setelah migration via:
 *   pnpm tsx lib/admin/seed/menu-items.ts
 *
 * Butuh SUPABASE_SERVICE_ROLE_KEY di env (bypass RLS untuk insert).
 *
 * Notes:
 * - source data pakai price: "Hubungi Kontak" (string) — seed script
 *   set price_cents=0 dan TIDAK insert jika sudah ada (idempotent by name)
 * - All items created with is_active=true, needs_owner_confirmation=true
 *   (per spec: featured items derived from reviews require owner confirmation)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, '..', '..', '..', '.env.local'), 'utf-8');
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq < 0) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const SEED_ITEMS = [
  {
    name: 'Hidangan Tradisional Dayak',
    description:
      'Sajian khas Dayak dengan rempah-rempah hutan otentik, diolah secara turun-temurun dengan cita rasa khas lokal Bengkayang.',
    price_cents: 0,
    category: 'dayak' as const,
    badge: 'Khas Dayak',
  },
  {
    name: 'Daging Asap Khas Semayot',
    description:
      'Olahan daging asap tradisional beraroma kayu bakar yang harum, empuk, dan gurih khas pedalaman Kalimantan Barat.',
    price_cents: 0,
    category: 'smoked' as const,
    badge: 'Paling Dicari',
  },
  {
    name: 'Tumisan Pedas Rempah Dayak',
    description:
      'Hidangan dengan rasa pedas melimpah yang pas di lidah, memadukan daun singkong, kecombrang, dan rempah pedas Kalimantan.',
    price_cents: 0,
    category: 'pedas' as const,
    badge: 'Pedas Pas',
  },
];

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  console.log(`Seeding ${SEED_ITEMS.length} menu items...\n`);

  // Check existing names to skip duplicates
  const { data: existing, error: listErr } = await supabase
    .from('menu_items')
    .select('name');
  if (listErr) {
    console.error('Failed to list existing menu items:', listErr.message);
    process.exit(1);
  }
  const existingNames = new Set((existing ?? []).map((m) => m.name));

  let created = 0;
  let skipped = 0;

  for (const item of SEED_ITEMS) {
    if (existingNames.has(item.name)) {
      console.log(`  ⊘ Skip (exists): ${item.name}`);
      skipped++;
      continue;
    }
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        ...item,
        badge: item.badge,
        is_active: true,
        needs_owner_confirmation: true,
      })
      .select()
      .single();
    if (error) {
      console.error(`  ✗ Failed to seed "${item.name}":`, error.message);
      continue;
    }
    console.log(`  ✓ Seeded: ${data.name} (${data.id})`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

main().catch(console.error);
