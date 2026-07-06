/**
 * Money utilities for admin.
 * All amounts in DB are stored as integer cents to avoid floating-point errors.
 */

/**
 * Format integer cents to Indonesian Rupiah string.
 * Example: 45000_00 → "Rp 45.000"
 */
export function formatRupiah(cents: number): string {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const rupiah = Math.floor(absCents / 100);
  const sen = absCents % 100;

  const rupiahStr = rupiah.toLocaleString('id-ID');
  const senStr = sen > 0 ? `,${sen.toString().padStart(2, '0')}` : '';

  return `${isNegative ? '-' : ''}Rp ${rupiahStr}${senStr}`;
}

/**
 * Parse Rupiah string to integer cents.
 * Accepts formats: "Rp 45.000", "45000", "Rp 1.234.567,89", "-Rp 5.000" (refunds).
 * Returns null if invalid.
 */
export function parseRupiahToCents(input: string): number | null {
  const isNegative = input.trim().startsWith('-');
  const cleaned = input.replace(/[^\d,]/g, '').replace(',', '.');
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return Math.round(num * 100) * (isNegative ? -1 : 1);
}
