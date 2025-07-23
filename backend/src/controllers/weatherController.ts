import {Request, Response } from 'express';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export class WeatherController {
  async getCurrentWeather(req: Request, res: Response) {
    try {
      const {city } = req.params;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

      const apiResponse = await fetch(url);
      if (!apiResponse.ok) {
        // first scenario city NOT found
        return res.status(404).json({ message: 'Sorry, City not found' });
      }

      const weatherData = await apiResponse.json();
      console.log('--- Sending this data: ---', weatherData); 

      // second scenario city found
      res.status(200).json(weatherData);

    } catch (error) {
      res.status(404).json({
        message: 'Sorry, City not found',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Cycle 2: Implementing the forecast endpoint
  async getForecast(req: Request, res: Response) {
    try {
      const { city } = req.params;
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

      const apiResponse = await fetch(url);

      if(!apiResponse.ok) {
        // change messafge to differ from current weather
        // defensive code
        return res.status(404).json({ message: 'city not found' });
      }
      const forecastData = await apiResponse.json();

      console.log('--- Forecast data received: ---');
      // Log with full object to see full data
      //console.log(JSON.stringify(forecastData, null, 2));
      // Node mode
      console.dir(forecastData, { depth: null });

      // happy scenario:
      res.status(200).json(forecastData);

    } catch (error) {
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  }
}


export const weatherController = new WeatherController();