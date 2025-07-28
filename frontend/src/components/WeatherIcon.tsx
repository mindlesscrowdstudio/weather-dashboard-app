// component to map weather codes to icons
import type React from "react"
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from "lucide-react"
import type { LucideProps } from "lucide-react"

interface WeatherIconProps extends LucideProps {
  iconCode: string
}

export function WeatherIcon({ iconCode, ...props }: WeatherIconProps) {
  const iconMap: { [key: string]: React.ElementType } = {
    "01d": Sun,
    "01n": Sun,
    "02d": Cloud,
    "02n": Cloud,
    "03d": Cloud,
    "03n": Cloud,
    "04d": Cloud,
    "04n": Cloud,
    "09d": CloudRain,
    "09n": CloudRain,
    "10d": CloudRain,
    "10n": CloudRain,
    "11d": CloudLightning,
    "11n": CloudLightning,
    "13d": CloudSnow,
    "13n": CloudSnow,
  }

  const IconComponent = iconMap[iconCode] || Sun
  return <IconComponent {...props} />
}
