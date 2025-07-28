
import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Droplets, Wind, Sunrise, Sunset } from "lucide-react"
import type { WeatherData } from "@/types"
import { WeatherIcon } from "@/components/WeatherIcon"
import { convertToFahrenheit } from "@/lib/temperatureConvertion"

interface WeatherCardProps {
  weatherData: WeatherData | null
  loading?: boolean
  error?: string | null
  onToggleFavorite?: () => void
  isFavorite?: boolean
  unit: "C" | "F"
}

const formatTime = (timestamp: number, timezone: number) => {
  return new Date((timestamp + timezone) * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export const WeatherCard = memo(({ weatherData, loading, error, onToggleFavorite, isFavorite, unit }: WeatherCardProps) => {
  if (loading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Loading weather...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6 text-center text-red-500">
          <p>Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!weatherData) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-6 text-center text-gray-500">
          <p>Search for a city to see the weather.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardContent className="p-6">
        {/* City name and star */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {weatherData.name} ({weatherData.sys.country})
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggleFavorite} className="h-8 w-8">
            <Star className={`w-5 h-5 ${isFavorite ? "text-yellow-400 fill-current" : "text-gray-400"}`} />
          </Button>
        </div>

        {/* Main weather info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <WeatherIcon iconCode={weatherData.weather[0].icon} className="w-12 h-12 text-orange-500" />
            <div>
              <p className="text-4xl font-bold text-gray-900">
                {unit === "F" ? convertToFahrenheit(weatherData.main.temp) : Math.round(weatherData.main.temp)}°{unit}
              </p>
              <p className="text-sm text-gray-500 mt-1">{weatherData.weather[0].description}</p>
              <p className="text-sm text-gray-500">
                Feels like {unit === "F" ? convertToFahrenheit(weatherData.main.feels_like) : Math.round(weatherData.main.feels_like)}°{unit}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{formatDate(weatherData.dt)}</p>
          </div>
        </div>

        {/* Weather details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-gray-600">Humidity: {weatherData.main.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Wind: {weatherData.wind.speed} m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <Sunrise className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-600">Sunrise: {formatTime(weatherData.sys.sunrise, weatherData.timezone)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="w-4 h-4 text-orange-600" />
            <span className="text-gray-600">Sunset: {formatTime(weatherData.sys.sunset, weatherData.timezone)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
