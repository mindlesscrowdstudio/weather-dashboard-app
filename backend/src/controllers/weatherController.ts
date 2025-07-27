//backend/src/controllers/weatherController.ts
import {Request, Response } from 'express';
import { FavoriteCity, SearchHistoryItem, WeatherData, ForecastData } from '../types';
import { weatherService } from '../services/weatherService';
import pool from '../config/database';


export class WeatherController {
 
  //Helper method to get userID from request Headers
  private getUserId(req: Request): number {
    const userId = parseInt(req.headers["x-user-id"] as string, 10);
    if(!userId) throw new Error("User ID is required");  
    return userId;
  }

  //Implementing the current endpoint
  public getCurrentWeather= async (req: Request, res: Response) => {
    try {
      const { city } = req.params;
      const userId = this.getUserId(req);
 
      const weatherData: WeatherData = await weatherService.fetchCurrentWeather(city);
      //save to db instead of in-memory array
      await pool.query(
        `INSERT INTO weather_history (user_id, city_name, country_code, weather_data) 
         VALUES ($1, $2, $3, $4)`,
         [userId, weatherData.name, weatherData.sys.country, JSON.stringify(weatherData)],
      )
      res.status

      res.status(200).json(weatherData);  
    } catch (error: any) {
      // The service now throws a structured error, which we can use directly
      if(error.status === 404) {
        return res.status(404).json({message: error.message});
      }
      if(error.message === 'User ID is required' || error.message === "Invalid User ID") {
        return res.status(400).json({ message: error.message });
      }
      console.error("Unexpected error in the getCurrentWeather: ", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  //  Implementing the forecast endpoint
  public getForecast = async (req: Request, res: Response) => {
    try {
      const { city } = req.params;
      const forecastData: ForecastData = await weatherService.fetchWeatherForecast(city);
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
      const userId = this.getUserId(req);
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
      if(error.message === 'User ID is required'  || error.message === 'Invalid UserID') {
        return res.status(400).json( {message: error.message});
      }
      if(error.code === '23505') {
        //constraint violation
        return res.status(409).json( {message: 'City is already in favorites'});
      }
      console.error('Unexpected error in addFavorite:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }// end public addFavorite

  public getFavorites = async (req: Request, res: Response) => {
    try {
      const userId = this.getUserId(req);
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
      if (error.message === 'User ID is required' || error.message === 'Invalid User ID') {
        return res.status(400).json({ message: error.message })
      }
      console.error("Unexpected error in getFavorites:", error)
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
  //Delete from DB
  public deleteFavorite = async (req: Request, res: Response) => {

    try {
      const userId = this.getUserId(req);
      const favoriteId = Number.parseInt(req.params.id, 10);
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
      if (error.message === 'User ID is required' || error.message === 'Invalid User ID') {
        return res.status(400).json({ message: error.message })
      }
      console.error('Unexpected error in deleteFavorite:', error)
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  // Gets from database
  public getHistory = async (req: Request, res: Response) => {
    try {
      const userId = this.getUserId(req);
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
    if (error.message === 'User ID is required' || error.message === 'Invalid User ID') {
        return res.status(400).json({ message: error.message })
      }
      console.error('Unexpected error in getHistory:', error)
      res.status(500).json({ message: 'Internal Server Error' });
   }
  }
  
 
  
}

export const weatherController = new WeatherController();//singleton