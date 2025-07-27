//backend/src/controllers/weatherController.ts
import {Request, Response } from 'express';
import { FavoriteCity, SearchHistoryItem, WeatherData, ForecastData } from '../types';
import { weatherService } from '../services/weatherService';
import pool from '../config/database';

export class WeatherController {
 
  //Implementing the current endpoint
  public getCurrentWeather= async (req: Request, res: Response) => {
    try {
      const { city } = req.params;
      const userId = req.userId!; // Non-null assertion: middleware guarantees it exists

      const CACHE_DURATION_MINUTES = 10;
      let weatherData: WeatherData | undefined;

      // 1. Check for a fresh cache entry
      const cacheResult = await pool.query(
        `SELECT current_weather_data, last_updated FROM weather_cache WHERE LOWER(city_name) = LOWER($1)`,
        [city]
      );
      // Use a truthy check for rowCount, as its type can be `number | null`
      if (cacheResult.rowCount) {
        const cacheEntry = cacheResult.rows[0];
        const lastUpdated = new Date(cacheEntry.last_updated);
        const ageInMinutes = (new Date().getTime() - lastUpdated.getTime()) / 60000;

        if (ageInMinutes < CACHE_DURATION_MINUTES) {
          console.log(`CACHE HIT for current weather: ${city}`);
          weatherData = cacheEntry.current_weather_data;
        }
      }
      // 2. If cache miss or stale, fetch from API
      if (!weatherData) {
        console.log(`CACHE MISS for current weather: ${city}`);
        const apiData = await weatherService.fetchCurrentWeather(city);
        // 3. Update cache with new data using UPSERT
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

      // Type guard to ensure weatherData is defined before use.
      if (!weatherData) {
        // This should not be reachable if the API/cache logic is correct.
        throw new Error("Failed to retrieve weather data for the specified city.");
      }
      await pool.query(
        `INSERT INTO weather_history (user_id, city_name, country_code, weather_data) 
         VALUES ($1, $2, $3, $4)`,
         [userId, weatherData.name, weatherData.sys.country, JSON.stringify(weatherData)],
      )
      // 5. Send response
      res.status(200).json(weatherData);
    } catch (error: any) {
      // Handles structured errors from the service (401, 404, etc.)
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      // Add a fallback for unexpected errors
      console.error("Unexpected error in the getCurrentWeather: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  //  Implementing forecast endpoint
  public getForecast = async (req: Request, res: Response) => {
    try {
      const { city } = req.params;
      const userId = req.userId!;
      const CACHE_DURATION_MINUTES = 30; // reduce if needed
      let forecastData: ForecastData | undefined;

      const cacheResult = await pool.query(
        `SELECT forecast_data, last_updated FROM weather_cache WHERE LOWER(city_name) = LOWER($1)`,
        [city]
      );

      if (cacheResult.rowCount && cacheResult.rows[0].forecast_data) {
        const cacheEntry = cacheResult.rows[0];
        const lastUpdated = new Date(cacheEntry.last_updated);
        const ageInMinutes = (new Date().getTime() - lastUpdated.getTime()) / 60000;

        if (ageInMinutes < CACHE_DURATION_MINUTES) {
          console.log(`CACHE HIT for forecast: ${city}`);
          forecastData = cacheEntry.forecast_data;
        }
      }

      if (!forecastData) {
        console.log(`CACHE MISS for forecast: ${city}`);
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

      // Type guard to ensure forecastData is defined before use.
      if (!forecastData) {
        // This should not be reachable if the API/cache logic is correct.
        throw new Error("Failed to retrieve forecast data for the specified city.");
      }
      //Log forecast search to the user's history 
      await pool.query(
        `INSERT INTO weather_history (user_id, city_name, country_code, weather_data) 
         VALUES ($1, $2, $3, $4)`,
        [userId, forecastData.city.name, forecastData.city.country, JSON.stringify(forecastData)],
      );
      res.status(200).json(forecastData);
    } catch (error: any) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('Unexpected error in getForecast:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  // Implementing the addFavorite endpoint
  public addFavorite = async (req: Request, res: Response) => {
    
    try {  
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
    } catch(error: any) {
      if(error.code === '23505') {
      
        return res.status(409).json( {message: 'City is already in favorites'});
      }
      console.error('Unexpected error in addFavorite:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  public getFavorites = async (req: Request, res: Response) => {
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
    } catch (error: any) {
      console.error("Unexpected error in getFavorites:", error)
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
  //Delete from DB
  public deleteFavorite = async (req: Request, res: Response) => {

    try {
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
      // Return the success message required by the test
      res.status(200).json({
        message: 'Favorite removed successfully',
        id: favoriteId,
      });
    } catch (error: any) {
      console.error('Unexpected error in deleteFavorite:', error)
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  // Gets from database
  public getHistory = async (req: Request, res: Response) => {
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
    res.status(200).json({
     history
    });
   } catch(error: any) {
      console.error('Unexpected error in getHistory:', error)
      res.status(500).json({ message: 'Internal Server Error' });
   }
  }
  
 
  
}

export const weatherController = new WeatherController();//singleton