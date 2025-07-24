import request from 'supertest';
import app from '../src/app';
import { weatherService } from '../src/services/weatherService';
import { weatherController } from '../src/controllers/weatherController';
//PENDING:
// caching and database integration TESTS

jest.mock('../src/services/weatherService');
const mockedWeatherService = weatherService as jest.Mocked<typeof weatherService>;
const mockNotFoundError = { status: 404, message: 'city not found' };
// Reset the state before each test
beforeEach(() => {
  jest.clearAllMocks();
  weatherController._resetState();
});

describe('GET /api/weather/current/:city', () => {
  it('should return 200 and weather data for a valid city', async () => {
      // Mock the API from the OpenWeatherMap
      const mockWeatherData = {
        name: 'Tokyo',
        main: { temp: 20, humidity: 50 },
        weather: [{ description: 'clear sky' }],
        wind: { speed: 5 },
      };
      
      mockedWeatherService.fetchCurrentWeather.mockResolvedValue(mockWeatherData);

      const response = await request(app).get('/api/weather/current/Tokyo');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockWeatherData);
      expect(mockedWeatherService.fetchCurrentWeather)
      .toHaveBeenCalledWith('Tokyo');
  });
  
  it('should return 404 if the city is NOT found', async () => {

    mockedWeatherService.fetchCurrentWeather.mockRejectedValue(mockNotFoundError)

    const response = await request(app).get('/api/weather/current/Narnia');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'city not found' });
  });

});

describe('GET /api/weather/forecast/:city', () => {
  it('should return 200 and forecast data for a valid city', async () => {
    // Mock the API response for the forecast endpoint day 1 and 2
    const mockForecastData = {
      list: [
        { dt: 1661871600, main: { temp: 22.8 } }, 
        { dt: 1661958000, main: { temp: 21.5 } }, 
      ],
      city: { name: 'Tokyo' },
    };

    mockedWeatherService.fetchWeatherForecast.mockResolvedValue(mockForecastData);

    const response = await request(app).get('/api/weather/forecast/Tokyo');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockForecastData);
    expect(mockedWeatherService.fetchWeatherForecast).toHaveBeenCalledWith('Tokyo');
  });

  it('should return 404 if the city is NOT found', async () => {
    
    mockedWeatherService.fetchWeatherForecast.mockRejectedValue(mockNotFoundError);

    const response = await request(app).get('/api/weather/forecast/Narnia');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'city not found' });
  });

});

describe('Favorites Endpoints', () => {
  it('POST /favorites - should create a new favorite and return it', async () => {
    const newFavoritePayload = { city_name: 'Kyoto', country_code: 'JP' };
    
    const response = await request(app)
      .post('/api/weather/favorites')
      .send(newFavoritePayload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('city_name', 'Kyoto');
  });

  it('GET /favorites - should return an array of favorite city objects', async () => {
    
    await request(app).post('/api/weather/favorites').send({ city_name: 'Kyoto', country_code: 'JP' });

    const response = await request(app).get('/api/weather/favorites');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('favorites');
    const favoritesList = response.body.favorites;
    console.log('favorites list', favoritesList);
    expect(favoritesList).toHaveLength(1);

    expect(favoritesList[0].city_name).toBe('Kyoto');
    expect(favoritesList[0]).toHaveProperty('id'); 
  });

  it('DELETE /favorites/:id - should remove a favorite city by its ID', async () => {
  
    const postResponse = await request(app)
      .post('/api/weather/favorites')
      .send({ city_name: 'Tokyo', country_code: 'JP' });
    const newFavoriteId = postResponse.body.id;

    const deleteResponse = await request(app).delete(`/api/weather/favorites/${newFavoriteId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      message: 'Favorite removed successfully',
      id: newFavoriteId,
    });

    const getResponse = await request(app).get('/api/weather/favorites');
    expect(getResponse.body.favorites).toHaveLength(0);
  });

});

// Add this new describe block to the end of backend/tests/weather.test.ts

describe('GET /api/weather/history', () => {
  it('should return a list of previously searched cities', async () => {
    // create search history,need to "search" for a city.
    // simulate this by calling the current weather endpoint, which should
    // trigger the history recording logic.

    // mock the service call for this to work.
    const mockWeatherData = { 
      name: 'Paris', 
      main: { temp: 18,  humidity: 40 },
      weather: [{ description: 'clear sky' }],
      wind: { speed: 3 },
    };
    mockedWeatherService.fetchCurrentWeather.mockResolvedValue(mockWeatherData);
    
    // "Search" for the city.
    await request(app).get('/api/weather/current/Paris');

    //get the search history.
    const historyResponse = await request(app).get('/api/weather/history');

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body).toHaveProperty('history');
    
    const historyList = historyResponse.body.history;
    expect(historyList).toHaveLength(1);
    // We can check for the object structure, like favorites.
    expect(historyList[0].city_name).toBe('Paris');
  });

  it('should return an empty list if no searches have been made', async () => {

    const response = await request(app).get('/api/weather/history');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('history');
    expect(response.body.history).toEqual([]);
  });
});