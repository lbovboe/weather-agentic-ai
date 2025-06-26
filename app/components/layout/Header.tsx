import { RotateCcw } from "lucide-react";
import { WeatherIcon } from "../ui/WeatherIcon";

interface HeaderProps {
  onNewChat: () => void;
}

export const Header = ({ onNewChat }: HeaderProps) => {
  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-blue-100/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <WeatherIcon
                weather="sunny"
                className="w-5 h-5 text-white"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                WeatherBot AI
              </h1>
              <p className="text-sm text-gray-600 font-medium">Intelligent Weather Assistant</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                WeatherBot AI
              </h1>
            </div>
          </div>

          <button
            onClick={onNewChat}
            className="group flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-600/30 hover:scale-105"
          >
            <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
