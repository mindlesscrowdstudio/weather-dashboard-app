//backend/src/controllers/weatherController.ts
import {Request, Response } from 'express';
import { FavoriteCity, SearchHistoryItem, WeatherData } from '../types';
import { weatherService } from '../services/weatherService';


export class WeatherController {

  private favorites: FavoriteCity[] = [];
  private history: SearchHistoryItem[] = [];
  private nextFavoriteId = 1;// Helper to simulate SERIAL PRIMARY KEY
  private nextHistoryId = 1;

  //Implementing the current endpoint
  public getCurrentWeather= async (req: Request, res: Response) => {
    try {
      const { city } = req.params;
      const userId = parseInt(req.headers["x-user-id"] as string, 10); 
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const weatherData: WeatherData = await weatherService.fetchCurrentWeather(city);
      //history successful search from the new interface
      const newHistoryItem: SearchHistoryItem = {
        id: this.nextHistoryId++,
        user_id: userId,
        city_name: weatherData.name,
        country_code: weatherData.sys.country,
        searched_at: new Date(),
        weather_data: weatherData,
      }
      // Add to the beginning of the array and keep only the last 10 searches
      this.history.unshift(newHistoryItem);
      this.history = this.history.slice(0, 10);

      res.status(200).json(weatherData);  
    } catch (error: any) {
      // The service now throws a structured error, which we can use directly
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('Unexpected error in getCurrentWeather:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  //  Implementing the forecast endpoint
  public getForecast = async (req: Request, res: Response) => {
    try {
      const { city } = req.params;
      const forecastData = await weatherService.fetchWeatherForecast(city);
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
    const { city_name, country_code } = req.body;
    const userId = parseInt(req.headers["x-user-id"] as string, 10);

    if(!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    if (!city_name || !country_code) {
      return res.status(400).json({ message: 'city_name and country_code are required' });
    }

    const newFavorite: FavoriteCity = {
      id: this.nextFavoriteId++,
      city_name: city_name,
      country_code: country_code,
      user_id: userId,
      added_at: new Date(),
    };

    this.favorites.push(newFavorite);
    res.status(201).json(newFavorite);
  }

  public getFavorites = async (req: Request, res: Response) => {

    const userId = parseInt(req.headers["x-user-id"] as string, 10);

    if(!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const favoritesForUser = this.favorites.filter(fav => fav.user_id === userId);

    res.status(200).json({
      favorites: favoritesForUser,
    });
  }
  public deleteFavorite = async (req: Request, res: Response) => {
    // Get the ID from the URL parameters and convert it to a number
    const idToDelete = parseInt(req.params.id, 10);
    const userId = parseInt(req.headers["x-user-id"] as string, 10);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const favoriteIndex = this.favorites.findIndex(fav => fav.id === idToDelete && fav.user_id === userId);

    // If not found, return a 404 error
    if (favoriteIndex === -1) {
      return res.status(404).json({ message: 'Favorite not found or does not belong to User.' });
    }
    this.favorites.splice(favoriteIndex, 1);

    // Return the success message required by the test
    res.status(200).json({
      message: 'Favorite removed successfully',
      id: idToDelete,
    });
  }
  
  public getHistory = async (req: Request, res: Response) => {
    const userId = parseInt(req.headers["x-user-id"] as string, 10);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const historyForUser = this.history.filter(item => item.user_id === userId); 

    res.status(200).json({
      history: historyForUser,
    });
  }
  public _resetState() {
    this.favorites = [];
    this.history = [];
    this.nextFavoriteId = 1; 
    this.nextHistoryId = 1;
  }
  
}

export const weatherController = new WeatherController();//singleton