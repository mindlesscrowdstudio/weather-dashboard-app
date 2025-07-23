import request from 'supertest';
import app from '../src/app';


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
