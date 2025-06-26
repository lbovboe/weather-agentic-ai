import { WeatherIcon } from "../ui/WeatherIcon";

export const LoadingMessage = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-3xl bg-white border border-blue-100 rounded-2xl rounded-bl-md shadow-sm px-5 py-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <WeatherIcon
              weather="cloudy"
              className="w-4 h-4 text-white"
            />
          </div>
          <span className="text-sm font-medium text-gray-700">WeatherBot AI</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
          </div>
          <span className="text-sm text-gray-500">Fetching weather data...</span>
        </div>
      </div>
    </div>
  );
};
