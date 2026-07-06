import { z } from 'zod';

export const menuCategoryEnum = z.enum(['dayak', 'smoked', 'pedas', 'minuman']);

export const menuItemCreateSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(100),
  description: z.string().max(500).optional(),
  price_cents: z.number().int().nonnegative('Harga tidak boleh negatif'),
  category: menuCategoryEnum,
  photo_url: z.string().url().optional().or(z.literal('')),
  badge: z.string().max(50).optional().or(z.literal('')),
});

export const menuItemUpdateSchema = menuItemCreateSchema.partial();

export type MenuItemCreate = z.infer<typeof menuItemCreateSchema>;
export type MenuItemUpdate = z.infer<typeof menuItemUpdateSchema>;
