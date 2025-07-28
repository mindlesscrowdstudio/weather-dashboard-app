// lib/mock-data.ts
// Hardcoded data for testing and component previews.

import type { WeatherData, ForecastData, SearchHistoryItem } from "@/types"

export const mockWeatherData: WeatherData = {
  coord: { lon: -0.1257, lat: 51.5085 },
  weather: [{ id: 803, main: "Clouds", description: "broken clouds", icon: "04d" }],
  base: "stations",
  main: {
    temp: 15.5,
    feels_like: 14.9,
    temp_min: 14,
    temp_max: 17,
    pressure: 1012,
    humidity: 72,
  },
  visibility: 10000,
  wind: { speed: 4.1, deg: 80 },
  clouds: { all: 75 },
  dt: 1661870400,
  sys: {
    type: 2,
    id: 2075535,
    country: "GB",
    sunrise: 1661834187,
    sunset: 1661882248,
  },
  timezone: 3600,
  id: 2643743,
  name: "London",
  cod: 200,
}

export const mockForecastData: ForecastData = {
  city: {
    id: 2643743,
    name: "London",
    country: "GB",
  },
  list: [
    { dt: 1661871600, main: { temp: 16.2 }, weather: [{ main: "Clouds" }] },
    { dt: 1661958000, main: { temp: 18.5 }, weather: [{ main: "Clear" }] },
    { dt: 1662044400, main: { temp: 17.1 }, weather: [{ main: "Clouds" }] },
    { dt: 1662130800, main: { temp: 14.8 }, weather: [{ main: "Rain" }] },
    { dt: 1662217200, main: { temp: 15.3 }, weather: [{ main: "Clouds" }] },
  ],
}

export const mockSearchHistory: SearchHistoryItem[] = [
  {
    id: 1,
    user_id: 1,
    city_name: "Tokyo",
    country_code: "JP",
    searched_at: new Date().toISOString(),
    weather_data: mockWeatherData,
  },
  {
    id: 2,
    user_id: 1,
    city_name: "Paris",
    country_code: "FR",
    searched_at: new Date().toISOString(),
    weather_data: mockWeatherData,
  },
  {
    id: 3,
    user_id: 1,
    city_name: "New York",
    country_code: "US",
    searched_at: new Date().toISOString(),
    weather_data: mockWeatherData,
  },
]
