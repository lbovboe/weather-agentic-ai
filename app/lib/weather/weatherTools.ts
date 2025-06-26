// OpenAI function calling tools configuration for weather services

export const weatherTools = [
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

// System prompt for the weather assistant
export const weatherSystemPrompt = `You are WeatherBot AI, an intelligent weather assistant powered by WeatherAPI.com. You provide accurate, helpful, and engaging weather information. 

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

Remember: You have access to real-time weather data through WeatherAPI.com. Always use the tools when users ask about weather conditions, forecasts, or alerts.`;
