import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  weatherTools,
  weatherSystemPrompt,
  executeWeatherTool,
  classifyQueryRelevance,
  quickRelevanceCheck,
  generateIrrelevantResponse,
  metricsStore,
  createInteractionRecord,
  logMetricsSummary,
  RelevanceLevel,
  RelevanceResult,
} from "../../lib/weather";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

// 🚀 CONVERSATION OPTIMIZATION: Message Trimming Strategy
// Limits conversation history to prevent token overflow and reduce costs
const MAX_CONVERSATION_MESSAGES = 5; // Keeps last 5 messages (~500-750 tokens)

export async function POST(request: NextRequest) {
  const startTime = Date.now();

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

    // Get the latest user message for relevance checking
    const latestUserMessage = messages.filter((m) => m.role === "user").pop();
    if (!latestUserMessage?.content) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 });
    }

    const userQuery = latestUserMessage.content;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 🎯 RELEVANCE CLASSIFICATION: Check if query is weather-related
    console.log("🔍 Starting relevance classification for:", userQuery);

    // Quick keyword check first (performance optimization)
    const quickCheck = quickRelevanceCheck(userQuery);
    let relevanceResult: RelevanceResult;

    if (quickCheck.skip) {
      // Skip full LLM classification for obvious cases
      relevanceResult = {
        isRelevant: quickCheck.isRelevant,
        level: quickCheck.isRelevant ? RelevanceLevel.HIGHLY_RELEVANT : RelevanceLevel.IRRELEVANT,
        confidence: 0.95,
        reasoning: quickCheck.isRelevant
          ? "Contains obvious weather keywords"
          : "Contains obvious non-weather keywords",
      };
      console.log("⚡ Quick classification result:", relevanceResult);
    } else {
      // Full LLM classification for edge cases
      const classificationStart = Date.now();
      relevanceResult = await classifyQueryRelevance(userQuery);
      const classificationTime = Date.now() - classificationStart;
      console.log("🤖 Full LLM classification result:", {
        ...relevanceResult,
        classificationTimeMs: classificationTime,
      });
    }

    // 🚫 HANDLE IRRELEVANT QUERIES: Return helpful redirect message
    if (!relevanceResult.isRelevant) {
      const redirectResponse = generateIrrelevantResponse(relevanceResult);
      const responseTime = Date.now() - startTime;

      // Record metrics for rejected query
      const performanceMetrics = {
        responseTimeMs: responseTime,
        toolCallsExecuted: 0,
        tokensUsed: 0, // No main LLM call for rejected queries
        completedSuccessfully: true,
      };

      const interactionRecord = createInteractionRecord(
        sessionId,
        userQuery,
        relevanceResult,
        performanceMetrics,
        false, // no weather data retrieved
        false // no error occurred
      );

      metricsStore.recordInteraction(interactionRecord);

      console.log("🚫 Query Rejected - Not Weather Related:", {
        query: userQuery.substring(0, 50) + "...",
        level: relevanceResult.level,
        confidence: relevanceResult.confidence,
        reasoning: relevanceResult.reasoning,
        responseTimeMs: responseTime,
      });

      return NextResponse.json({
        message: redirectResponse,
        rejected: true,
        reason: "query_not_weather_related",
        classification: relevanceResult,
      });
    }

    // 🔧 OPTIMIZATION: Trim conversation history to prevent token overflow
    const trimmedMessages = messages.slice(-MAX_CONVERSATION_MESSAGES);

    // ✅ PROCESS WEATHER-RELATED QUERY: Continue with normal weather assistant flow
    console.log("✅ Query Accepted - Weather Related:", {
      query: userQuery.substring(0, 50) + "...",
      level: relevanceResult.level,
      confidence: relevanceResult.confidence,
    });

    // Create initial chat completion with tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: weatherSystemPrompt,
        },
        ...trimmedMessages,
      ],
      tools: weatherTools,
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

    let weatherDataRetrieved = false;
    let totalTokensUsed = completion.usage?.total_tokens || 0;
    let toolCallsExecuted = 0;

    // If the model wants to call functions, execute them
    if (responseMessage.tool_calls) {
      const toolMessages = [];

      for (const toolCall of responseMessage.tool_calls) {
        const { name, arguments: args } = toolCall.function;
        toolCallsExecuted++;

        console.log("🛠️ Tool Call Debug:", {
          toolCallId: toolCall.id,
          functionName: name,
          arguments: args,
          timestamp: new Date().toISOString(),
        });

        // Execute the weather tool
        const toolResult = await executeWeatherTool(name, args);
        weatherDataRetrieved = true;

        console.log("✅ Tool Result Debug:", {
          toolCallId: toolCall.id,
          functionName: name,
          resultSize: JSON.stringify(toolResult).length,
          hasError: !!(toolResult as Record<string, unknown>).error,
          timestamp: new Date().toISOString(),
        });

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
            content: weatherSystemPrompt,
          },
          ...trimmedMessages,
          responseMessage,
          ...toolMessages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      totalTokensUsed += finalCompletion.usage?.total_tokens || 0;

      // Debug logging for final completion with tool results
      console.log("🔧 Final ChatGPT Response Debug (with tools):", {
        model: finalCompletion.model,
        role: finalCompletion.choices[0].message.role,
        messageLength: finalCompletion.choices[0].message.content?.length || 0,
        toolsExecuted: toolMessages.length,
        usage: finalCompletion.usage,
        timestamp: new Date().toISOString(),
      });

      const responseTime = Date.now() - startTime;

      // 📊 RECORD METRICS: Track successful weather interaction
      const performanceMetrics = {
        responseTimeMs: responseTime,
        toolCallsExecuted,
        tokensUsed: totalTokensUsed,
        completedSuccessfully: true,
      };

      const interactionRecord = createInteractionRecord(
        sessionId,
        userQuery,
        relevanceResult,
        performanceMetrics,
        weatherDataRetrieved,
        false
      );

      metricsStore.recordInteraction(interactionRecord);

      return NextResponse.json({
        message: finalCompletion.choices[0].message.content,
        usage: finalCompletion.usage,
        classification: relevanceResult,
        metrics: {
          responseTimeMs: responseTime,
          toolCallsExecuted,
          totalTokensUsed,
        },
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

    const responseTime = Date.now() - startTime;

    // 📊 RECORD METRICS: Track simple weather conversation
    const performanceMetrics = {
      responseTimeMs: responseTime,
      toolCallsExecuted: 0,
      tokensUsed: totalTokensUsed,
      completedSuccessfully: true,
    };

    const interactionRecord = createInteractionRecord(
      sessionId,
      userQuery,
      relevanceResult,
      performanceMetrics,
      weatherDataRetrieved,
      false
    );

    metricsStore.recordInteraction(interactionRecord);

    return NextResponse.json({
      message: responseMessage.content,
      usage: completion.usage,
      classification: relevanceResult,
      metrics: {
        responseTimeMs: responseTime,
        toolCallsExecuted: 0,
        totalTokensUsed,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);

    const responseTime = Date.now() - startTime;

    // 📊 RECORD ERROR METRICS: Track failed interactions
    try {
      const sessionId = `error_session_${Date.now()}`;
      const errorClassification: RelevanceResult = {
        isRelevant: true, // Assume relevant since we couldn't classify
        level: RelevanceLevel.NEUTRAL,
        confidence: 0.5,
        reasoning: "Error occurred before classification",
      };

      const performanceMetrics = {
        responseTimeMs: responseTime,
        toolCallsExecuted: 0,
        tokensUsed: 0,
        completedSuccessfully: false,
      };

      const interactionRecord = createInteractionRecord(
        sessionId,
        "Error occurred",
        errorClassification,
        performanceMetrics,
        false,
        true
      );

      metricsStore.recordInteraction(interactionRecord);
    } catch (metricsError) {
      console.error("Failed to record error metrics:", metricsError);
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to process chat request. Please try again.",
        errorDetails: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  } finally {
    // 📈 PERIODIC METRICS LOGGING: Log summary every 10 interactions
    try {
      const stats = metricsStore.getRelevanceStats();
      if (stats.totalQueries > 0 && stats.totalQueries % 10 === 0) {
        logMetricsSummary();
      }
    } catch (metricsError) {
      console.error("Failed to log metrics summary:", metricsError);
    }
  }
}
