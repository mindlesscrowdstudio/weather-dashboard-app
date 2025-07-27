interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  handleSearch: (e: React.FormEvent) => void
  loading?: boolean
}
interface ForecastListProps {
  forecastData: ForecastData | null
  unit?: "C" | "F"
}

interface WeatherCardProps {
  weatherData: WeatherData | null;
  loading?: boolean;
  error?: string | null;
  unit?: "C" | "F";
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}
interface WeatherHistoryProps {
  history: SearchHistoryItem[]
  onHistoryClick: (city: string) => void
  onClearHistory: () => void
}