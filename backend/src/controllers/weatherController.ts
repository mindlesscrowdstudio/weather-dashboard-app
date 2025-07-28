//backend/src/controllers/weatherController.ts
import {Request, Response } from 'express';
import { FavoriteCity, SearchHistoryItem, WeatherData, ForecastData } from '../types';
import { weatherService } from '../services/weatherService';
import pool from '../config/database';
import { getFromCache } from '../utils/cacheUtility';

export class WeatherController {
 
  //Implementing endpoint
  public getCurrentWeather= async (req: Request, res: Response) => {
      const { city } = req.params;
      const userId = req.userId!; // Non-null assertion: middleware guarantees it exists
      
      //Check for a fresh cache entry using the utility
      let weatherData = await getFromCache<WeatherData>(city, 'current_weather_data', 10);

      
      if (!weatherData) {
        const apiData = await weatherService.fetchCurrentWeather(city);
        //  Update cache with new data using UPSERT
        await pool.query(
          `INSERT INTO weather_cache (city_id, city_name, country_code, current_weather_data, last_updated)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (city_id) DO UPDATE SET
            current_weather_data = EXCLUDED.current_weather_data,
            city_name = EXCLUDED.city_name,
            country_code = EXCLUDED.country_code,
            last_updated = NOW()`,
          [apiData.id, apiData.name, apiData.sys.country, JSON.stringify(apiData)]
        );
        weatherData = apiData;
      }

      
      if (!weatherData) {
        throw new Error("Failed to retrieve weather data for the specified city.");
      }
      await this._logSearchHistory(userId, weatherData.name, weatherData.sys.country, weatherData);
      res.status(200).json(weatherData);
  }

  //  Implementing forecast endpoint
  public getForecast = async (req: Request, res: Response) => {
      const { city } = req.params;
      const userId = req.userId!;
      
      let forecastData = await getFromCache<ForecastData>(city, 'forecast_data', 30);
      
      if (!forecastData) {
        const apiData = await weatherService.fetchWeatherForecast(city);
        await pool.query(
          `INSERT INTO weather_cache (city_id, city_name, country_code, forecast_data, last_updated)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (city_id) DO UPDATE SET
             forecast_data = EXCLUDED.forecast_data,
             city_name = EXCLUDED.city_name,
             country_code = EXCLUDED.country_code,
             last_updated = NOW()`,
          [apiData.city.id, apiData.city.name, apiData.city.country, JSON.stringify(apiData)]
        );
        forecastData = apiData;
      }

      if (!forecastData) {
        throw new Error("Failed to retrieve forecast data for the specified city.");
      }
      await this._logSearchHistory(userId, forecastData.city.name, forecastData.city.country, forecastData);
      res.status(200).json(forecastData);
  }
  // Implementing the addFavorite endpoint
  public addFavorite = async (req: Request, res: Response) => {
      const { city_name, country_code } = req.body;
      const userId = req.userId!;
      if (!city_name || !country_code) {
        return res.status(400).json({ message: 'city_name and country_code are required' });
      }
      // Save to database instead of in-memory array
      const result = await pool.query<FavoriteCity>(
        `INSERT INTO favorite_cities (user_id, city_name, country_code) 
          VALUES ($1, $2, $3) 
          RETURNING id, user_id, city_name, country_code, added_at`,
        [userId, city_name, country_code],
      );
    
      const newFavorite: FavoriteCity = result.rows[0];
      res.status(201).json(newFavorite);
  }

  public getFavorites = async (req: Request, res: Response) => {
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
  }

  public deleteFavorite = async (req: Request, res: Response) => {
      const favoriteId = Number.parseInt(req.params.id, 10);
      const userId = req.userId!;
      if (isNaN(favoriteId)) {
        return res.status(400).json({ message: 'Invalid favorite ID' });
      }
      //Delete from database instead of in-memory array
      const result = await pool.query(
        `DELETE FROM favorite_cities 
         WHERE id = $1 AND user_id = $2 
         RETURNING id`,
        [favoriteId, userId],
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Favorite not found or does not belong to User.' });
      }
      res.status(200).json({
        message: 'Favorite removed successfully',
        id: favoriteId,
      });
  }
  // Gets from database
  public getHistory = async (req: Request, res: Response) => {
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
    res.status(200).json({
     history
    });
  }

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