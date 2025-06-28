import { WeatherIcon } from "../ui/WeatherIcon";
import { Message } from "../../types";
import ReactMarkdown from "react-markdown";
interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
      <div
        className={`max-w-3xl transition-all duration-200 hover:scale-[1.02] ${
          message.role === "user"
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-blue-500/25"
            : "bg-white/95 backdrop-blur-sm border border-blue-100/60 rounded-2xl rounded-bl-md shadow-lg shadow-blue-100/50"
        } px-6 py-5`}
      >
        {message.role === "assistant" && (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
              <WeatherIcon
                weather="cloudy"
                className="w-4 h-4 text-white"
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">WeatherBot AI</span>
          </div>
        )}

        <div
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            message.role === "user" ? "text-white" : "text-gray-800"
          }`}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        <div className={`text-xs mt-3 font-medium ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
          {message.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};
