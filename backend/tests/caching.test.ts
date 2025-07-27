import request from 'supertest';
import app from '../src/app';
import { createTestUser } from './setup/testDb';
import { weatherService } from '../src/services/weatherService';
import type { WeatherData, ForecastData } from '../src/types';
import pool from '../src/config/database';

jest.mock('../src/services/weatherService');
const mockedWeatherService = weatherService as jest.Mocked<typeof weatherService>;

// A function to create mock data for a unique city.
// This ensures our tests don't conflict with pre-existing cached data.
const createMockWeatherData = (cityName: string): WeatherData => ({
  id: Math.floor(Math.random() * 1000000), // Use a random ID
  name: cityName,
  coord: { lon: 10, lat: 10 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  base: 'stations',
  main: { temp: 20, feels_like: 20, temp_min: 18, temp_max: 22, pressure: 1012, humidity: 50 },
  visibility: 10000,
  wind: { speed: 5, deg: 180 },
  clouds: { all: 0 },
  dt: 1661870400,
  sys: { type: 1, id: 9000, country: 'XX', sunrise: 1661834187, sunset: 1661882248 },
  timezone: 0,
  cod: 200,
});


describe('Weather API Caching Logic', () => {
  let testUserId: number;

  beforeEach(async () => {
    // Selectively clean only the tables needed for these tests, leaving weather_cache intact.
    // This prevents erasing pre-populated cache data.
    await pool.query('TRUNCATE users, weather_history, favorite_cities RESTART IDENTITY CASCADE');
    testUserId = await createTestUser();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Close the database connection pool after all tests are done
    await pool.end();
  });

  it('should cache current weather data after the first API call (miss then hit)', async () => {
    // Use a unique city name for this test to guarantee a cache miss on the first call.
    const uniqueCity = `Alphaville-${Date.now()}`;
    const mockWeatherData = createMockWeatherData(uniqueCity);

    mockedWeatherService.fetchCurrentWeather.mockResolvedValue(mockWeatherData);

    // 1. First call (Cache Miss)
    // We expect the controller to call the weatherService.
    const res1 = await request(app)
      .get(`/api/weather/current/${uniqueCity}`)
      .set('x-user-id', testUserId.toString());

    expect(res1.status).toBe(200);
    expect(res1.body.name).toBe(uniqueCity);
    // VERIFY: The external API service was called exactly once.
    expect(mockedWeatherService.fetchCurrentWeather).toHaveBeenCalledTimes(1);

    // 2. Second call (Cache Hit)
    // We expect the controller to use the cache and NOT call the service again.
    const res2 = await request(app)
      .get(`/api/weather/current/${uniqueCity}`)
      .set('x-user-id', testUserId.toString());

    expect(res2.status).toBe(200);
    expect(res2.body.name).toBe(uniqueCity);
    // VERIFY: The external API service was NOT called a second time. The total calls is still 1.
    expect(mockedWeatherService.fetchCurrentWeather).toHaveBeenCalledTimes(1);
  });

  it('should cache forecast data after the first API call (miss then hit)', async () => {
    const uniqueCity = `Alphaville-Forecast-${Date.now()}`;
    const mockWeatherData = createMockWeatherData(uniqueCity);
    const mockForecastData: ForecastData = {
      city: { id: mockWeatherData.id, name: uniqueCity, country: 'XX' },
      list: [{ dt: 1661871600, main: { temp: 16.2 }, weather: [{ main: 'Clear' }] }],
    };

    mockedWeatherService.fetchWeatherForecast.mockResolvedValue(mockForecastData);

    // 1. First call (Cache Miss)
    const res1 = await request(app).get(`/api/weather/forecast/${uniqueCity}`).set('x-user-id', testUserId.toString());
    expect(res1.status).toBe(200);
    expect(mockedWeatherService.fetchWeatherForecast).toHaveBeenCalledTimes(1);

    // 2. Second call (Cache Hit)
    const res2 = await request(app).get(`/api/weather/forecast/${uniqueCity}`).set('x-user-id', testUserId.toString());
    expect(res2.status).toBe(200);
    expect(mockedWeatherService.fetchWeatherForecast).toHaveBeenCalledTimes(1);
  });
});
