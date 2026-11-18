/**
 * it inspects requests, validate the bearer<token> header and extends the express's Request with req.user
 * so if we use supabase all these are the in-build
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            throw new UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedError('Invalid token format');
        }
        const decoded = verifyToken(token);
        req.user = decoded;
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
        } else {
            next(new UnauthorizedError('Invalid or expired token'));
        }
    }
};