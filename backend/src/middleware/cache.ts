// backend/src/middleware/cache.ts
import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

const CACHE_EXPIRATION_SECONDS = 3600; // 1 hour
/**
 * caching logic. It will incercept requests to your weather endpoints, 
 * Check for cached data
 * Return it or pass the request to the controller.
 */
export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = `weather:${req.params.city.toLowerCase()}:${
    req.path.includes('/forecast') ? 'forecast' : 'current'
  }`;

  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      console.log(`CACHE HIT for key: ${key}`);
      return res.json(JSON.parse(cachedData));
    }

    console.log(`CACHE MISS for key: ${key}`);
    next();
  } catch (error) {
    console.error('Redis error:', error);
    next(); // On error, proceed without cache
  }
};