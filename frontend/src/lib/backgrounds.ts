import type { WeatherData } from "@/types";

/**
 * Determines the appropriate background gradient based on the weather icon.
 * The weather app uses different gradients for day, night, and various
 * weather conditions like rain or clouds.
 *
 * @param weather - The current weather data, which includes the icon code.
 * @returns A string of Tailwind CSS classes for the background gradient.
 */
export const getGradientForWeather = (weather: WeatherData | null): string => {
  // Default gradient for when there's no weather data (e.g., on initial load)
  const defaultGradient = "from-blue-400 to-blue-700";

  if (!weather?.weather[0]?.icon) {
    return defaultGradient;
  }

  const icon = weather.weather[0].icon;

  // Night gradients (icon code ends with 'n')
  if (icon.endsWith("n")) {
    if (icon.startsWith("09") || icon.startsWith("10") || icon.startsWith("11")) {
      return "from-gray-700 via-gray-800 to-gray-900"; // Rainy/Stormy night
    }
    return "from-gray-800 to-indigo-900"; // Clear or cloudy night
  }

  // Day gradients
  switch (icon.substring(0, 2)) {
    case "01": // Clear sky
      return "from-blue-400 to-sky-600";
    case "02": // Few clouds
    case "03": // Scattered clouds
    case "04": // Broken clouds
      return "from-sky-500 to-gray-500";
    case "09": // Shower rain
    case "10": // Rain
    case "11": // Thunderstorm
      return "from-gray-500 to-slate-600";
    case "13": // Snow
      return "from-slate-400 to-cyan-600";
    case "50": // Mist
      return "from-slate-300 to-gray-400";
    default:
      return defaultGradient;
  }
};