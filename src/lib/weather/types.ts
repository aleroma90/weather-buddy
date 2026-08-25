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

export interface Forecast {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  daily: ForecastDay[];
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
