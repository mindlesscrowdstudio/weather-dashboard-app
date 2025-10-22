
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
      <Card className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 mb-6 text-white">
        <CardContent className="p-6 text-center">
          <p className="text-white/80">Loading weather...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 mb-6 text-white">
        <CardContent className="p-6 text-center text-red-300">
          <p>Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!weatherData) {
    return (
      <Card className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 mb-6 text-white">
        <CardContent className="p-6 text-center text-white/80">
          <p>Search for a city to see the weather.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 mb-6 text-white">
      <CardContent className="p-6">
        {/* City name and star */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-medium">
              {weatherData.name} ({weatherData.sys.country})
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggleFavorite} className="h-8 w-8 text-white hover:bg-white/20">
            <Star className={`w-5 h-5 ${isFavorite ? "text-yellow-400 fill-current" : "text-gray-400"}`} />
          </Button>
        </div>

        {/* Main weather info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <WeatherIcon iconCode={weatherData.weather[0].icon} className="w-12 h-12 text-orange-500" />
            <div>
              <p className="text-7xl font-thin tracking-tighter">
                {unit === "F" ? convertToFahrenheit(weatherData.main.temp) : Math.round(weatherData.main.temp)}°{unit}
              </p>
              <p className="text-lg capitalize mt-1">{weatherData.weather[0].description}</p>
              <p className="text-sm">
                Feels like {unit === "F" ? convertToFahrenheit(weatherData.main.feels_like) : Math.round(weatherData.main.feels_like)}°{unit}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">{formatDate(weatherData.dt)}</p>
          </div>
        </div>

        {/* Weather details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>Humidity: {weatherData.main.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-900" />
            <span>Wind: {weatherData.wind.speed} m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <Sunrise className="w-4 h-4 text-yellow-500" />
            <span className="text-white">Sunrise: {formatTime(weatherData.sys.sunrise, weatherData.timezone)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="w-4 h-4 text-orange-600" />
            <span>Sunset: {formatTime(weatherData.sys.sunset, weatherData.timezone)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
