import request from 'supertest';
import app from '../src/app';
import { createTestUser, cleanupTestData } from './setup/testDb';
import { weatherService } from '../src/services/weatherService';
import type { WeatherData } from '../src/types';

// Mock the weather service to prevent real API calls
jest.mock('../src/services/weatherService');
const mockedWeatherService = weatherService as jest.Mocked<typeof weatherService>;

// A reusable mock weather data object for 'Merida'
const MOCK_MERIDA_WEATHER_DATA: WeatherData = {
  coord: { lon: -89.62, lat: 20.97 },
  weather: [{ id: 803, main: 'Clouds', description: 'broken clouds', icon: '04d' }],
  base: 'stations',
  main: {
    temp: 28,
    feels_like: 30,
    temp_min: 27,
    temp_max: 29,
    pressure: 1015,
    humidity: 70,
  },
  visibility: 10000,
  wind: { speed: 3, deg: 90 },
  clouds: { all: 75 },
  dt: 1678886400,
  sys: {
    type: 1,
    id: 7149,
    country: 'MX',
    sunrise: 1678878840,
    sunset: 1678922400,
  },
  timezone: -21600,
  id: 3523349,
  name: 'Merida',
  cod: 200,
};

describe('Weather API - Database Interactions', () => {
  let testUserId: number;

  //clean up the database and create a test user.
  beforeEach(async () => {
    await cleanupTestData();
    testUserId = await createTestUser();
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should save weather history to the database when getCurrentWeather is called', async () => {
    const city = 'Merida';
    // Configure the mock to return our test data
    mockedWeatherService.fetchCurrentWeather.mockResolvedValue(MOCK_MERIDA_WEATHER_DATA);

    // Make a request to the endpoint that saves weather history
    const weatherResponse = await request(app)
      .get(`/api/weather/current/${city}`)
      .set('x-user-id', testUserId.toString());

    // Check that the initial API call was successful
    expect(weatherResponse.status).toBe(200);
    expect(weatherResponse.body.name).toBe(city);

    // Verify that the history is saved
    const historyResponse = await request(app)
      .get('/api/weather/history')
      .set('x-user-id', testUserId.toString());

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.history).toHaveLength(1);
    expect(historyResponse.body.history[0].city_name).toBe(city);
    expect(historyResponse.body.history[0].weather_data).toEqual(MOCK_MERIDA_WEATHER_DATA);
  });

  it('should retrieve weather history from the database using getHistory', async () => {
    const city = 'Merida';
    // Configure the mock to return our test data
    mockedWeatherService.fetchCurrentWeather.mockResolvedValue(MOCK_MERIDA_WEATHER_DATA);

    // First, add a history item by calling getCurrentWeather
    await request(app)
      .get(`/api/weather/current/${city}`)
      .set('x-user-id', testUserId.toString());

    // Now, call getHistory and verify the response
    const historyResponse = await request(app)
      .get('/api/weather/history')
      .set('x-user-id', testUserId.toString());

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body).toHaveProperty('history');
    expect(historyResponse.body.history).toBeInstanceOf(Array);
    expect(historyResponse.body.history).toHaveLength(1);

    // Verify that the history item is correct
    const historyItem = historyResponse.body.history[0];
    expect(historyItem.city_name).toBe(city);
    expect(historyItem.user_id).toBe(testUserId);
    expect(historyItem.weather_data).toEqual(MOCK_MERIDA_WEATHER_DATA);
  });
});