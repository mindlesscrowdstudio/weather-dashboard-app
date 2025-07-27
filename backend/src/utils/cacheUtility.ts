import pool from '../config/database';

/**
 * A generic function to retrieve an item from the weather_cache table.
 * @param city The city name to look up.
 * @param column The specific data column to retrieve ('current_weather_data' or 'forecast_data').
 * @param durationMinutes The maximum age of the cache entry in minutes.
 * @returns The cached data if fresh, otherwise null.
 */
export async function getFromCache<T>(city: string, column: 'current_weather_data' | 'forecast_data', durationMinutes: number): Promise<T | null> {
  const cacheResult = await pool.query(
    `SELECT ${column}, last_updated FROM weather_cache WHERE LOWER(city_name) = LOWER($1)`,
    [city]
  );

  if (cacheResult.rowCount && cacheResult.rows[0][column]) {
    const cacheEntry = cacheResult.rows[0];
    const lastUpdated = new Date(cacheEntry.last_updated);
    const ageInMinutes = (new Date().getTime() - lastUpdated.getTime()) / 60000;

    if (ageInMinutes < durationMinutes) {
      console.log(`CACHE HIT for ${column} in ${city}`);
      return cacheEntry[column] as T;
    }
  }
  console.log(`CACHE MISS for ${column} in ${city}`);
  return null;
}
