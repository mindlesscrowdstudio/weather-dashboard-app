-- USERS - This is a simplified table for now
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL
);

-- FAVORITE CITIES - Stores the list of favorite cities for each user.
CREATE TABLE IF NOT EXISTS favorite_cities (
	id SERIAL PRIMARY KEY,
	-- Foreign key linking to the 'users' table.
	-- Ensures that every favorite belongs to a real user.
	-- If a user is deleted from the users table, all of their associated favorite cities will be automatically deleted as well.
	user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	-- The name and country code for the favorited city.
	city_name VARCHAR(100) NOT NULL,
	country_code VARCHAR(2) NOT NULL,
	-- Timestamp for when the city was added.
	added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	-- A user cannot favorite the same city twice.
	-- This constraint enforces that the combination of user_id and city_name is unique.
	UNIQUE (user_id, city_name, country_code)
);

-- WEATHER HISTORY - Logs every weather search made by a user.
CREATE TABLE IF NOT EXISTS weather_history (
    id SERIAL PRIMARY KEY,

    -- Foreign key linking to the 'users'table.
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- The city that was searched for.
    city_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) NOT NULL,

    -- Timestamp for when the search occurred.
    -- avoids any ambiguity related to time zones
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- The full JSON response from the OpenWeatherMap API.
    -- JSONB is the best choice as it's indexed and more efficient for querying.
    -- This will store the structure defined in the WeatherData interface.
    weather_data JSONB NOT NULL
);

-- Caches weather data to reduce API calls for frequently searched cities.
CREATE TABLE IF NOT EXISTS weather_cache (
    -- We use the city ID from the OpenWeatherMap API as the primary key.
    -- It's a stable and unique identifier for each location (e.g., London is 2643743).
    city_id INTEGER PRIMARY KEY,

    city_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) NOT NULL,

    -- Stores the JSON response for the 'current weather' API endpoint.
    current_weather_data JSONB,

    -- Stores the JSON response for the '5-day forecast' API endpoint.
    forecast_data JSONB,

    -- Crucial field: Timestamp for when this cache entry was last updated.
    -- Your application logic will use this to decide if the data is stale
    -- and a new API call is needed (e.g., if last_updated > 10 minutes ago).
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL
);
