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
  city_name: number;
  country_code: string;
  searched_at: Date;
  weather_data: string; // change to WeatherData interface
}