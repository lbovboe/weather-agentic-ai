# 🌤️ Weather Chat API Route Documentation

## Overview

The `/api/chat` route is a Next.js API endpoint that provides an intelligent weather assistant powered by OpenAI's GPT-4.1-nano and WeatherAPI.com. It processes user messages, determines when weather data is needed, executes weather tools, and returns conversational responses.

## 🏗️ Architecture

```
POST /api/chat
├── Request Validation
├── OpenAI Chat Completion (with tools)
├── Tool Execution (if needed)
├── Final Response Generation
└── Response Formatting
```

## 📋 Prerequisites

- OpenAI API Key configured in environment variables
- WeatherAPI.com API key (configured in weather service)
- Next.js 13+ with App Router

## 🔧 Environment Setup

```bash
# Required environment variables
OPENAI_API_KEY=your_openai_api_key_here
WEATHER_API_KEY=your_weatherapi_key_here

# Optional relevance classification settings
RELEVANCE_STRICTNESS=standard  # loose | standard | strict
```

## 📨 Request Format

### HTTP Method

```
POST /api/chat
```

### Headers

```json
{
  "Content-Type": "application/json"
}
```

### Request Body

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What's the weather like in New York City?"
    }
  ]
}
```

### Example Messages Array

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, I'm planning a trip to London tomorrow."
    },
    {
      "role": "assistant",
      "content": "Hello! I'd be happy to help you plan your trip to London. Would you like me to check the weather forecast for tomorrow?"
    },
    {
      "role": "user",
      "content": "Yes, please check the weather and let me know if I need an umbrella."
    }
  ]
}
```

## 🎯 Relevance Classification System

The chat API now includes an intelligent relevance classification system that ensures queries stay focused on weather-related topics. This system provides quality control and maintains the assistant's specialized purpose.

### Classification Levels

```typescript
enum RelevanceLevel {
  HIGHLY_RELEVANT = "highly_relevant", // Clear weather topics
  RELEVANT = "relevant", // Weather-adjacent content
  NEUTRAL = "neutral", // Greetings, basic conversation
  IRRELEVANT = "irrelevant", // Non-weather topics (rejected)
}
```

### Relevance Classification Process

1. **Quick Keyword Filter** - Fast pre-filtering using weather/non-weather keywords
2. **LLM Classification** - GPT-4o-mini classification for edge cases
3. **Confidence Scoring** - 0.0-1.0 confidence in classification decision
4. **Decision Making** - Accept/reject based on relevance and confidence

### Response Format for Rejected Queries

```json
{
  "message": "I'm WeatherBot AI, specialized in providing weather information and forecasts. Instead of that topic, I can help you with: What's the weather forecast for your location?\n\nHere are some weather questions I can help with:\n🌤️ \"What's the weather in New York?\"\n📅 \"Show me the 5-day forecast for London\"\n⚠️ \"Are there any weather alerts for my area?\"\n🌡️ \"What should I wear for today's weather?\"\n🌍 \"Explain how hurricanes form\"\n\nFeel free to ask me anything weather-related! 🌦️",
  "rejected": true,
  "reason": "query_not_weather_related",
  "classification": {
    "isRelevant": false,
    "level": "irrelevant",
    "confidence": 0.98,
    "reasoning": "Programming question unrelated to weather",
    "suggestedRedirect": "What's the weather forecast for your location?"
  }
}
```

### Classification Examples

**Accepted Queries:**

- ✅ "What's the weather in Tokyo?"
- ✅ "Will it rain tomorrow?"
- ✅ "What should I wear for today's weather?"
- ✅ "Explain how hurricanes form"
- ✅ "Hello there!" (basic conversation)

**Rejected Queries:**

- 🚫 "What is TypeScript?"
- 🚫 "How do I write JavaScript functions?"
- 🚫 "Tell me about React components"
- 🚫 "What's the best programming language?"

## 📊 Metrics API

The system includes comprehensive metrics tracking for monitoring classification performance and overall system health.

### Endpoint: `/api/metrics`

**Method:** GET

#### Query Parameters

- `hours` - Number of hours for recent metrics (default: 24)
- `detailed` - Include recent interactions (`true`/`false`)

#### Response Format

```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "relevance": {
    "totalQueries": 150,
    "relevantQueries": 117,
    "irrelevantQueries": 33,
    "accuracyRate": 94,
    "rejectionRate": 22,
    "averageConfidence": 89,
    "falsePositives": 2,
    "falseNegatives": 1,
    "levelDistribution": {
      "highly_relevant": 89,
      "relevant": 28,
      "neutral": 15,
      "irrelevant": 33
    }
  },
  "performance": {
    "averageResponseTime": 340,
    "successRate": 98,
    "averageTokensUsed": 245,
    "totalInteractions": 150
  },
  "evaluation": {
    "alertLevel": "low",
    "issues": [],
    "recommendation": "Classification performance is optimal."
  }
}
```

### Endpoint: `/api/metrics`

**Method:** POST

#### Description

Records user feedback about classification accuracy.

#### Request Body

```json
{
  "isClassificationWrong": true,
  "actuallyWeatherRelated": false
}
```

## 🔄 Detailed Workflow Steps

### Step 0: Relevance Classification (NEW)

```typescript
// Get the latest user message
const latestUserMessage = messages.filter((m) => m.role === "user").pop();
const userQuery = latestUserMessage.content;

// Quick keyword check first (performance optimization)
const quickCheck = quickRelevanceCheck(userQuery);
let relevanceResult;

if (quickCheck.skip) {
  // Skip full LLM classification for obvious cases
  relevanceResult = {
    isRelevant: quickCheck.isRelevant,
    level: quickCheck.isRelevant ? RelevanceLevel.HIGHLY_RELEVANT : RelevanceLevel.IRRELEVANT,
    confidence: 0.95,
    reasoning: quickCheck.isRelevant ? "Contains obvious weather keywords" : "Contains obvious non-weather keywords",
  };
} else {
  // Full LLM classification for edge cases
  relevanceResult = await classifyQueryRelevance(userQuery);
}

// Handle irrelevant queries
if (!relevanceResult.isRelevant) {
  const redirectResponse = generateIrrelevantResponse(relevanceResult);
  // Record metrics and return rejection response
}
```

### Step 1: Request Validation

```typescript
// API Key Validation
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy-key-for-build") {
  return NextResponse.json({ error: "OpenAI API key is not configured." }, { status: 500 });
}

// Message Format Validation
if (!messages || !Array.isArray(messages)) {
  return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
}
```

**Example Error Response:**

```json
{
  "error": "OpenAI API key is not configured. Please add your OPENAI_API_KEY to your environment variables."
}
```

### Step 2: Initial OpenAI Chat Completion

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4.1-nano",
  messages: [
    {
      role: "system",
      content: weatherSystemPrompt,
    },
    ...messages,
  ],
  tools: weatherTools,
  tool_choice: "auto",
  temperature: 0.7,
  max_tokens: 1000,
});
```

**System Prompt Used:**

```
You are WeatherBot AI, an intelligent weather assistant powered by WeatherAPI.com.
You provide accurate, helpful, and engaging weather information.

Key capabilities:
- Provide current weather conditions for any location worldwide
- Offer detailed weather forecasts up to 14 days
- Share weather alerts and warnings
- Give weather-related recommendations and insights
```

**Available Weather Tools:**

```javascript
[
  {
    type: "function",
    function: {
      name: "getCurrentWeather",
      description: "Get the current weather conditions for a specific location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: 'The city and state/country, e.g. "San Francisco, CA"',
          },
          units: {
            type: "string",
            enum: ["metric", "imperial"],
            description: "Temperature units",
          },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getWeatherForecast",
      description: "Get the weather forecast for a specific location",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string" },
          days: { type: "number", minimum: 1, maximum: 14 },
          units: { type: "string", enum: ["metric", "imperial"] },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getWeatherAlerts",
      description: "Get active weather alerts and warnings",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string" },
        },
        required: ["location"],
      },
    },
  },
];
```

### Step 3: Initial Response Analysis

**Example OpenAI Response (with tool calls):**

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "getCurrentWeather",
              "arguments": "{\"location\": \"New York City, NY\", \"units\": \"imperial\"}"
            }
          }
        ]
      }
    }
  ],
  "usage": {
    "prompt_tokens": 245,
    "completion_tokens": 25,
    "total_tokens": 270
  }
}
```

**Debug Logging Output:**

```
🤖 Initial ChatGPT Response Debug: {
  model: "gpt-4.1-nano",
  role: "assistant",
  hasToolCalls: true,
  toolCallsCount: 1,
  messageLength: 0,
  usage: { prompt_tokens: 245, completion_tokens: 25, total_tokens: 270 },
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

### Step 4: Tool Execution Loop

```typescript
if (responseMessage.tool_calls) {
  const toolMessages = [];

  for (const toolCall of responseMessage.tool_calls) {
    const { name, arguments: args } = toolCall.function;

    // Execute the weather tool
    const toolResult = await executeWeatherTool(name, args);

    toolMessages.push({
      role: "tool" as const,
      content: JSON.stringify(toolResult),
      tool_call_id: toolCall.id,
    });
  }
}
```

**Tool Execution Example:**

```javascript
// Input
toolCall = {
  id: "call_abc123",
  function: {
    name: "getCurrentWeather",
    arguments: '{"location": "New York City, NY", "units": "imperial"}',
  },
};

// Tool execution process
const parsedArgs = JSON.parse(args); // { location: "New York City, NY", units: "imperial" }
const result = await getCurrentWeather(parsedArgs);
```

**Tool Result Example:**

```json
{
  "location": {
    "name": "New York",
    "region": "New York",
    "country": "United States of America",
    "lat": 40.71,
    "lon": -74.01
  },
  "current": {
    "temp_f": 72.0,
    "temp_c": 22.2,
    "condition": {
      "text": "Partly cloudy",
      "icon": "//cdn.weatherapi.com/weather/64x64/day/116.png"
    },
    "wind_mph": 8.1,
    "wind_dir": "WSW",
    "humidity": 65,
    "feelslike_f": 75.0,
    "uv": 6.0
  }
}
```

**Tool Debug Logging:**

```
🛠️ Tool Call Debug: {
  toolCallId: "call_abc123",
  functionName: "getCurrentWeather",
  arguments: '{"location": "New York City, NY", "units": "imperial"}',
  timestamp: "2024-01-15T10:30:01.000Z"
}

✅ Tool Result Debug: {
  toolCallId: "call_abc123",
  functionName: "getCurrentWeather",
  resultSize: 458,
  hasError: false,
  timestamp: "2024-01-15T10:30:02.000Z"
}
```

### Step 5: Tool Messages Construction

```typescript
toolMessages.push({
  role: "tool" as const,
  content: JSON.stringify(toolResult),
  tool_call_id: toolCall.id,
});
```

**Constructed Tool Messages:**

```json
[
  {
    "role": "tool",
    "content": "{\"location\":{\"name\":\"New York\",\"region\":\"New York\",\"country\":\"United States of America\"},\"current\":{\"temp_f\":72.0,\"condition\":{\"text\":\"Partly cloudy\"}}}",
    "tool_call_id": "call_abc123"
  }
]
```

### Step 6: Final OpenAI Completion

```typescript
const finalCompletion = await openai.chat.completions.create({
  model: "gpt-4.1-nano",
  messages: [
    { role: "system", content: weatherSystemPrompt },
    ...messages, // Original user messages
    responseMessage, // Assistant's tool call message
    ...toolMessages, // Tool execution results
  ],
  temperature: 0.7,
  max_tokens: 1000,
});
```

**Final Message Chain Example:**

```json
[
  {
    "role": "system",
    "content": "You are WeatherBot AI..."
  },
  {
    "role": "user",
    "content": "What's the weather like in New York City?"
  },
  {
    "role": "assistant",
    "content": null,
    "tool_calls": [...]
  },
  {
    "role": "tool",
    "content": "{\"location\":{\"name\":\"New York\"...}}",
    "tool_call_id": "call_abc123"
  }
]
```

### Step 7: Final Response Processing

**Final OpenAI Response:**

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "🌤️ The weather in New York City is currently partly cloudy with a temperature of 72°F (22°C). It feels like 75°F with a gentle west-southwest wind at 8 mph. The humidity is at 65% and the UV index is 6, so you might want to wear sunscreen if you're planning to be outside for extended periods. It's a lovely day in the Big Apple! ☀️"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 387,
    "completion_tokens": 89,
    "total_tokens": 476
  }
}
```

**Final Debug Logging:**

```
🔧 Final ChatGPT Response Debug (with tools): {
  model: "gpt-4.1-nano",
  role: "assistant",
  messageLength: 312,
  toolsExecuted: 1,
  toolResults: [
    {
      tool_call_id: "call_abc123",
      contentLength: 458
    }
  ],
  usage: { prompt_tokens: 387, completion_tokens: 89, total_tokens: 476 },
  timestamp: "2024-01-15T10:30:03.000Z"
}
```

### Step 8: Response Formatting

```typescript
return NextResponse.json({
  message: finalCompletion.choices[0].message.content,
  usage: finalCompletion.usage,
});
```

## 📤 Response Formats

### Successful Response (with tools) - Weather Query Accepted

```json
{
  "message": "🌤️ The weather in New York City is currently partly cloudy with a temperature of 72°F (22°C). It feels like 75°F with a gentle west-southwest wind at 8 mph. The humidity is at 65% and the UV index is 6, so you might want to wear sunscreen if you're planning to be outside for extended periods. It's a lovely day in the Big Apple! ☀️",
  "usage": {
    "prompt_tokens": 387,
    "completion_tokens": 89,
    "total_tokens": 476
  },
  "classification": {
    "isRelevant": true,
    "level": "highly_relevant",
    "confidence": 0.98,
    "reasoning": "Clear weather information request"
  },
  "metrics": {
    "responseTimeMs": 450,
    "toolCallsExecuted": 1,
    "totalTokensUsed": 678
  }
}
```

### Successful Response (no tools needed) - Conversational

```json
{
  "message": "Hello! I'm WeatherBot AI, your friendly weather assistant. I can help you get current weather conditions, forecasts, and weather alerts for any location around the world. What would you like to know about the weather today?",
  "usage": {
    "prompt_tokens": 156,
    "completion_tokens": 45,
    "total_tokens": 201
  },
  "classification": {
    "isRelevant": true,
    "level": "neutral",
    "confidence": 0.92,
    "reasoning": "Basic conversational greeting"
  },
  "metrics": {
    "responseTimeMs": 180,
    "toolCallsExecuted": 0,
    "totalTokensUsed": 201
  }
}
```

### Rejected Response - Non-Weather Query

```json
{
  "message": "I'm WeatherBot AI, specialized in providing weather information and forecasts. Instead of that topic, I can help you with: What's the weather forecast for your location?\n\nHere are some weather questions I can help with:\n🌤️ \"What's the weather in New York?\"\n📅 \"Show me the 5-day forecast for London\"\n⚠️ \"Are there any weather alerts for my area?\"\n🌡️ \"What should I wear for today's weather?\"\n🌍 \"Explain how hurricanes form\"\n\nFeel free to ask me anything weather-related! 🌦️",
  "rejected": true,
  "reason": "query_not_weather_related",
  "classification": {
    "isRelevant": false,
    "level": "irrelevant",
    "confidence": 0.98,
    "reasoning": "Programming question unrelated to weather",
    "suggestedRedirect": "What's the weather forecast for your location?"
  }
}
```

### Error Response Examples

**Missing API Key:**

```json
{
  "error": "OpenAI API key is not configured. Please add your OPENAI_API_KEY to your environment variables."
}
```

**Invalid Request:**

```json
{
  "error": "Invalid messages format"
}
```

**General Error:**

```json
{
  "error": "Failed to process chat request. Please try again."
}
```

## 🛠️ Tool Integration Details

### Weather Tool Executor

The `executeWeatherTool` function handles three types of weather operations:

```typescript
export async function executeWeatherTool(name: string, args: string) {
  try {
    const parsedArgs = JSON.parse(args);

    switch (name) {
      case "getCurrentWeather":
        return await getCurrentWeather(parsedArgs);
      case "getWeatherForecast":
        return await getWeatherForecast(parsedArgs);
      case "getWeatherAlerts":
        return await getWeatherAlerts(parsedArgs);
      default:
        return { error: "Unknown function" };
    }
  } catch (parseError) {
    return { error: "Error parsing function arguments" };
  }
}
```

### Tool Input/Output Examples

**getCurrentWeather:**

```javascript
// Input
{ location: "London, UK", units: "metric" }

// Output
{
  "location": { "name": "London", "country": "United Kingdom" },
  "current": {
    "temp_c": 15.0,
    "condition": { "text": "Light rain" },
    "wind_kph": 12.9,
    "humidity": 78
  }
}
```

**getWeatherForecast:**

```javascript
// Input
{ location: "Tokyo, Japan", days: 3, units: "metric" }

// Output
{
  "location": { "name": "Tokyo", "country": "Japan" },
  "forecast": {
    "forecastday": [
      {
        "date": "2024-01-15",
        "day": {
          "maxtemp_c": 12.0,
          "mintemp_c": 5.0,
          "condition": { "text": "Sunny" }
        }
      }
    ]
  }
}
```

## 🔍 Debug Information

The API provides comprehensive debug logging for monitoring and troubleshooting:

### Debug Log Types

1. **Initial Response Debug** - Logs the first OpenAI API call
2. **Tool Call Debug** - Logs each tool execution
3. **Tool Result Debug** - Logs tool execution results
4. **Final Response Debug** - Logs the final OpenAI call with tool results
5. **Simple Response Debug** - Logs responses that don't require tools

### Example Debug Flow

```
🤖 Initial ChatGPT Response Debug: { hasToolCalls: true, toolCallsCount: 1 }
🛠️ Tool Call Debug: { functionName: "getCurrentWeather", arguments: "..." }
✅ Tool Result Debug: { resultSize: 458, hasError: false }
🔧 Final ChatGPT Response Debug: { toolsExecuted: 1, messageLength: 312 }
```

## 💡 Usage Examples

### Example 1: Simple Weather Query

```javascript
// Request
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "What's the weather in Paris?" }
  ]
}

// Response Flow:
// 1. Validates request
// 2. Calls OpenAI (determines tool needed)
// 3. Executes getCurrentWeather("Paris, France")
// 4. Gets final response with weather data
// 5. Returns formatted response
```

### Example 2: Multi-day Forecast

```javascript
// Request
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "I need a 5-day forecast for Miami, Florida" }
  ]
}

// Tool called: getWeatherForecast
// Arguments: { location: "Miami, Florida", days: 5 }
```

### Example 3: Conversational Context

```javascript
// Request
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "Hi there!" },
    { "role": "assistant", "content": "Hello! How can I help with weather information?" },
    { "role": "user", "content": "Check if it's raining in Seattle" }
  ]
}

// The API maintains conversation context while executing weather tools
```

## 🚨 Error Handling

The API includes comprehensive error handling:

1. **API Key Validation** - Prevents requests without proper authentication
2. **Input Validation** - Ensures proper message format
3. **Tool Execution Errors** - Handles weather API failures gracefully
4. **OpenAI API Errors** - Catches and handles external API failures
5. **JSON Parsing Errors** - Handles malformed tool arguments

All errors return appropriate HTTP status codes and descriptive error messages for debugging.

## 🔧 Technical Implementation Notes

- **Model**: Uses GPT-4.1-nano for optimal balance of performance and cost
- **Temperature**: Set to 0.7 for conversational but focused responses
- **Max Tokens**: Limited to 1000 to ensure concise responses
- **Tool Choice**: Set to "auto" to let AI decide when tools are needed
- **Error Recovery**: Graceful degradation when weather data unavailable

## 📈 Performance Considerations

- **Parallel Processing**: Tool calls are processed sequentially but efficiently
- **Token Management**: Responses limited to prevent excessive usage
- **Caching**: Consider implementing response caching for frequently requested locations
- **Rate Limiting**: Implement rate limiting for production usage

---

This documentation provides a complete overview of the weather chat API route implementation. For additional questions or modifications, refer to the source code in `app/api/chat/route.ts`.
