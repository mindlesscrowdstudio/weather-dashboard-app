import request from 'supertest';
import app from '../src/app';

global.fetch = jest.fn();

beforeEach(() => {
  // clears any previous mock implementations and call history.
  (fetch as jest.Mock).mockClear();
});

//Cycle 1
describe('GET /api/weather/current/:city', () => {
  it('should return 404 if the city is NOT found', async () => {
    // We'll need to mock the fetch API later to simulate this
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'city not found' }),
    });

    const response = await request(app)
      .get('/api/weather/current/Narnia');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'city not found');
  });

  it('should return 200 and weather data for a valid city', async () => {
      // Mock the API from the OpenWeatherMap
      const mockWeatherData = {
        name: 'Seul',
        main: { temp: 20, humidity: 50 },
        weather: [{ description: 'clear sky' }],
        wind: { speed: 5 },
      };
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherData),
    });

    const response = await request(app)
      .get('/api/weather/current/Seul');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockWeatherData)

    });
});


//PENDING:
// caching and database integration TESTS

describe('GET /api/weather/forecast/:city', () => {
  it('should return 200 and forecast data for a valid city', async () => {
    // Mock the API response for the forecast endpoint day 1 and 2
    const mockForecastData = {
      list: [
        { dt: 1661871600, main: { temp: 22.8 } }, 
        { dt: 1661958000, main: { temp: 21.5 } }, 
      ],
      city: { name: 'Seul' },
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockForecastData),
    });
    const response = await request(app).get('/api/weather/forecast/Seul');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockForecastData);
    
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/data/2.5/forecast?q=Seul'));
  });

  it('should return 404 if the city is NOT found', async () => {
    const mockErrorResponse =  { message: 'city not found' };
    // Mock the fetch API 
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve(mockErrorResponse),
    });

    const response = await request(app)
      .get('/api/weather/forecast/Narnia');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'city not found');
  });

});

// Favorites POST endpoint
describe('POST /api/weather/favorites', () => {
  it('should return 201 and a success message when adding a valid city', async () => {
    const newFavorite = { city: 'Ushuaia' };

    const response = await request(app)
      .post('/api/weather/favorites')
      .send(newFavorite); //NOTE: .send() is used to include a request body

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'City added to favorites',
      city: 'Tokyo',
    });
  });
});
