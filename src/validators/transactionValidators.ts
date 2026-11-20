//schema validation with the help of zod
import {z} from 'zod';

export const createTransactionSchema = z.object({
  categoryId: z.uuid('Invalid category ID'),
  budgetId: z.uuid('Invalid budget ID').optional(),
  type: z.enum(['expense', 'income']).default('expense'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().max(255).optional(),
  date: z.iso.datetime('Invalid date').optional(),
});

export const updateTransactionSchema = z.object({
  categoryId: z.uuid('Invalid category ID').optional(),
  budgetId: z.uuid('Invalid budget ID').optional().nullable(),
  type: z.enum(['expense', 'income']).optional(),
  amount: z.number().positive('Amount must be greater than 0').optional(),
  description: z.string().max(255).optional(),
  date: z.iso.datetime('Invalid date').optional(),
});
