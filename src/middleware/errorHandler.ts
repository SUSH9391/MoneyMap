import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError, NotFoundError, ValidationError } from "../utils/errors";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    const isAppError = error instanceof AppError;
    const statusCode = isAppError ? error.statusCode : 500;
    const isProduction = process.env.NODE_ENV === "production";

    if (statusCode >= 500) {
        console.error(error);
    }

    const message =
        statusCode >= 500 && isProduction
            ? "Internal server error"
            : isAppError
              ? error.message
              : error instanceof Error
                ? error.message
                : "Internal server error";

    res.status(statusCode).json({
        success: false,
        message,
        ...(error instanceof ValidationError && error.details !== undefined
            ? { details: error.details }
            : {}),
    });
};
