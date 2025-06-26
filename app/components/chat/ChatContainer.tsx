import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { ChatMessage } from "./ChatMessage";
import { LoadingMessage } from "./LoadingMessage";
import { ChatInput } from "./ChatInput";
import { QuickSuggestions } from "./QuickSuggestions";
import { Message } from "../../types";

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content:
    "🌤️ Hello! I'm WeatherBot AI, your intelligent weather assistant. I can help you with:\n\n• Current weather conditions for any location\n• Detailed weather forecasts (up to 5 days)\n• Weather alerts and warnings\n• Weather-related recommendations\n\nJust ask me about the weather anywhere in the world!",
  timestamp: new Date(),
};

const QUICK_SUGGESTIONS = [
  "What's the weather in London?",
  "Show me the forecast for Tokyo",
  "Is it going to rain in Seattle today?",
  "Weather alerts for Miami",
];

interface ChatContainerProps {
  initialMessages?: Message[];
}

export interface ChatContainerRef {
  resetChat: () => void;
}

export const ChatContainer = forwardRef<ChatContainerRef, ChatContainerProps>(
  ({ initialMessages = [INITIAL_MESSAGE] }, ref) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const resetChat = () => {
      setMessages([INITIAL_MESSAGE]);
      setInput("");
    };

    useImperativeHandle(ref, () => ({
      resetChat,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!input.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "❌ I apologize, but I encountered an error. Please try again or check your API configuration.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="h-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-rows-[1fr_auto] gap-4">
        {/* Messages Area */}
        <div className="overflow-y-auto overscroll-behavior-contain">
          <div className="min-h-full flex flex-col justify-start py-6 space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
              />
            ))}

            {isLoading && <LoadingMessage />}

            <div
              ref={messagesEndRef}
              className="h-1"
            />
          </div>
        </div>

        {/* Input Area - Fixed Height */}
        <div className="bg-white/40 backdrop-blur-sm rounded-t-3xl border-t border-blue-100/60 p-6 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              input={input}
              onInputChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            <QuickSuggestions
              suggestions={QUICK_SUGGESTIONS}
              onSuggestionClick={setInput}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    );
  }
);
