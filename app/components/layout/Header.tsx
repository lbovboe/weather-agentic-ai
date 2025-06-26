import { RotateCcw } from "lucide-react";
import { WeatherIcon } from "../ui/WeatherIcon";

interface HeaderProps {
  onNewChat: () => void;
}

export const Header = ({ onNewChat }: HeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-blue-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <WeatherIcon
                weather="sunny"
                className="w-5 h-5 text-white"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">WeatherBot AI</h1>
              <p className="text-sm text-gray-500">Intelligent Weather Assistant</p>
            </div>
          </div>

          <button
            onClick={onNewChat}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
