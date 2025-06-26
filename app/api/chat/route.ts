import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { weatherTools, weatherSystemPrompt, executeWeatherTool } from "../../lib/weather";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

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
