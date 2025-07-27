// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check for a valid x-user-id header.
 * If valid, it attaches the userId to the request object.
 * If not, it sends a 401 Unauthorized response.
 */
export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const userIdHeader = req.headers['x-user-id'] as string;
  const userId = parseInt(userIdHeader, 10);

  if (!userId || isNaN(userId)) {
    return res.status(401).json({ message: 'Unauthorized: User ID is missing or invalid' });
  }
  req.userId = userId;
  next();
};