export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  precipitation: number;
  weatherCode: number;
  time: string;
}

export interface ForecastDay {
  date: string; // ISO date, e.g. 2026-08-21
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  precipitationProbabilityMax: number | null;
}

export interface HourlyPoint {
  time: string; // ISO local datetime, e.g. 2026-08-25T14:00
  temperature: number;
  precipitation: number;
  precipitationProbability: number | null;
  windSpeed: number; // km/h
  windDirection: number; // degrees, direction the wind is coming from
}

export interface Forecast {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  daily: ForecastDay[];
  hourly: HourlyPoint[];
}

export interface GeocodingResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}
