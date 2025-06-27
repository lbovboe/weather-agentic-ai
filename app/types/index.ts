export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Weather API response types
export interface WeatherAPILocation {
  name: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
}

export interface WeatherAPICondition {
  text: string;
  icon: string;
  code: number;
}

export interface WeatherAPICurrent {
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  humidity: number;
  wind_kph: number;
  wind_mph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  vis_km: number;
  vis_miles: number;
  uv: number;
  condition: WeatherAPICondition;
}

export interface WeatherAPIDay {
  date: string;
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  avgtemp_c: number;
  avgtemp_f: number;
  maxwind_mph: number;
  maxwind_kph: number;
  totalprecip_mm: number;
  totalprecip_in: number;
  avghumidity: number;
  daily_will_it_rain: number;
  daily_chance_of_rain: number;
  daily_will_it_snow: number;
  daily_chance_of_snow: number;
  condition: WeatherAPICondition;
  uv: number;
}

export interface WeatherAPIForecastDay {
  date: string;
  date_epoch: number;
  day: WeatherAPIDay;
}

export interface WeatherAPIForecast {
  forecastday: WeatherAPIForecastDay[];
}

export interface WeatherAPIAlert {
  headline: string;
  msgtype: string;
  severity: string;
  urgency: string;
  areas: string;
  category: string;
  certainty: string;
  event: string;
  note: string;
  effective: string;
  expires: string;
  desc: string;
  instruction: string;
}

export interface WeatherAPICurrentResponse {
  location: WeatherAPILocation;
  current: WeatherAPICurrent;
}

export interface WeatherAPIForecastResponse {
  location: WeatherAPILocation;
  current: WeatherAPICurrent;
  forecast: WeatherAPIForecast;
  alerts?: {
    alert: WeatherAPIAlert[];
  };
}

export interface WeatherAPIError {
  response?: {
    status: number;
    data?: {
      error?: {
        message: string;
      };
    };
  };
  message: string;
}
