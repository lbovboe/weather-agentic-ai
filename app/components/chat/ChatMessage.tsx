import { WeatherIcon } from "../ui/WeatherIcon";
import { Message } from "../../types";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
      <div
        className={`max-w-3xl ${
          message.role === "user"
            ? "bg-blue-500 text-white rounded-2xl rounded-br-md"
            : "bg-white border border-blue-100 rounded-2xl rounded-bl-md shadow-sm"
        } px-5 py-4`}
      >
        {message.role === "assistant" && (
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <WeatherIcon
                weather="cloudy"
                className="w-4 h-4 text-white"
              />
            </div>
            <span className="text-sm font-medium text-gray-700">WeatherBot AI</span>
          </div>
        )}

        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            message.role === "user" ? "text-white" : "text-gray-800"
          }`}
        >
          {message.content}
        </div>

        <div className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-400"}`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};
