import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

// Classification confidence levels
export enum RelevanceLevel {
  HIGHLY_RELEVANT = "highly_relevant", // Clearly weather-related
  RELEVANT = "relevant", // Weather-adjacent or educational
  NEUTRAL = "neutral", // Greetings, general conversation
  IRRELEVANT = "irrelevant", // Completely unrelated to weather
}

export interface RelevanceResult {
  isRelevant: boolean;
  level: RelevanceLevel;
  confidence: number; // 0.0 to 1.0
  reasoning: string;
  suggestedRedirect?: string; // Helpful suggestion if irrelevant
}

// Relevance classification prompt
const RELEVANCE_CLASSIFIER_PROMPT = `You are a query classifier for a weather assistant. Determine if a user query is related to weather, climate, or atmospheric conditions.

WEATHER-RELATED TOPICS (ACCEPT):
✅ Current weather conditions, forecasts, alerts
✅ Climate information and seasonal patterns  
✅ Weather phenomena explanations (hurricanes, snow, etc.)
✅ Weather-dependent activities (clothing, travel, outdoor plans)
✅ Air quality, UV index, atmospheric pressure
✅ Location-based weather questions
✅ Weather impact questions (flooding, storms, etc.)
✅ Historical weather data

ALLOWED CONVERSATIONAL:
✅ Greetings, thanks, basic conversation
✅ Questions about weather assistant capabilities
✅ Follow-up questions to previous weather discussions

NOT WEATHER-RELATED (REJECT):
❌ Programming, technology, software development
❌ General knowledge unrelated to weather/climate
❌ Non-weather science topics
❌ Entertainment, sports (unless weather-impact related)
❌ Shopping, finance, health (unless weather-related)
❌ Philosophy, politics, personal advice

Respond with ONLY a JSON object:
{
  "level": "highly_relevant|relevant|neutral|irrelevant",
  "confidence": 0.95,
  "reasoning": "Brief explanation of classification",
  "suggestedRedirect": "Optional weather-related alternative if irrelevant"
}`;

export async function classifyQueryRelevance(query: string): Promise<RelevanceResult> {
  try {
    // Skip classification for very short queries (likely greetings)
    if (query.trim().length < 3) {
      return {
        isRelevant: true,
        level: RelevanceLevel.NEUTRAL,
        confidence: 0.9,
        reasoning: "Very short query, likely conversational",
      };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano", // Fast and cost-effective for classification
      messages: [
        {
          role: "system",
          content: RELEVANCE_CLASSIFIER_PROMPT,
        },
        {
          role: "user",
          content: `Classify this query: "${query}"`,
        },
      ],
      temperature: 0.1, // Low temperature for consistent classification
      max_tokens: 150,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response from classifier");
    }

    // Parse the JSON response
    const classification = JSON.parse(responseContent);

    const isRelevant = classification.level !== "irrelevant";

    return {
      isRelevant,
      level: classification.level as RelevanceLevel,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      suggestedRedirect: classification.suggestedRedirect,
    };
  } catch (error) {
    console.error("Relevance classification error:", error);

    // Fallback: Allow query but with low confidence
    return {
      isRelevant: true,
      level: RelevanceLevel.NEUTRAL,
      confidence: 0.5,
      reasoning: "Classification failed, allowing query as fallback",
    };
  }
}

// Quick keyword-based pre-filter for obvious cases (performance optimization)
export function quickRelevanceCheck(query: string): { skip: boolean; isRelevant: boolean } {
  const lowerQuery = query.toLowerCase();

  // Obviously weather-related keywords (skip full classification)
  const weatherKeywords = [
    "weather",
    "temperature",
    "rain",
    "snow",
    "wind",
    "storm",
    "forecast",
    "sunny",
    "cloudy",
    "humidity",
    "pressure",
    "climate",
    "season",
    "hurricane",
    "tornado",
    "blizzard",
    "thunderstorm",
    "fog",
    "hail",
    "celsius",
    "fahrenheit",
    "degrees",
    "hot",
    "cold",
    "warm",
    "cool",
    "umbrella",
    "jacket",
    "shorts",
    "uv",
    "sunrise",
    "sunset",
  ];

  // Obviously non-weather keywords (immediate rejection)
  const nonWeatherKeywords = [
    "typescript",
    "javascript",
    "python",
    "programming",
    "code",
    "software",
    "database",
    "api",
    "function",
    "variable",
    "array",
    "object",
    "css",
    "html",
    "react",
    "angular",
    "vue",
    "node",
    "npm",
    "git",
    "github",
    "deploy",
  ];

  if (weatherKeywords.some((keyword) => lowerQuery.includes(keyword))) {
    return { skip: true, isRelevant: true };
  }

  if (nonWeatherKeywords.some((keyword) => lowerQuery.includes(keyword))) {
    return { skip: true, isRelevant: false };
  }

  return { skip: false, isRelevant: true }; // Continue with full classification
}

// Generate helpful response for irrelevant queries
export function generateIrrelevantResponse(classification: RelevanceResult): string {
  const baseMessage = "I'm WeatherBot AI, specialized in providing weather information and forecasts. ";

  let response = baseMessage;

  if (classification.suggestedRedirect) {
    response += `${classification.suggestedRedirect}\n\n`;
  }

  response += `Here are some weather questions I can help with:
🌤️ "What's the weather in New York?"
📅 "Show me the 5-day forecast for London"
⚠️ "Are there any weather alerts for my area?"
🌡️ "What should I wear for today's weather?"
🌍 "Explain how hurricanes form"

Feel free to ask me anything weather-related! 🌦️`;

  return response;
}
