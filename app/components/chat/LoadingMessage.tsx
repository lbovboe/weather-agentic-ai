import { WeatherIcon } from "../ui/WeatherIcon";

export const LoadingMessage = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-3xl bg-white/95 backdrop-blur-sm border border-blue-100/60 rounded-2xl rounded-bl-md shadow-lg shadow-blue-100/50 px-6 py-5">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
            <WeatherIcon
              weather="cloudy"
              className="w-4 h-4 text-white"
            />
          </div>
          <span className="text-sm font-semibold text-gray-700">WeatherBot AI</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
          </div>
          <span className="text-sm text-gray-600 font-medium">Fetching weather data...</span>
        </div>
      </div>
    </div>
  );
};
