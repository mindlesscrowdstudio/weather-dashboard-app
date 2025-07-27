// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handling middleware.
 * Catches errors from asyncHandlerUtility and formats the response.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("An error occurred:", err);

  // Handle structured API errors from the weatherService
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }
  // Handle unique constraint violation errors from the database
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Resource already exists or conflicts.' });
  }

  res.status(500).json({ message: 'Internal Server Error' });
};
