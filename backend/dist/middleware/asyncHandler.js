"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Wraps async route handlers to catch errors automatically
 * Without this, unhandled promise rejections can crash the server
 *
 * Usage:
 * router.post('/session', asyncHandler(async (req, res) => {
 *   const result = await someAsyncWork();
 *   res.json(result);
 * }));
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
