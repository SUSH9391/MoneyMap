//this is a schema validation code which helps us validate the types with the help of zod

import { z } from 'zod';

export const createBudgetSchema = z.object({
    categoryId: z.uuid('Invalid category Id'),
    name: z.string().min(1, "Name of the budget is required").max(100),
    amount: z.number().positive('Amount must be greater then 0'),
    currency: z.currencyCode().default('INR'),//im developing this for india
    period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    startDate: z.iso.datetime('Invalid start date'),
    endDate: z.iso.datetime('Invalid end date').optional(),

});

export const updateBudgetSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    amount: z.number().positive('Amount must be greater than 0'),
    currency: z.string().optional(),
    period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    startDate: z.iso.datetime('Invalide start date').optional(),
    endDate: z.iso.datetime('Invalid end date').optional(),
    isActive: z.boolean().optional()
})
