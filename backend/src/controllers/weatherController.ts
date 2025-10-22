import { Request, Response, NextFunction } from 'express';
import { FavoriteCity, SearchHistoryItem, WeatherData, ForecastData } from '../types';
import { weatherService } from '../services/weatherService';
import redisClient from '../config/redis'; // Import the new Redis client
import pool from '../config/database';

// Cache expires in 1 hour
const CACHE_EXPIRATION_SECONDS = 3600;

export class WeatherController {
 
  public getCurrentWeather = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { city } = req.params;
      const userId = req.userId!;
      const cacheKey = `weather:current:${city.toLowerCase()}`;

      // Gracefully handle cache checks
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          console.log(`CACHE HIT for key: ${cacheKey}`);
          const weatherData = JSON.parse(cachedData) as WeatherData;
          await this._logSearchHistory(userId, weatherData.name, weatherData.sys.country, weatherData);
          return res.status(200).json(weatherData);
        }
        console.log(`CACHE MISS for key: ${cacheKey}`);
      } catch (cacheError) {
        console.error('Redis GET or JSON.parse error. Proceeding as cache miss.', cacheError);
      }

      const weatherData = await weatherService.fetchCurrentWeather(city);
      await redisClient.set(cacheKey, JSON.stringify(weatherData), 'EX', CACHE_EXPIRATION_SECONDS);

      await this._logSearchHistory(userId, weatherData.name, weatherData.sys.country, weatherData);
      res.status(200).json(weatherData);
    } catch (error) {
      next(error);
    }
  };

  public getForecast = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { city } = req.params;
      const userId = req.userId!;
      const cacheKey = `weather:forecast:${city.toLowerCase()}`;

      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          console.log(`CACHE HIT for key: ${cacheKey}`);
          const forecastData = JSON.parse(cachedData) as ForecastData;
          await this._logSearchHistory(userId, forecastData.city.name, forecastData.city.country, forecastData);
          return res.status(200).json(forecastData);
        }
        console.log(`CACHE MISS for key: ${cacheKey}`);
      } catch (cacheError) {
        console.error('Redis GET or JSON.parse error. Proceeding as cache miss.', cacheError);
      }

      const forecastData = await weatherService.fetchWeatherForecast(city);
      await redisClient.set(cacheKey, JSON.stringify(forecastData), 'EX', CACHE_EXPIRATION_SECONDS);

      await this._logSearchHistory(userId, forecastData.city.name, forecastData.city.country, forecastData);
      res.status(200).json(forecastData);
    } catch (error) {
      next(error);
    }
  };

  public addFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { city_name, country_code } = req.body;
      const userId = req.userId!;
      if (!city_name || !country_code) {
        return res.status(400).json({ message: 'city_name and country_code are required' });
      }
      const result = await pool.query<FavoriteCity>(
        `INSERT INTO favorite_cities (user_id, city_name, country_code) 
          VALUES ($1, $2, $3) 
          RETURNING id, user_id, city_name, country_code, added_at`,
        [userId, city_name, country_code],
      );

      const newFavorite: FavoriteCity = result.rows[0];
      res.status(201).json(newFavorite);
    } catch (error) {
      next(error);
    }
  };

  public getFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const result = await pool.query<FavoriteCity>(
        `SELECT id, user_id, city_name, country_code, added_at 
         FROM favorite_cities 
         WHERE user_id = $1 
         ORDER BY added_at DESC`,
        [userId],
      );
      const favorites: FavoriteCity[] = result.rows;
      res.status(200).json({ favorites });
    } catch (error) {
      next(error);
    }
  };

  public deleteFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const favoriteId = Number.parseInt(req.params.id, 10);
      const userId = req.userId!;
      if (isNaN(favoriteId)) {
        return res.status(400).json({ message: 'Invalid favorite ID' });
      }
      const result = await pool.query(
        `DELETE FROM favorite_cities 
         WHERE id = $1 AND user_id = $2 
         RETURNING id`,
        [favoriteId, userId],
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Favorite not found or does not belong to user.' });
      }
      res.status(200).json({
        message: 'Favorite removed successfully',
        id: favoriteId,
      });
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const result = await pool.query<SearchHistoryItem>(
        `SELECT id, user_id, city_name, country_code, searched_at, weather_data 
         FROM weather_history 
         WHERE user_id = $1 
         ORDER BY searched_at DESC 
         LIMIT 10`,
        [userId],
      );
      const history: SearchHistoryItem[] = result.rows;
      res.status(200).json({ history });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logs a search to the history table, but only if the same city hasn't been searched by the same user within a defined time.
   * 
   */
  private async _logSearchHistory(
    userId: number,
    cityName: string,
    countryCode: string,
    weatherData: WeatherData | ForecastData
  ) {
    const DUPLICATE_THRESHOLD_MINUTES = 10;

    const lastSearch = await pool.query<{ searched_at: string }>(
      `SELECT searched_at FROM weather_history
       WHERE user_id = $1 AND city_name = $2
       ORDER BY searched_at DESC
       LIMIT 1`,
      [userId, cityName]
    );

    if (lastSearch.rowCount) {
      const lastSearchedAt = new Date(lastSearch.rows[0].searched_at);
      const minutesSinceLastSearch = (new Date().getTime() - lastSearchedAt.getTime()) / (1000 * 60);

      if (minutesSinceLastSearch < DUPLICATE_THRESHOLD_MINUTES) {
        return; 
      }
    }

    await pool.query(
      `INSERT INTO weather_history (user_id, city_name, country_code, weather_data) VALUES ($1, $2, $3, $4)`,
      [userId, cityName, countryCode, JSON.stringify(weatherData)]
    );
  }
}

export const weatherController = new WeatherController();//singleton