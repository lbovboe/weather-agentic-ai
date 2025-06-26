import { getCurrentWeather, getWeatherForecast, getWeatherAlerts } from "./weatherService";

export async function executeWeatherTool(name: string, args: string) {
  try {
    const parsedArgs = JSON.parse(args);

    switch (name) {
      case "getCurrentWeather":
        return await getCurrentWeather(parsedArgs);
      case "getWeatherForecast":
        return await getWeatherForecast(parsedArgs);
      case "getWeatherAlerts":
        return await getWeatherAlerts(parsedArgs);
      default:
        return { error: "Unknown function" };
    }
  } catch (parseError) {
    console.error("Function argument parsing error:", parseError);
    return { error: "Error parsing function arguments" };
  }
}
