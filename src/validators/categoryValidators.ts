// this is the zod schema for creating and updating the category in category schema
import {z} from 'zod';
export const createCategorySchema = z.object({
    name:z.string().min(1,'Name is required').max(50),
    type: z.enum(['expense','income']).default('expense'),
    color:z.string().optional(),
    icon:z.string().optional(),
})

export const updateCategorySchema = z.object({
    name:z.string().min(1).max(50).optional(),
    type:z.enum(['expense','income']).default('expense'),
    color:z.string().optional(),
    icon:z.string().optional(),
})