import { useState } from 'react';
import WeatherDashboard from '@/pages/DashboardPage';
import { getGradientForWeather } from '@/lib/backgrounds';
import type { WeatherData } from '@/types';

function App() {
  // Lift weatherData state to the App component to control the background
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // Determine the background gradient based on the current weather
  const backgroundGradient = getGradientForWeather(weatherData);

  const baseClasses = "min-h-screen text-white p-4 sm:p-6 md:p-8 transition-all duration-500";
  return (
    <>
      <div className={`bg-gradient-to-b ${backgroundGradient} ${baseClasses}`}>
        <WeatherDashboard onWeatherUpdate={setWeatherData} />
      </div>
    </>
  )
}

export default App
