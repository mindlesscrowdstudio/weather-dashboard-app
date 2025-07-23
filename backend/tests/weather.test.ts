import request from 'supertest';
import app from '../src/app';

global.fetch = jest.fn();

//Cycle 1
describe('GET /api/weather/current/:city', () => {
  it('should return 404 if the city is NOT found', async () => {
    // We'll need to mock the fetch API later to simulate this
    const response = await request(app)
      .get('/api/weather/current/unexistencedcity');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Sorry, City not found');
  });
});

//Cycle 2
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

    //Make the API request to the endpoint that doesn't exist yet
    const response = await request(app).get('/api/weather/forecast/Seul');

    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockForecastData);
    
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/data/2.5/forecast?q=Seul'));
  });

});
