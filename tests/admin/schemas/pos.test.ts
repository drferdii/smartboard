import { describe, it, expect } from 'vitest';
import { posCreateSchema } from '@/lib/admin/schemas/pos';

describe('posCreateSchema', () => {
  it('accepts valid input with items and paid', () => {
    const result = posCreateSchema.safeParse({
      items: [
        { menu_item_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 2 },
        { menu_item_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', quantity: 1 },
      ],
      paid_cents: 100000,
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional note', () => {
    const result = posCreateSchema.safeParse({
      items: [{ menu_item_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 1 }],
      paid_cents: 50000,
      note: 'Pelanggan VIP',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty items array', () => {
    const result = posCreateSchema.safeParse({
      items: [],
      paid_cents: 1000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid menu_item_id (not UUID)', () => {
    const result = posCreateSchema.safeParse({
      items: [{ menu_item_id: 'not-a-uuid', quantity: 1 }],
      paid_cents: 1000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero or negative quantity', () => {
    const r1 = posCreateSchema.safeParse({
      items: [{ menu_item_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 0 }],
      paid_cents: 1000,
    });
    const r2 = posCreateSchema.safeParse({
      items: [{ menu_item_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: -1 }],
      paid_cents: 1000,
    });
    expect(r1.success).toBe(false);
    expect(r2.success).toBe(false);
  });

  it('rejects negative paid_cents', () => {
    const result = posCreateSchema.safeParse({
      items: [{ menu_item_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 1 }],
      paid_cents: -100,
    });
    expect(result.success).toBe(false);
  });
});
