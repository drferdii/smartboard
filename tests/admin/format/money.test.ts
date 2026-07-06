import { describe, it, expect } from 'vitest';
import { formatRupiah, parseRupiahToCents } from '@/lib/admin/format/money';

describe('formatRupiah', () => {
  it('formats cents to Rupiah string with dot separator', () => {
    expect(formatRupiah(45000_00)).toBe('Rp 45.000');
    expect(formatRupiah(0)).toBe('Rp 0');
    expect(formatRupiah(1234567_89)).toBe('Rp 1.234.567,89');
  });

  it('handles negative values (refunds)', () => {
    expect(formatRupiah(-5000_00)).toBe('-Rp 5.000');
  });
});

describe('parseRupiahToCents', () => {
  it('parses "Rp 45.000" to 4500000 cents', () => {
    expect(parseRupiahToCents('Rp 45.000')).toBe(45000_00);
  });

  it('parses "45000" to 4500000 cents', () => {
    expect(parseRupiahToCents('45000')).toBe(45000_00);
  });

  it('parses with comma decimal', () => {
    expect(parseRupiahToCents('Rp 1.234.567,89')).toBe(1234567_89);
  });

  it('returns null for invalid input', () => {
    expect(parseRupiahToCents('abc')).toBe(null);
    expect(parseRupiahToCents('')).toBe(null);
  });

  it('parses negative values (refunds)', () => {
    expect(parseRupiahToCents('-Rp 5.000')).toBe(-5000_00);
    expect(parseRupiahToCents('-1234')).toBe(-1234_00);
  });
});
