import { Request, Response, NextFunction } from 'express';

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
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
