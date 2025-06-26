import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

// WeatherAPI.com configuration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "demo_key";
const WEATHER_BASE_URL = "http://api.weatherapi.com/v1";

// Tool functions for weather data using WeatherAPI.com
async function getCurrentWeather(args: { location: string; units?: string }) {
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

async function getWeatherForecast(args: { location: string; days?: number; units?: string }) {
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
    const forecast = data.forecast.forecastday.map((day: any) => {
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

async function getWeatherAlerts(args: { location: string }) {
  const { location } = args;

  try {
    // Get weather alerts from WeatherAPI.com
    const alertsResponse = await axios.get(
      `${WEATHER_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=1&alerts=yes`
    );

    const data = alertsResponse.data;
    const alerts = data.alerts?.alert || [];

    // Process alerts data
    const processedAlerts = alerts.map((alert: any) => ({
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
            description: "Number of days for the forecast (1-14)",
            minimum: 1,
            maximum: 14,
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
      model: "gpt-4.1-nano", // Using GPT-4o Mini as requested
      messages: [
        {
          role: "system",
          content: `You are WeatherBot AI, an intelligent weather assistant powered by WeatherAPI.com. You provide accurate, helpful, and engaging weather information. 

Key capabilities:
- Provide current weather conditions for any location worldwide
- Offer detailed weather forecasts up to 14 days
- Share weather alerts and warnings
- Give weather-related recommendations and insights
- Explain weather phenomena in an easy-to-understand way

Guidelines:
- Always be helpful, friendly, and conversational
- Use the weather tools to get real-time data from WeatherAPI.com
- Provide context and interpretation of weather data
- Offer practical advice based on weather conditions
- If weather data is unavailable, provide general guidance
- Format responses clearly with key information highlighted
- Include relevant emoji to make responses more engaging
- WeatherAPI.com provides comprehensive weather data including air quality and UV index

Remember: You have access to real-time weather data through WeatherAPI.com. Always use the tools when users ask about weather conditions, forecasts, or alerts.`,
        },
        ...messages,
      ],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseMessage = completion.choices[0].message;

    // Debug logging for initial completion
    console.log("🤖 Initial ChatGPT Response Debug:", {
      model: completion.model,
      role: responseMessage.role,
      hasToolCalls: !!responseMessage.tool_calls,
      toolCallsCount: responseMessage.tool_calls?.length || 0,
      messageLength: responseMessage.content?.length || 0,
      usage: completion.usage,
      timestamp: new Date().toISOString(),
    });

    // If the model wants to call functions, execute them
    if (responseMessage.tool_calls) {
      const toolMessages = [];

      for (const toolCall of responseMessage.tool_calls) {
        const { name, arguments: args } = toolCall.function;
        let toolResult;

        console.log("🛠️ Tool Call Debug:", {
          toolCallId: toolCall.id,
          functionName: name,
          arguments: args,
          timestamp: new Date().toISOString(),
        });

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

          console.log("✅ Tool Result Debug:", {
            toolCallId: toolCall.id,
            functionName: name,
            resultSize: JSON.stringify(toolResult).length,
            hasError: !!(toolResult as any).error,
            timestamp: new Date().toISOString(),
          });
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
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: `You are WeatherBot AI, an intelligent weather assistant powered by WeatherAPI.com. You provide accurate, helpful, and engaging weather information. 

Key capabilities:
- Provide current weather conditions for any location worldwide
- Offer detailed weather forecasts up to 14 days
- Share weather alerts and warnings
- Give weather-related recommendations and insights
- Explain weather phenomena in an easy-to-understand way

Guidelines:
- Always be helpful, friendly, and conversational
- Use the weather tools to get real-time data from WeatherAPI.com
- Provide context and interpretation of weather data
- Offer practical advice based on weather conditions
- If weather data is unavailable, provide general guidance
- Format responses clearly with key information highlighted
- Include relevant emoji to make responses more engaging
- WeatherAPI.com provides comprehensive weather data including air quality and UV index

Remember: You have access to real-time weather data through WeatherAPI.com. Always use the tools when users ask about weather conditions, forecasts, or alerts.`,
          },
          ...messages,
          responseMessage,
          ...toolMessages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Debug logging for final completion with tool results
      console.log("🔧 Final ChatGPT Response Debug (with tools):", {
        model: finalCompletion.model,
        role: finalCompletion.choices[0].message.role,
        messageLength: finalCompletion.choices[0].message.content?.length || 0,
        toolsExecuted: toolMessages.length,
        toolResults: toolMessages.map((tm) => ({
          tool_call_id: tm.tool_call_id,
          contentLength: tm.content.length,
        })),
        usage: finalCompletion.usage,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        message: finalCompletion.choices[0].message.content,
        usage: finalCompletion.usage,
      });
    }

    // Debug logging for simple response (no tools)
    console.log("💬 Simple ChatGPT Response Debug (no tools):", {
      model: completion.model,
      role: responseMessage.role,
      messageLength: responseMessage.content?.length || 0,
      usage: completion.usage,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: responseMessage.content,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat request. Please try again." }, { status: 500 });
  }
}
