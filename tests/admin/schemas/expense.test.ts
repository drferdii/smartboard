import { describe, it, expect } from 'vitest';
import { expenseCreateSchema } from '@/lib/admin/schemas/expense';

describe('expenseCreateSchema', () => {
  it('accepts valid full input', () => {
    const result = expenseCreateSchema.safeParse({
      category: 'bahan',
      amount_cents: 50000_00,
      description: 'Beli daging 5kg',
    });
    expect(result.success).toBe(true);
  });

  it('accepts input without description (optional)', () => {
    const result = expenseCreateSchema.safeParse({
      category: 'operasional',
      amount_cents: 10000_00,
    });
    expect(result.success).toBe(true);
  });

  it('accepts incurred_at as YYYY-MM-DD', () => {
    const result = expenseCreateSchema.safeParse({
      category: 'gaji',
      amount_cents: 200000_00,
      incurred_at: '2026-06-15',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = expenseCreateSchema.safeParse({
      category: 'invalid',
      amount_cents: 1000_00,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = expenseCreateSchema.safeParse({
      category: 'bahan',
      amount_cents: -100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = expenseCreateSchema.safeParse({
      category: 'bahan',
      amount_cents: 1000_00,
      incurred_at: '15/06/2026',
    });
    expect(result.success).toBe(false);
  });
});
