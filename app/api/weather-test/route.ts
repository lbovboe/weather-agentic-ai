import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { WeatherAPIError, WeatherAPIForecastDay, WeatherAPIAlert } from "../../types";

// WeatherAPI.com configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "demo_key";
const WEATHER_BASE_URL = "http://api.weatherapi.com/v1";

// Test function for current weather
async function testCurrentWeather(location: string) {
  try {
    const weatherResponse = await axios.get(
      `${WEATHER_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&aqi=yes`
    );

    const data = weatherResponse.data;

    return {
      success: true,
      location: `${data.location.name}, ${data.location.country}`,
      temperature: `${data.current.temp_c}°C / ${data.current.temp_f}°F`,
      condition: data.current.condition.text,
      humidity: `${data.current.humidity}%`,
      wind: `${data.current.wind_kph} km/h ${data.current.wind_dir}`,
      feels_like: `${data.current.feelslike_c}°C / ${data.current.feelslike_f}°F`,
      uv_index: data.current.uv,
      api_status: "WeatherAPI.com connection successful ✅",
    };
  } catch (error: unknown) {
    const apiError = error as WeatherAPIError;
    console.error("WeatherAPI test error:", apiError);

    if (apiError.response?.status === 401) {
      return {
        success: false,
        error: "Invalid API key. Please check your WEATHER_API_KEY in .env file",
        api_status: "Authentication failed ❌",
      };
    } else if (apiError.response?.status === 400) {
      return {
        success: false,
        error: "Invalid location. Please try a different location name",
        api_status: "Bad request ❌",
      };
    } else {
      return {
        success: false,
        error: "Unable to connect to WeatherAPI.com. Please check your internet connection",
        api_status: "Connection failed ❌",
      };
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || "London";

  // Check if API key is configured
  if (!process.env.WEATHER_API_KEY || process.env.WEATHER_API_KEY === "demo_key") {
    return NextResponse.json(
      {
        success: false,
        error: "WeatherAPI.com API key is not configured",
        instructions: [
          "1. Sign up at https://www.weatherapi.com/signup.aspx",
          "2. Get your free API key",
          "3. Add WEATHER_API_KEY=your_key_here to your .env file",
          "4. Restart your development server",
        ],
        api_status: "No API key configured ⚠️",
      },
      { status: 400 }
    );
  }

  const result = await testCurrentWeather(location);

  return NextResponse.json({
    ...result,
    test_info: {
      endpoint_used: `${WEATHER_BASE_URL}/current.json`,
      location_tested: location,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { location = "London", test_type = "current" } = body;

  // Check if API key is configured
  if (!process.env.WEATHER_API_KEY || process.env.WEATHER_API_KEY === "demo_key") {
    return NextResponse.json(
      {
        success: false,
        error: "WeatherAPI.com API key is not configured",
        instructions: [
          "1. Sign up at https://www.weatherapi.com/signup.aspx",
          "2. Get your free API key",
          "3. Add WEATHER_API_KEY=your_key_here to your .env file",
          "4. Restart your development server",
        ],
        api_status: "No API key configured ⚠️",
      },
      { status: 400 }
    );
  }

  let result;

  switch (test_type) {
    case "current":
      result = await testCurrentWeather(location);
      break;
    case "forecast":
      result = await testForecast(location);
      break;
    case "alerts":
      result = await testAlerts(location);
      break;
    default:
      result = await testCurrentWeather(location);
  }

  return NextResponse.json({
    ...result,
    test_info: {
      test_type,
      location_tested: location,
      timestamp: new Date().toISOString(),
    },
  });
}

// Test function for forecast
async function testForecast(location: string) {
  try {
    const forecastResponse = await axios.get(
      `${WEATHER_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=3`
    );

    const data = forecastResponse.data;
    const forecast = data.forecast.forecastday.map((day: WeatherAPIForecastDay) => ({
      date: day.date,
      max_temp: `${day.day.maxtemp_c}°C / ${day.day.maxtemp_f}°F`,
      min_temp: `${day.day.mintemp_c}°C / ${day.day.mintemp_f}°F`,
      condition: day.day.condition.text,
      chance_of_rain: `${day.day.daily_chance_of_rain}%`,
    }));

    return {
      success: true,
      location: `${data.location.name}, ${data.location.country}`,
      forecast: forecast,
      api_status: "WeatherAPI.com forecast test successful ✅",
    };
  } catch (error: unknown) {
    const apiError = error as WeatherAPIError;
    return {
      success: false,
      error: "Forecast test failed",
      details: apiError.response?.data?.error?.message || apiError.message,
      api_status: "Forecast test failed ❌",
    };
  }
}

// Test function for alerts
async function testAlerts(location: string) {
  try {
    const alertsResponse = await axios.get(
      `${WEATHER_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=1&alerts=yes`
    );

    const data = alertsResponse.data;
    const alerts = data.alerts?.alert || [];

    return {
      success: true,
      location: `${data.location.name}, ${data.location.country}`,
      alerts_count: alerts.length,
      alerts:
        alerts.length > 0
          ? alerts.map((alert: WeatherAPIAlert) => ({
              headline: alert.headline,
              severity: alert.severity,
              areas: alert.areas,
            }))
          : "No active alerts",
      api_status: "WeatherAPI.com alerts test successful ✅",
    };
  } catch (error: unknown) {
    const apiError = error as WeatherAPIError;
    return {
      success: false,
      error: "Alerts test failed",
      details: apiError.response?.data?.error?.message || apiError.message,
      api_status: "Alerts test failed ❌",
    };
  }
}
