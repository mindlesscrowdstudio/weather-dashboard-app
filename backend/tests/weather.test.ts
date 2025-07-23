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

