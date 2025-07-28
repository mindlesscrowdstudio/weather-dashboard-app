import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ForecastData } from "@/types"
import { WeatherIcon } from "@/components/WeatherIcon"

interface ForecastListProps {
  forecastData: ForecastData | null
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function ForecastList({ forecastData }: ForecastListProps) {
  if (!forecastData) {
    return null
  }

  // The OpenWeatherMap API for 5-day forecast returns data in 3-hour intervals,
   // list to show only one unique forecast per day.
  const dailyForecasts = Array.from(
    forecastData.list
      .reduce((map, day) => {
        // Use toDateString() to get a unique key for each day  "Tue Aug 30 2022" 
        const date = new Date(day.dt * 1000).toDateString();
        // If we haven't seen this day before, add it to our map.
        // This effectively takes the first forecast of each day.
        if (!map.has(date)) {
          map.set(date, day);
        }
        return map;
      }, new Map<string, ForecastData['list'][0]>())
      .values()
  ).slice(0, 5); // show maximum of 5 days.

  return (
    <Card className="bg-white shadow-sm mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">5-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {dailyForecasts.map((day) => (
            <div key={day.dt} className="flex flex-col items-center text-center p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">{formatDate(day.dt)}</p>
              <WeatherIcon iconCode={day.weather[0].icon} className="w-8 h-8 text-orange-500 mb-2" />
              <p className="text-lg font-bold text-gray-900 mb-1">{Math.round(day.main.temp)}°C</p>
              <p className="text-xs text-gray-500">{day.weather[0].main}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
