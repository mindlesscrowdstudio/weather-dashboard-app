import axios from 'axios';

const openWeatherAPI = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  params: {
    appid: process.env.OPENWEATHER_API_KEY,
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

// create a class to encapsulate the API calls #Encapsulation pattern
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
  // For Devs: The final request sent to the OpenWeatherMap server looks like this: https://api.openweathermap.org/data/2.5/forecast?q=London&appid=YOUR_API_KEY&units=metric

}

export const weatherService = new WeatherService();