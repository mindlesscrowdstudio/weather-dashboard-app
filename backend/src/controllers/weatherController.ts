import {Request, Response } from 'express';

export class WeatherController {
  async getCurrentWeather(req: Request, res: Response) {
    // Hardcoded responses for the first cycle
    res.status(404).json({
      message: 'Sorry, City not found'
    });
  }
}

export const weatherController = new WeatherController();