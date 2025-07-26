
/**
 * interface data strucure used for weather_data
 */

export interface User {
  id: number
  username: string
}
export interface WeatherData {
  coord: { lon: number; lat: number }
  weather: { id: number; main: string; description: string; icon: string }[]
  base: string
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  visibility: number
  wind: { speed: number; deg: number }
  clouds: { all: number }
  dt: number
  sys: {
    type: number
    id: number
    country: string // This is the source for `country_code`
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string // This is the source for `city_name`
  cod: number
}

export interface FavoriteCity {
  id: number;
  user_id: number; // hardcode this to a test user
  city_name: string;
  country_code: string;
  added_at: Date;
}

export interface SearchHistoryItem {
  id: number;
  user_id?: number;
  city_name: string;
  country_code: string;
  searched_at: Date;
  weather_data: WeatherData; // change to WeatherData interface
}
export interface WeatherCacheItem {
  city_id: number
  city_name: string
  country_code: string
  current_weather_data?: WeatherData
  forecast_data?: any // TODO: define a more specific type later
  last_updated: Date
}