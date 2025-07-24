import {Request, Response } from 'express';
import { FavoriteCity } from '../types';
import { weatherService } from '../services/weatherService';


export class WeatherController {

  private favorites: FavoriteCity[] = [];
  private nextId = 1;// Helper to simulate SERIAL PRIMARY KEY

  //Implementing the current endpoint
  public getCurrentWeather= async (req: Request, res: Response) => {
    try {
      const { city } = req.params;
      const weatherData = await weatherService.fetchCurrentWeather(city);
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

    if (!city_name || !country_code) {
      return res.status(400).json({ message: 'city_name and country_code are required' });
    }

    const newFavorite: FavoriteCity = {
      id: this.nextId++,
      city_name: city_name,
      country_code: country_code,
      user_id: 1,
      added_at: new Date(),
    };

    this.favorites.push(newFavorite);
    res.status(201).json(newFavorite);
  }

  public getFavorites = async (req: Request, res: Response) => {
    res.status(200).json({
      favorites: this.favorites,
    });
  }
  public deleteFavorite = async (req: Request, res: Response) => {
    // Get the ID from the URL parameters and convert it to a number
    const idToDelete = parseInt(req.params.id, 10);
    const favoriteIndex = this.favorites.findIndex(fav => fav.id === idToDelete);
    // If not found, return a 404 error
    if (favoriteIndex === -1) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    this.favorites.splice(favoriteIndex, 1);

    // Return the success message required by the test
    res.status(200).json({
      message: 'Favorite removed successfully',
      id: idToDelete,
    });
  }
  public _resetState() {
    this.favorites = [];
    this.nextId = 1; 
  }
  
}

export const weatherController = new WeatherController();