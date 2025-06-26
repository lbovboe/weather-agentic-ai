import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

// Weather API configuration (using OpenWeatherMap as an example)
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "demo_key";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Tool functions for weather data
async function getCurrentWeather(args: { location: string; units?: string }) {
  const { location, units = "metric" } = args;

  try {
    // Get coordinates first
    const geoResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${WEATHER_API_KEY}`
    );

    if (geoResponse.data.length === 0) {
      return { error: "Location not found. Please try a different location." };
    }

    const { lat, lon, name, country } = geoResponse.data[0];

    // Get current weather
    const weatherResponse = await axios.get(
      `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}`
    );

    const data = weatherResponse.data;

    return {
      location: `${name}, ${country}`,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility / 1000, // Convert to km
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      weather_description: data.weather[0].description,
      weather_main: data.weather[0].main,
      icon: data.weather[0].icon,
      units: units,
    };
  } catch (error) {
    console.error("Weather API error:", error);
    return {
      error: "Unable to fetch weather data. Please try again later.",
      demo_data: {
        location: location,
        temperature: 22,
        feels_like: 25,
        humidity: 65,
        weather_description: "partly cloudy",
        note: "This is demo data. Please add your OpenWeatherMap API key for real data.",
      },
    };
  }
}

async function getWeatherForecast(args: { location: string; days?: number; units?: string }) {
  const { location, days = 5, units = "metric" } = args;

  try {
    // Get coordinates first
    const geoResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${WEATHER_API_KEY}`
    );

    if (geoResponse.data.length === 0) {
      return { error: "Location not found. Please try a different location." };
    }

    const { lat, lon, name, country } = geoResponse.data[0];

    // Get 5-day forecast
    const forecastResponse = await axios.get(
      `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}`
    );

    const data = forecastResponse.data;

    // Group by day and get daily summary
    interface DailyForecast {
      date: string;
      temperatures: number[];
      weather: Array<{ description: string; main: string; icon: string }>;
      humidity: number[];
      wind_speed: number[];
    }

    interface WeatherItem {
      dt: number;
      main: { temp: number; humidity: number };
      weather: Array<{ description: string; main: string; icon: string }>;
      wind: { speed: number };
    }

    const dailyForecasts = data.list.reduce((acc: Record<string, DailyForecast>, item: WeatherItem) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!acc[date]) {
        acc[date] = {
          date: date,
          temperatures: [],
          weather: [],
          humidity: [],
          wind_speed: [],
        };
      }
      acc[date].temperatures.push(item.main.temp);
      acc[date].weather.push(item.weather[0]);
      acc[date].humidity.push(item.main.humidity);
      acc[date].wind_speed.push(item.wind.speed);
      return acc;
    }, {});

    const dailyValues = Object.values(dailyForecasts) as DailyForecast[];
    const forecast = dailyValues.slice(0, days).map((day) => ({
      date: day.date,
      max_temp: Math.round(Math.max(...day.temperatures)),
      min_temp: Math.round(Math.min(...day.temperatures)),
      avg_humidity: Math.round(day.humidity.reduce((a: number, b: number) => a + b, 0) / day.humidity.length),
      avg_wind_speed: Math.round(day.wind_speed.reduce((a: number, b: number) => a + b, 0) / day.wind_speed.length),
      weather_description: day.weather[0].description,
      weather_main: day.weather[0].main,
      icon: day.weather[0].icon,
    }));

    return {
      location: `${name}, ${country}`,
      forecast: forecast,
      units: units,
    };
  } catch (error) {
    console.error("Forecast API error:", error);
    return {
      error: "Unable to fetch forecast data. Please try again later.",
      demo_data: {
        location: location,
        forecast: [
          { date: "Today", max_temp: 25, min_temp: 18, weather_description: "sunny" },
          { date: "Tomorrow", max_temp: 23, min_temp: 16, weather_description: "partly cloudy" },
        ],
        note: "This is demo data. Please add your OpenWeatherMap API key for real data.",
      },
    };
  }
}

async function getWeatherAlerts(args: { location: string }) {
  const { location } = args;

  try {
    // Get coordinates first
    const geoResponse = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${WEATHER_API_KEY}`
    );

    if (geoResponse.data.length === 0) {
      return { error: "Location not found. Please try a different location." };
    }

    const { lat, lon, name, country } = geoResponse.data[0];

    // Get weather alerts (requires One Call API)
    const alertsResponse = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&exclude=current,minutely,hourly,daily`
    );

    const alerts = alertsResponse.data.alerts || [];

    interface WeatherAlert {
      event: string;
      description: string;
      start: number;
      end: number;
      sender_name: string;
    }

    return {
      location: `${name}, ${country}`,
      alerts: alerts.map((alert: WeatherAlert) => ({
        event: alert.event,
        description: alert.description,
        start: new Date(alert.start * 1000).toLocaleString(),
        end: new Date(alert.end * 1000).toLocaleString(),
        sender_name: alert.sender_name,
      })),
    };
  } catch (apiError) {
    console.error("Alerts API error:", apiError);
    return {
      location: location,
      alerts: [],
      message: "No active weather alerts for this location.",
      note: "Weather alerts require a premium API key.",
    };
  }
}

// Define the tools for OpenAI function calling
const tools = [
  {
    type: "function" as const,
    function: {
      name: "getCurrentWeather",
      description: "Get the current weather conditions for a specific location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: 'The city and state/country, e.g. "San Francisco, CA" or "London, UK"',
          },
          units: {
            type: "string",
            enum: ["metric", "imperial"],
            description: "Temperature units (metric for Celsius, imperial for Fahrenheit)",
          },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getWeatherForecast",
      description: "Get the weather forecast for a specific location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: 'The city and state/country, e.g. "San Francisco, CA" or "London, UK"',
          },
          days: {
            type: "number",
            description: "Number of days for the forecast (1-5)",
            minimum: 1,
            maximum: 5,
          },
          units: {
            type: "string",
            enum: ["metric", "imperial"],
            description: "Temperature units (metric for Celsius, imperial for Fahrenheit)",
          },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getWeatherAlerts",
      description: "Get active weather alerts and warnings for a specific location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: 'The city and state/country, e.g. "San Francisco, CA" or "London, UK"',
          },
        },
        required: ["location"],
      },
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy-key-for-build") {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please add your OPENAI_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // Create initial chat completion with tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4o Mini as requested
      messages: [
        {
          role: "system",
          content: `You are WeatherBot AI, an intelligent weather assistant. You provide accurate, helpful, and engaging weather information. 

Key capabilities:
- Provide current weather conditions for any location
- Offer detailed weather forecasts
- Share weather alerts and warnings
- Give weather-related recommendations and insights
- Explain weather phenomena in an easy-to-understand way

Guidelines:
- Always be helpful, friendly, and conversational
- Use the weather tools to get real-time data
- Provide context and interpretation of weather data
- Offer practical advice based on weather conditions
- If weather data is unavailable, provide general guidance
- Format responses clearly with key information highlighted
- Include relevant emoji to make responses more engaging

Remember: You have access to real-time weather data through your tools. Always use them when users ask about weather conditions, forecasts, or alerts.`,
        },
        ...messages,
      ],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseMessage = completion.choices[0].message;

    // If the model wants to call functions, execute them
    if (responseMessage.tool_calls) {
      const toolMessages = [];

      for (const toolCall of responseMessage.tool_calls) {
        const { name, arguments: args } = toolCall.function;
        let toolResult;

        try {
          const parsedArgs = JSON.parse(args);

          switch (name) {
            case "getCurrentWeather":
              toolResult = await getCurrentWeather(parsedArgs);
              break;
            case "getWeatherForecast":
              toolResult = await getWeatherForecast(parsedArgs);
              break;
            case "getWeatherAlerts":
              toolResult = await getWeatherAlerts(parsedArgs);
              break;
            default:
              toolResult = { error: "Unknown function" };
          }
        } catch (parseError) {
          console.error("Function argument parsing error:", parseError);
          toolResult = { error: "Error parsing function arguments" };
        }

        toolMessages.push({
          role: "tool" as const,
          content: JSON.stringify(toolResult),
          tool_call_id: toolCall.id,
        });
      }

      // Get final response from OpenAI with tool results
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are WeatherBot AI, an intelligent weather assistant. You provide accurate, helpful, and engaging weather information. 

Key capabilities:
- Provide current weather conditions for any location
- Offer detailed weather forecasts
- Share weather alerts and warnings
- Give weather-related recommendations and insights
- Explain weather phenomena in an easy-to-understand way

Guidelines:
- Always be helpful, friendly, and conversational
- Use the weather tools to get real-time data
- Provide context and interpretation of weather data
- Offer practical advice based on weather conditions
- If weather data is unavailable, provide general guidance
- Format responses clearly with key information highlighted
- Include relevant emoji to make responses more engaging

Remember: You have access to real-time weather data through your tools. Always use them when users ask about weather conditions, forecasts, or alerts.`,
          },
          ...messages,
          responseMessage,
          ...toolMessages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return NextResponse.json({
        message: finalCompletion.choices[0].message.content,
        usage: finalCompletion.usage,
      });
    }

    return NextResponse.json({
      message: responseMessage.content,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat request. Please try again." }, { status: 500 });
  }
}
