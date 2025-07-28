"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Cloud, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SearchBar } from "@/components/SearchBar"
import { WeatherCard } from "@/components/WeatherCard"
import { ForecastList } from "@/components/ForecastList"
import { WeatherHistory } from "@/components/WeatherHistory"
import { apiService } from "@/api/apiService"
import type { WeatherData, ForecastData, SearchHistoryItem, FavoriteCity } from "@/types"

export default function WeatherDashboard() {
  const [searchTerm, setSearchTerm] = useState("London")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [favorites, setFavorites] = useState<FavoriteCity[]>([])
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [unit, setUnit] = useState<"C" | "F">("C")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    try {
      const { favorites } = await apiService.getFavorites()
      setFavorites(favorites)
    } catch (err) {
      console.error("Failed to fetch favorites:", err)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      const { history } = await apiService.getHistory()
      setHistory(history)
    } catch (err) {
      console.error("Failed to fetch history:", err)
    }
  }, [])

  // A memoized function to fetch all weather-related data for a city
  const fetchWeatherData = useCallback(async (city: string) => {
    if (!city) return
    setLoading(true)
    setError(null)
    try {
      const [weather, forecast] = await Promise.all([apiService.getCurrentWeather(city), apiService.getForecast(city)])
      setWeatherData(weather)
      setForecastData(forecast)
      fetchHistory() // Refresh history after a successful search
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred.")
      }
      setWeatherData(null)
      setForecastData(null)
    } finally {
      setLoading(false)
    }
  }, [fetchHistory])

  // Initial data fetch when the component mounts
  useEffect(() => {
    fetchWeatherData(searchTerm)
    fetchFavorites()
  }, [fetchWeatherData, fetchFavorites])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWeatherData(searchTerm)
  }

  const toggleFavorite = async () => {
    if (!weatherData) return

    const currentCityName = weatherData.name
    const existingFavorite = favorites.find((fav) => fav.city_name.toLowerCase() === currentCityName.toLowerCase())

    try {
      if (existingFavorite) {
        await apiService.deleteFavorite(existingFavorite.id)
      } else {
        await apiService.addFavorite(weatherData.name, weatherData.sys.country)
      }
      // Refresh the favorites list from the server to ensure consistency
      fetchFavorites()
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
      setError("Could not update favorites. Please try again.")
    }
  }

  const handleHistoryClick = (city: string) => {
    setSearchTerm(city)
    fetchWeatherData(city)
  }

  const isFavorite = weatherData ? favorites.some((fav) => fav.city_name.toLowerCase() === weatherData.name.toLowerCase()) : false

  return (
    // The main container is now wider (max-w-7xl). The background and padding are handled by App.tsx.
    <div className="max-w-7xl mx-auto">
      {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Cloud className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">Weather Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="temp-unit" className={`font-semibold ${unit === "C" ? "text-blue-600" : "text-gray-500"}`}>
              °C
            </Label>
            <Switch id="temp-unit" checked={unit === "F"} onCheckedChange={(checked) => setUnit(checked ? "F" : "C")} />
            <Label htmlFor="temp-unit" className={`font-semibold ${unit === "F" ? "text-blue-600" : "text-gray-500"}`}>
              °F
            </Label>
          </div>
        </header>

        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          loading={loading}
        />

        {/* Weather Card */}
        <WeatherCard
          weatherData={weatherData}
          loading={loading}
          error={error}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
        />

        {/* Forecast List */}
        <ForecastList forecastData={forecastData} />

        {/* Bottom Section - Favorites and History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Favorite Cities */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Star className="w-5 h-5 text-yellow-400" />
                Favorite Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length > 0 ? (
                <div className="space-y-2">
                  {favorites.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleHistoryClick(city.city_name)}
                      className="text-gray-700 hover:text-blue-600 hover:underline w-full text-left"
                    >
                      {city.city_name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No favorite cities yet. Star a city to add it here.</p>
              )}
            </CardContent>
          </Card>

          {/* Search History */}
          <WeatherHistory history={history} onHistoryClick={handleHistoryClick} />
        </div>
    </div>
  )
}
