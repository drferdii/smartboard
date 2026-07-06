/**
 * SEO recommendations for Rumah Makan Semayot admin panel.
 * 10 static recommendations curated by OG. Owner applies them manually
 * to the public site (we don't modify the public site from admin).
 *
 * State is stored in memory + persisted in a small JSON file at
 * `lib/admin/seo/state.json` (gitignored). For MVP this is fine; for
 * production move to a table.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_PATH = resolve(__dirname, 'state.json');

export type SeoRecommendation = {
  id: string;
  title: string;
  why_it_matters: string;
  apply_at: string;
  copy_value: string | null;
  status: 'pending' | 'applied' | 'skipped';
};

const DEFAULT_RECS: SeoRecommendation[] = [
  {
    id: 'meta-title-description',
    title: 'Meta title & description audit',
    why_it_matters: 'Title dan description saat ini sudah di-set di app/layout.tsx. Panjang optimal 50-60 char untuk title, 150-160 untuk description.',
    apply_at: 'app/layout.tsx',
    copy_value: null,
    status: 'applied',
  },
  {
    id: 'jsonld-restaurant',
    title: 'JSON-LD Restaurant schema',
    why_it_matters: 'Tambah blok <script type="application/ld+json"> di app/layout.tsx untuk Google rich results (buka jam, rating, alamat, menu).',
    apply_at: 'app/layout.tsx',
    copy_value: `{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Rumah Makan Semayot",
  "servesCuisine": "Dayak, Indonesian",
  "address": { "@type": "PostalAddress", "streetAddress": "Bumi Amas, depan Kantor Camat Bengkayang", "addressLocality": "Bengkayang", "addressRegion": "Kalimantan Barat", "addressCountry": "ID" },
  "telephone": "+6281649470780",
  "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], "opens": "08:00", "closes": "21:00" }],
  "priceRange": "$$"
}`,
    status: 'pending',
  },
  {
    id: 'sitemap',
    title: 'Sitemap.xml',
    why_it_matters: 'Generate public/sitemap.xml lalu submit ke Google Search Console. Untuk single-page site, sitemap berisi 1 URL + lastmod.',
    apply_at: 'public/sitemap.xml',
    copy_value: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://rumah-makan-semayot.com/</loc>
    <lastmod>2026-06-29</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`,
    status: 'pending',
  },
  {
    id: 'robots-txt',
    title: 'Robots.txt',
    why_it_matters: 'Izinkan semua crawler, referensikan sitemap.',
    apply_at: 'public/robots.txt',
    copy_value: `User-agent: *
Allow: /

Sitemap: https://rumah-makan-semayot.com/sitemap.xml`,
    status: 'pending',
  },
  {
    id: 'og-image',
    title: 'OG image (1200×630)',
    why_it_matters: 'Saat share ke WhatsApp/Facebook, OG image jadi preview. Rekomendasi: foto hidangan signature (Daging Asap Suwir) + logo Semayot.',
    apply_at: 'public/semayot/images/og-share.jpg',
    copy_value: null,
    status: 'pending',
  },
  {
    id: 'heading-audit',
    title: 'Heading hierarchy audit',
    why_it_matters: 'Pastikan 1× H1 di hero, berjenjang ke H2 (section), H3 (subsection). SEO crawler pakai heading structure untuk paham konten.',
    apply_at: 'components/semayot/semayot-hero.tsx + section components',
    copy_value: null,
    status: 'pending',
  },
  {
    id: 'performance-budget',
    title: 'Performance budget',
    why_it_matters: 'Target: LCP < 2.5s, CLS < 0.1, INP < 200ms. Sudah dicek via Lighthouse; pertahankan dengan limit ukuran bundle.',
    apply_at: 'next.config.ts (per-slice bundle analysis)',
    copy_value: null,
    status: 'pending',
  },
  {
    id: 'google-business',
    title: 'Google Business Profile',
    why_it_matters: 'Klaim & verifikasi listing, upload foto mingguan, balas review. Ranking local search tergantung proximity + review count.',
    apply_at: 'https://business.google.com (eksternal)',
    copy_value: null,
    status: 'pending',
  },
  {
    id: 'local-keywords',
    title: 'Local keywords',
    why_it_matters: 'Pastikan copy mengandung "Rumah Makan Dayak Bengkayang", "Makan Siang Bumi Amas", "Daging Asap Kalimantan Barat".',
    apply_at: 'components/semayot/semayot-hero.tsx (headline/subheadline)',
    copy_value: 'Rumah Makan Dayak di Bumi Amas, Bengkayang, Kalimantan Barat. Daging asap & hidangan tradisional non-halal.',
    status: 'pending',
  },
  {
    id: 'internal-linking',
    title: 'Internal linking',
    why_it_matters: 'Setiap section harus link ke WhatsApp CTA (nomor) + Google Maps embed. Meningkatkan dwell time + conversion.',
    apply_at: 'components/semayot/semayot-hero.tsx (CTA buttons)',
    copy_value: null,
    status: 'pending',
  },
];

function loadState(): Record<string, 'pending' | 'applied' | 'skipped'> {
  if (!existsSync(STATE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveState(state: Record<string, 'pending' | 'applied' | 'skipped'>) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export function getAllRecommendations(): SeoRecommendation[] {
  const state = loadState();
  return DEFAULT_RECS.map((r) => ({ ...r, status: state[r.id] ?? r.status }));
}

export function updateStatus(id: string, status: 'pending' | 'applied' | 'skipped'): SeoRecommendation | null {
  const rec = DEFAULT_RECS.find((r) => r.id === id);
  if (!rec) return null;
  const state = loadState();
  state[id] = status;
  saveState(state);
  return { ...rec, status };
}
