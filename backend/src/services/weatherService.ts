import axios from 'axios';

const openWeatherAPI = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  params: {
    appid: process.env.OPEN_WEATHER_API_KEY,
    units: 'metric',
  },
});

// Centralized error handling function
export const handleAPIError = (error:any) => {
  if(axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response;
    const message = data.message || `API error with status ${status}`;
    return { status, message }; 
  } else if(error instanceof Error) {
    //generic js error
    return { status: 500, message: error.message }
  } else {
    //unknown error
    return { status: 500, message: 'An unexpected error occurred' }
  }
}

// create a class to encapsulate the API calls
class WeatherService {
  async fetchCurrentWeather(city: string) {
    try {
      const response = await openWeatherAPI.get('/weather', {
        params: { q: city },
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  }
  async fetchWeatherForecast(city: string) {
    try {
      const response = await openWeatherAPI.get('/forecast', {
        params: { q: city },
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  }

}
//Export a singleton instance of the service
export const weatherService = new WeatherService();