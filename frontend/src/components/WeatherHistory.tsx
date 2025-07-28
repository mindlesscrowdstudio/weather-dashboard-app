//"use client"
import { useId, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SearchHistoryItem, WeatherData, ForecastData } from "@/types"
import { WeatherIcon } from "./WeatherIcon"
import { convertToFahrenheit } from "@/lib/temperatureConvertion"

interface WeatherHistoryProps {
  history: SearchHistoryItem[]
  onHistoryClick: (city: string) => void
  onClearHistory?: () => void
  unit: "C" | "F"
}

const formatSearchDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getDisplayData = (item: SearchHistoryItem) => {
  const data = item.weather_data

  // Type guard for WeatherData (current weather)
  if ("main" in data && "weather" in data && Array.isArray(data.weather)) {
    return {
      temp: Math.round((data as WeatherData).main.temp),
      description: (data as WeatherData).weather[0].description,
      icon: (data as WeatherData).weather[0].icon,
    }
  }

  // Type guard for ForecastData
  if ("list" in data && Array.isArray(data.list) && data.list.length > 0) {
    const firstDay = (data as ForecastData).list[0]
    return {
      temp: Math.round(firstDay.main.temp),
      description: firstDay.weather[0].description,
      icon: firstDay.weather[0].icon,
    }
  }

  // Fallback for unexpected data structures
  return { temp: "N/A", description: "No description", icon: "01d" }
}

export const WeatherHistory = memo(({ history, onHistoryClick, onClearHistory, unit }: WeatherHistoryProps) => {
  const titleId = useId();
  return (
    <Card className="bg-white shadow-sm" role="region" aria-labelledby={titleId}>
      <CardHeader className="pb-4" >
        <CardTitle id={titleId} className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <History className="w-5 h-5 text-gray-500" />
          Search History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <ScrollArea className="h-[260px] pr-4">
            <ul className="space-y-4">
              {history.map((item) => {
                const { temp, icon, description } = getDisplayData(item)
                const displayTemp =
                  typeof temp === "number" ? (unit === "F" ? convertToFahrenheit(temp) : Math.round(temp)) : temp

                return (
                  <li key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <WeatherIcon iconCode={icon} className="w-8 h-8 text-gray-500" />
                      <div>
                        <Button
                          variant="link"
                          className="text-left p-0 h-auto text-base font-semibold text-gray-800 hover:text-blue-600 no-underline hover:underline"
                          onClick={() => onHistoryClick(item.city_name)}
                          aria-label={`View weather for ${item.city_name}, ${item.country_code}`}
                        >
                          {item.city_name}, {item.country_code}
                        </Button>
                        <p className="text-xs text-gray-500">{formatSearchDate(item.searched_at)}</p>
                      </div>
                    </div>
                    <div
                      className="text-lg font-bold text-gray-800 text-right"
                      aria-label={`Temperature: ${displayTemp} degrees ${unit === "F" ? "Fahrenheit" : "Celsius"}. Weather: ${description}.`}
                    >
                      {displayTemp}°{unit}
                    </div>
                  </li>
                )
              })}
              {onClearHistory && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearHistory}
                    className="text-red-500 hover:text-red-600 p-0 h-auto text-sm"
                  >
                    Clear History
                  </Button>
                </div>
              )}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-sm text-gray-500">Your search history is empty.</p>
        )}
      </CardContent>
    </Card>
  )
})
