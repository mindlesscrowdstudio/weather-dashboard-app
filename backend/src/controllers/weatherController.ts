import { error } from 'console';
import {Request, Response } from 'express';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export class WeatherController {

  private favorites: string[] = [];

//  Implementing the current endpoint
  async getCurrentWeather(req: Request, res: Response) {
    try {
      const { city } = req.params;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      const apiResponse = await fetch(url);

      if (!apiResponse.ok) {
        // Handle errors (like 404) from the API here
        const errorData = await apiResponse.json();
        return res.status(apiResponse.status).json({ message: errorData.message || 'Error fetching current weather' });
      }

      const weatherData = await apiResponse.json();
      res.status(200).json(weatherData);

    } catch (error) {
      console.error('Unexpected error in getCurrentWeather:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  //  Implementing the forecast endpoint
  async getForecast(req: Request, res: Response) {
    try {
      const { city } = req.params;
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

      const apiResponse = await fetch(url);

      if(!apiResponse.ok) {
        // use eror from the API
        // defensive code
        const errorForecastResponse = await apiResponse.json();
        console.error('Error fetching forecast data:', errorForecastResponse);
        return res.status(apiResponse.status).json({
          message: errorForecastResponse.message || 'Error fetching forecast api data',
        });
      }
      const forecastData = await apiResponse.json();

      console.log('--- Forecast data received: ---');
      // Log with full object to see full data
      //console.log(JSON.stringify(forecastData, null, 2));
      // Node mode
      console.dir(forecastData, { depth: null });

      res.status(200).json(forecastData);

    } catch (error) {
      console.error('Unexpected error in getForecast:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  }
  // Implementing the addFavorite endpoint
  async addFavorite(req: Request, res: Response) {
    
      const { city } = req.body;

      // TODO: save the favorite city to a database
      // For now, we will just return a success message
      res.status(201).json({ 
        message: 'City added to favorites',
        city: city,
      });
  }
}


export const weatherController = new WeatherController();