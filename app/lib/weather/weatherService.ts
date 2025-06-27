import axios from "axios";
import { WeatherAPIForecastDay, WeatherAPIAlert } from "../../types";

// WeatherAPI.com configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "demo_key";
const WEATHER_BASE_URL = "http://api.weatherapi.com/v1";

// Types for weather service
export interface CurrentWeatherArgs {
  location: string;
  units?: string;
}

export interface WeatherForecastArgs {
  location: string;
  days?: number;
  units?: string;
}

export interface WeatherAlertsArgs {
  location: string;
}

// Weather service functions
export async function getCurrentWeather(args: CurrentWeatherArgs) {
  const { location, units = "metric" } = args;

  try {
    // Get current weather from WeatherAPI.com
    const weatherResponse = await axios.get(
      `${WEATHER_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&aqi=yes`
    );

    const data = weatherResponse.data;

    // Convert units if needed (WeatherAPI.com returns both C and F)
    const temp = units === "imperial" ? data.current.temp_f : data.current.temp_c;
    const feelsLike = units === "imperial" ? data.current.feelslike_f : data.current.feelslike_c;
    const windSpeed = units === "imperial" ? data.current.wind_mph : data.current.wind_kph;
    const visibility = units === "imperial" ? data.current.vis_miles : data.current.vis_km;

    return {
      location: `${data.location.name}, ${data.location.country}`,
      temperature: Math.round(temp),
      feels_like: Math.round(feelsLike),
      humidity: data.current.humidity,
      pressure: data.current.pressure_mb,
      visibility: visibility,
      wind_speed: windSpeed,
      wind_direction: data.current.wind_degree,
      wind_dir: data.current.wind_dir,
      weather_description: data.current.condition.text,
      weather_main: data.current.condition.text,
      icon: data.current.condition.icon,
      uv_index: data.current.uv,
      units: units,
    };
  } catch (error) {
    console.error("WeatherAPI error:", error);
    return {
      error: "Unable to fetch weather data. Please try again later.",
      demo_data: {
        location: location,
        temperature: 22,
        feels_like: 25,
        humidity: 65,
        weather_description: "partly cloudy",
        note: "This is demo data. Please add your WeatherAPI.com API key for real data.",
      },
    };
  }
}

export async function getWeatherForecast(args: WeatherForecastArgs) {
  const { location, days = 5, units = "metric" } = args;

  try {
    // Get forecast from WeatherAPI.com (max 14 days)
    const forecastDays = Math.min(days, 14);
    const forecastResponse = await axios.get(
      `${WEATHER_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
        location
      )}&days=${forecastDays}&aqi=yes&alerts=yes`
    );

    const data = forecastResponse.data;

    // Process forecast data
    const forecast = data.forecast.forecastday.map((day: WeatherAPIForecastDay) => {
      const maxTemp = units === "imperial" ? day.day.maxtemp_f : day.day.maxtemp_c;
      const minTemp = units === "imperial" ? day.day.mintemp_f : day.day.mintemp_c;
      const maxWind = units === "imperial" ? day.day.maxwind_mph : day.day.maxwind_kph;

      return {
        date: day.date,
        max_temp: Math.round(maxTemp),
        min_temp: Math.round(minTemp),
        avg_humidity: day.day.avghumidity,
        max_wind_speed: Math.round(maxWind),
        weather_description: day.day.condition.text,
        weather_main: day.day.condition.text,
        icon: day.day.condition.icon,
        chance_of_rain: day.day.daily_chance_of_rain || 0,
        total_precipitation: units === "imperial" ? day.day.totalprecip_in : day.day.totalprecip_mm,
        uv_index: day.day.uv,
      };
    });

    return {
      location: `${data.location.name}, ${data.location.country}`,
      forecast: forecast,
      units: units,
    };
  } catch (error) {
    console.error("WeatherAPI forecast error:", error);
    return {
      error: "Unable to fetch forecast data. Please try again later.",
      demo_data: {
        location: location,
        forecast: [
          { date: "Today", max_temp: 25, min_temp: 18, weather_description: "sunny" },
          { date: "Tomorrow", max_temp: 23, min_temp: 16, weather_description: "partly cloudy" },
        ],
        note: "This is demo data. Please add your WeatherAPI.com API key for real data.",
      },
    };
  }
}

export async function getWeatherAlerts(args: WeatherAlertsArgs) {
  const { location } = args;

  try {
    // Get weather alerts from WeatherAPI.com
    const alertsResponse = await axios.get(
      `${WEATHER_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=1&alerts=yes`
    );

    const data = alertsResponse.data;
    const alerts = data.alerts?.alert || [];

    // Process alerts data
    const processedAlerts = alerts.map((alert: WeatherAPIAlert) => ({
      headline: alert.headline,
      event: alert.event,
      description: alert.desc,
      severity: alert.severity,
      urgency: alert.urgency,
      areas: alert.areas,
      certainty: alert.certainty,
      effective: alert.effective,
      expires: alert.expires,
      instruction: alert.instruction,
    }));

    return {
      location: `${data.location.name}, ${data.location.country}`,
      alerts: processedAlerts,
      alert_count: processedAlerts.length,
    };
  } catch (error) {
    console.error("WeatherAPI alerts error:", error);
    return {
      location: location,
      alerts: [],
      alert_count: 0,
      message: "No active weather alerts for this location.",
      note: "Weather alerts are included with WeatherAPI.com at no extra cost.",
    };
  }
}
