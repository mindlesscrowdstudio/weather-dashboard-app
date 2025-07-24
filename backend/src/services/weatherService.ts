import axios from 'axios';

const openWeatherAPI = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  params: {
    appid: process.env.OPEN_WEATHER_API_KEY,
    units: 'metric',
  },
});
// create a class to encapsulate the API calls
class WeatherService {
  async fetchCurrentWeather(city: string) {
    try {
      const response = await openWeatherAPI.get('/weather', {
        params: { q: city },
      });
      return response.data;
    } catch (error) {
      // Axios wraps errors, so we can inspect them to get the real status and data
      if (axios.isAxiosError(error) && error.response) {
        throw {
          status: error.response.status,
          message: error.response.data.message || 'Error fetching current weather',
        };
      }
      // Rethrow if it's not a standard API error
      throw error;
    }
  }
  async fetchWeatherForecast(city: string) {
    try {
      const response = await openWeatherAPI.get('/forecast', {
        params: { q: city },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw {
          status: error.response.status,
          message: error.response.data.message || 'Error fetching forecast data',
        };
      }
      throw error;
    }
  }

}
//Export a singleton instance of the service
export const weatherService = new WeatherService();