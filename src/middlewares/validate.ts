//this is a helper function that executes any zod schema against req.body and returns a clean message if validation fails
// we have already written the zod schemas now this is the code to execute the zod schema 
import { Request, Response, NextFunction } from 'express';
import { z, ZodType } from 'zod';
import {ValidationError} from '../utils/errors.js'

export const validate = (schema: ZodType, source: 'body' | 'query' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(source == 'query' ? req.query : req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                next(new ValidationError('Validation failed', errors));
            } else {
                next(error);
            }
        }
    }
}
