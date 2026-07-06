import { describe, it, expect } from 'vitest';
import { menuItemCreateSchema, menuItemUpdateSchema } from '@/lib/admin/schemas/menu';

describe('menuItemCreateSchema', () => {
  it('accepts valid full input', () => {
    const result = menuItemCreateSchema.safeParse({
      name: 'Daging Asap Suwir',
      description: 'Daging asap khas Semayot',
      price_cents: 45000_00,
      category: 'dayak',
      photo_url: 'https://example.com/photo.jpg',
      badge: 'Favorit',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = menuItemCreateSchema.safeParse({
      name: '',
      price_cents: 1000_00,
      category: 'dayak',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = menuItemCreateSchema.safeParse({
      name: 'Test',
      price_cents: -100,
      category: 'dayak',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = menuItemCreateSchema.safeParse({
      name: 'Test',
      price_cents: 1000_00,
      category: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('menuItemUpdateSchema', () => {
  it('makes all fields optional', () => {
    const result = menuItemUpdateSchema.safeParse({ name: 'Updated' });
    expect(result.success).toBe(true);
  });
});
