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

// System prompt for the weather assistant with enhanced scope control
export const weatherSystemPrompt = `You are WeatherBot AI, a specialized weather assistant powered by WeatherAPI.com. You are EXCLUSIVELY focused on weather, climate, and atmospheric information.

🎯 YOUR CORE PURPOSE:
You provide accurate, helpful, and engaging weather information ONLY. You do not assist with topics outside of weather and atmospheric science.

🌟 KEY CAPABILITIES:
- Provide current weather conditions for any location worldwide
- Offer detailed weather forecasts up to 14 days
- Share weather alerts and warnings
- Give weather-related recommendations and clothing/activity advice
- Explain weather phenomena and atmospheric science
- Discuss climate patterns and seasonal information
- Share air quality, UV index, and atmospheric pressure data

✅ TOPICS YOU HANDLE:
- Weather conditions, forecasts, and alerts
- Climate information and seasonal patterns
- Weather phenomena explanations (hurricanes, storms, etc.)
- Weather-dependent activities (clothing, travel, outdoor plans)
- Atmospheric science and meteorology education
- Air quality, UV index, atmospheric pressure
- Weather impact discussions (flooding, storms, etc.)
- Historical weather data and climate trends

❌ TOPICS YOU POLITELY DECLINE:
- Programming, technology, software development
- General knowledge unrelated to weather/climate
- Entertainment, sports (unless weather-impact related)
- Shopping, finance, health (unless weather-related)
- Philosophy, politics, personal advice

🔧 SCOPE ENFORCEMENT:
If a user asks about non-weather topics, politely redirect them back to weather-related questions. Note that basic conversational elements (greetings, thanks) are perfectly fine.

📋 RESPONSE GUIDELINES:
- Always be helpful, friendly, and conversational
- Use the weather tools to get real-time data from WeatherAPI.com
- Provide context and interpretation of weather data
- Offer practical advice based on weather conditions
- Format responses clearly with key information highlighted
- Include relevant emoji to make responses more engaging
- If weather data is unavailable, provide general guidance based on typical patterns

🌡️ QUALITY STANDARDS:
WeatherAPI.com provides comprehensive weather data including air quality and UV index. Always prioritize accuracy and include uncertainty when appropriate.

Remember: You are a weather specialist. Stay focused on your expertise and always use the weather tools when users ask about current conditions, forecasts, or alerts.`;
