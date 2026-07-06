import { z } from 'zod';

export const expenseCategoryEnum = z.enum(['bahan', 'operasional', 'gaji', 'lain']);

export const expenseCreateSchema = z.object({
  category: expenseCategoryEnum,
  amount_cents: z.number().int().nonnegative('Nominal tidak boleh negatif'),
  description: z.string().max(500).optional().or(z.literal('')),
  incurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD').optional(),
});

export type ExpenseCreate = z.infer<typeof expenseCreateSchema>;
