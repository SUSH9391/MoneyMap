import{Request, Response, NextFunction} from 'express';
import {AppError, ValidationError} from '../../src/utils/errors';

export const errorHandler = (
    err : Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof SyntaxError && 'body' in err){ // if the req body has syntax mistakes or any forigen items
        return res.status(400).json({
            success:false,
            message:'Invalid JSON payload'
        })
    }
    if (err instanceof ValidationError) {
        return res.status(err.statusCode).json({
            success:false,
            message: err.message,
            errors: err.details,
        })
    }
    if (err instanceof AppError){
        return res.status(err.statusCode).json({
            success:false,
            message:err.message
        })
    }
    console.error('Error:',err);
    return res.status(500).json({
        success:false,
        message:'Internal server error'
    })
}