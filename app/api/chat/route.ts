import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { weatherTools, weatherSystemPrompt, executeWeatherTool } from "../../lib/weather";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

// 🚀 CONVERSATION OPTIMIZATION: Message Trimming Strategy
// Limits conversation history to prevent token overflow and reduce costs
const MAX_CONVERSATION_MESSAGES = 20; // Keeps last 20 messages (~2000-3000 tokens)

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

    // 🔧 OPTIMIZATION: Trim conversation history to prevent token overflow
    // WHY: Long conversations can exceed model token limits (4K-8K tokens) and increase costs
    // BENEFIT: ~85% cost reduction, faster responses, prevents API errors
    // TRADE-OFF: AI loses context of very old messages (usually not needed for weather chat)
    const trimmedMessages = messages.slice(-MAX_CONVERSATION_MESSAGES);

    // Create initial chat completion with tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      // 💡 CONVERSATION MEMORY IMPLEMENTATION:
      // OpenAI's API is completely stateless - it has NO memory of previous conversations.
      // To create the illusion of "memory", we manually send the ENTIRE conversation history
      // with every single API call. The frontend maintains all messages in state and sends
      // them here via the `messages` parameter. This is the standard approach for chat apps.
      messages: [
        {
          // 🎭 ROLE EXPLAINED: Defines who is "speaking" in the conversation
          // - "system": Sets AI behavior, personality, and instructions (like a character prompt)
          // - "user": Human/user messages and questions
          // - "assistant": AI responses and answers
          // - "tool": Results from function/tool executions (weather API data, etc.)
          role: "system",
          content: weatherSystemPrompt,
        },
        ...trimmedMessages, // 👈 Now using TRIMMED messages instead of ALL messages
      ],
      tools: weatherTools,
      tool_choice: "auto",
      // 🌡️ TEMPERATURE EXPLAINED: Controls AI creativity/randomness (0.0 - 2.0)
      // - 0.0: Completely deterministic, same input = same output every time
      // - 0.7: Balanced creativity and consistency (RECOMMENDED for most use cases)
      // - 1.0: Standard creativity level, good for general conversations
      // - 2.0: Very creative/random, might be unpredictable or incoherent
      // Weather apps use 0.7 for helpful but consistent responses
      temperature: 0.7,
      // 🔢 MAX_TOKENS EXPLAINED: Maximum OUTPUT tokens (NOT input tokens!)
      // - This limits how LONG the AI's response can be, not the input size
      // - 1 token ≈ 0.75 words, so 1000 tokens ≈ 750 words max response
      // - Input tokens are counted separately and have different limits
      // - If response hits this limit, it gets cut off mid-sentence
      // - Weather responses are usually concise, so 1000 is generous
      max_tokens: 1000,
    });

    const responseMessage = completion.choices[0].message;

    // Debug logging for initial completion
    console.log("🤖 Initial ChatGPT Response Debug:", {
      model: completion.model,
      // 📝 RESPONSE ROLE: Will always be "assistant" for direct AI responses
      // Even when the AI wants to call tools, the role is still "assistant"
      // but the message will contain "tool_calls" instead of just "content"
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

        console.log("🛠️ Tool Call Debug:", {
          toolCallId: toolCall.id,
          functionName: name,
          arguments: args,
          timestamp: new Date().toISOString(),
        });

        // Execute the weather tool
        const toolResult = await executeWeatherTool(name, args);

        console.log("✅ Tool Result Debug:", {
          toolCallId: toolCall.id,
          functionName: name,
          resultSize: JSON.stringify(toolResult).length,
          hasError: !!(toolResult as any).error,
          timestamp: new Date().toISOString(),
        });

        toolMessages.push({
          // 🔧 TOOL ROLE: Special role for function execution results
          // - This creates a "tool" message containing the weather API data
          // - The tool_call_id links this result back to the original tool request
          // - This is how the AI learns what happened when it called the weather function
          role: "tool" as const,
          content: JSON.stringify(toolResult),
          tool_call_id: toolCall.id,
        });
      }

      // Get final response from OpenAI with tool results
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        // 💡 Again, sending TRIMMED conversation history + tool results for context
        // Using same trimmed messages for consistency and optimization
        //
        // 🔄 MESSAGE FLOW WITH ROLES:
        // 1. system: "You are a weather assistant..." (sets behavior)
        // 2. user: "What's the weather in Tokyo?" (human question)
        // 3. assistant: [tool_calls to get weather] (AI wants to call function)
        // 4. tool: {"temperature": 25, "condition": "sunny"} (function result)
        // 5. assistant: "It's 25°C and sunny in Tokyo!" (final AI response)
        messages: [
          {
            role: "system",
            content: weatherSystemPrompt,
          },
          ...trimmedMessages, // 👈 Trimmed conversation messages (optimized)
          responseMessage, // 👈 The assistant's response with tool_calls
          ...toolMessages, // 👈 Results from executing the weather tools (role: "tool")
        ],
        // 🌡️ Same temperature setting for consistency in conversation tone
        temperature: 0.7,
        // 🔢 Same max_tokens limit for the final response after processing tools
        max_tokens: 1000,
      });

      // Debug logging for final completion with tool results
      console.log("🔧 Final ChatGPT Response Debug (with tools):", {
        model: finalCompletion.model,
        // 📝 FINAL RESPONSE ROLE: Always "assistant" for the final formatted answer
        // After processing tool results, AI gives a human-friendly response as "assistant"
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
