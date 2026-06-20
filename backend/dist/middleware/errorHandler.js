"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
/**
 * Custom error class with HTTP status code
 * Operational errors are expected errors we can handle gracefully
 */
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
/**
 * Global error handling middleware
 * MUST be registered AFTER all routes in app.ts
 */
const errorHandler = (err, req, res, next) => {
    // Known operational errors (validation, not found, etc.)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }
    // Unknown errors - log everything
    console.error('❌ Unexpected error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && {
            message: err.message,
            stack: err.stack,
        }),
    });
};
exports.errorHandler = errorHandler;
