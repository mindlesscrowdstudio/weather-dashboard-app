// backend/src/scripts/populate-weather-cache.ts
// Script to populate the weather_cache table with sample data.
// Run with: ts-node src/scripts/populate-weather-cache.ts

import pool from '../config/database';
import type { WeatherData, ForecastData } from '../types';



async function populateWeatherCache() {
  try {
    console.log("🌤️  Populating weather cache...");

    // Sample weather data for London, compliant with the WeatherData interface
    const londonWeatherData: WeatherData = {
      coord: { lon: -0.1257, lat: 51.5085 },
      weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
      base: "stations",
      main: {
        temp: 15.5,
        feels_like: 14.2,
        temp_min: 12.0,
        temp_max: 18.0,
        pressure: 1013,
        humidity: 65,
      },
      visibility: 10000,
      wind: { speed: 3.5, deg: 180 },
      clouds: { all: 0 },
      dt: Math.floor(Date.now() / 1000),
      sys: { type: 1, id: 1414, country: "GB", sunrise: 1661834187, sunset: 1661882248 },
      timezone: 3600,
      id: 2643743,
      name: "London",
      cod: 200,
    };

    const londonForecastData: ForecastData = {
      list: [
        { dt: 1661871600, main: { temp: 16.2 }, weather: [{ main: "Clear" }] },
        { dt: 1661882400, main: { temp: 18.5 }, weather: [{ main: "Clouds" }] },
        { dt: 1661893200, main: { temp: 14.8 }, weather: [{ main: "Rain" }] },
      ],
      city: { id: 2643743, name: "London", country: "GB" },
    };

    // Insert London data using a robust UPSERT with the EXCLUDED keyword
    await pool.query(
      `INSERT INTO weather_cache (city_id, city_name, country_code, current_weather_data, forecast_data, last_updated)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (city_id) DO UPDATE SET
         current_weather_data = EXCLUDED.current_weather_data,
         forecast_data = EXCLUDED.forecast_data,
         last_updated = NOW()`,
      [
        londonWeatherData.id,
        londonWeatherData.name,
        londonWeatherData.sys.country,
        JSON.stringify(londonWeatherData),
        JSON.stringify(londonForecastData),
      ],
    );

    // Sample weather data for Tokyo, compliant with the WeatherData interface
    const tokyoWeatherData: WeatherData = {
      coord: { lon: 139.6917, lat: 35.6895 },
      weather: [{ id: 801, main: "Clouds", description: "few clouds", icon: "02d" }],
      base: "stations",
      main: {
        temp: 22.3,
        feels_like: 21.8,
        temp_min: 20.0,
        temp_max: 25.0,
        pressure: 1015,
        humidity: 70,
      },
      visibility: 10000,
      wind: { speed: 2.1, deg: 90 },
      clouds: { all: 75 },
      dt: Math.floor(Date.now() / 1000),
      sys: { type: 1, id: 7619, country: "JP", sunrise: 1661801994, sunset: 1661849400 },
      timezone: 32400,
      id: 1850147,
      name: "Tokyo",
      cod: 200,
    };
    const tokyoForecastData: ForecastData = {
      list: [
        {"dt": 1753606800, main: {temp: 30.8}, weather: [{ main: "Clouds"} ] },
        {"dt": 1753617600, main: {temp: 29.79}, weather: [{ main: "Clouds"}]},
        {"dt": 1753628400, main: {temp: 28.19}, weather: [{ main: "Clear"}]},
      ],
      city: { id: 1850147, name: "Tokyo", country: "JP" },
    }

  
    // Insert Tokyo data (current weather and forecast)
    await pool.query(
      `INSERT INTO weather_cache (city_id, city_name, country_code, current_weather_data, forecast_data, last_updated)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (city_id) DO UPDATE SET
         current_weather_data = EXCLUDED.current_weather_data,
         forecast_data = EXCLUDED.forecast_data,
         last_updated = NOW()`,
      [tokyoWeatherData.id, tokyoWeatherData.name, tokyoWeatherData.sys.country, JSON.stringify(tokyoWeatherData), JSON.stringify(tokyoForecastData)],
    );

    console.log("✅ Weather cache populated successfully!");
  } catch (error) {
    console.error("❌ Failed to populate weather cache:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

populateWeatherCache();