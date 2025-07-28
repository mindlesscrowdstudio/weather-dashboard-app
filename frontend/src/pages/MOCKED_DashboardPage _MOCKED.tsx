"use client"

import type React from "react"

import { useState } from "react"
import { Cloud, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SearchBar } from "@/components/SearchBar"
import { WeatherCard } from "@/components/WeatherCard"
import { ForecastList } from "@/components/ForecastList"
import { WeatherHistory } from "@/components/WeatherHistory"
import { mockWeatherData, mockForecastData, mockSearchHistory } from "@/lib/mockData"
import type { WeatherData, ForecastData, SearchHistoryItem } from "@/types"

export default function WeatherDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(mockWeatherData)
  const [forecastData, setForecastData] = useState<ForecastData | null>(mockForecastData)
  const [favorites, setFavorites] = useState<string[]>([])
  const [history, setHistory] = useState<SearchHistoryItem[]>(mockSearchHistory)
  const [unit, setUnit] = useState<"C" | "F">("C")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Here you would typically make an API call
      console.log("Searching for:", searchTerm)
      // For now, just use mock data
      setWeatherData(mockWeatherData)
      setForecastData(mockForecastData)
    }
  }

  const toggleFavorite = () => {
    if (!weatherData) return
    const cityName = weatherData.name
    setFavorites((prev) => (prev.includes(cityName) ? prev.filter((fav) => fav !== cityName) : [...prev, cityName]))
  }

  const handleHistoryClick = (city: string) => {
    setSearchTerm(city)
    // Here you would typically fetch data for that city
    console.log("Clicked on history item:", city)
  }

  const clearHistory = () => {
    setHistory([])
  }

  const isFavorite = weatherData ? favorites.includes(weatherData.name) : false

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
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
                    <div key={city} className="text-gray-700">
                      {city}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No favorite cities yet. Star a city to add it here.</p>
              )}
            </CardContent>
          </Card>

          {/* Search History */}
          <WeatherHistory history={history} onHistoryClick={handleHistoryClick} onClearHistory={clearHistory} />
        </div>
      </div>
    </div>
  )
}
