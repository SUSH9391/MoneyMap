import { Request, Response, NextFunction } from 'express';

export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**asyncHandler is a reusable higher-order function that accepts an asynchronous Express controller as an argument and returns a middleware function.

It executes the controller with the incoming request, response, and next arguments. By wrapping the controller's returned value with Promise.resolve(), we can handle both Promise-based and non-Promise return values.

If the controller's Promise gets rejected, .catch(next) forwards the error to Express's centralized error-handling middleware.

This eliminates the need to write repetitive try-catch blocks in every asynchronous controller and keeps our code clean and maintainable. */