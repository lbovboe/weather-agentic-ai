import { Cloud, Sun, CloudRain, Snowflake, Zap } from "lucide-react";

interface WeatherIconProps {
  weather?: string;
  className?: string;
}

export const WeatherIcon = ({ weather, className = "w-5 h-5 text-blue-500" }: WeatherIconProps) => {
  switch (weather?.toLowerCase()) {
    case "clear":
    case "sunny":
      return <Sun className={className} />;
    case "clouds":
    case "cloudy":
      return <Cloud className={className} />;
    case "rain":
    case "drizzle":
      return <CloudRain className={className} />;
    case "snow":
      return <Snowflake className={className} />;
    case "thunderstorm":
      return <Zap className={className} />;
    default:
      return <Cloud className={className} />;
  }
};
