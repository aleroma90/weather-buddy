import type { Forecast, GeocodingResult } from "./types";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

export class WeatherApiError extends Error {}

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,apparent_temperature,precipitation,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,apparent_temperature_max,apparent_temperature_min",
    hourly:
      "temperature_2m,precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m",
    timezone: "auto",
    forecast_days: "7",
  });

  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new WeatherApiError("No se pudo obtener el pronóstico del tiempo.");
  }
  const data = await res.json();

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    current: {
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
      time: data.current.time,
    },
    daily: data.daily.time.map((date: string, i: number) => ({
      date,
      weatherCode: data.daily.weather_code[i],
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      apparentTempMax: data.daily.apparent_temperature_max[i],
      apparentTempMin: data.daily.apparent_temperature_min[i],
      precipitationProbabilityMax:
        data.daily.precipitation_probability_max?.[i] ?? null,
    })),
    hourly: data.hourly.time.map((time: string, i: number) => ({
      time,
      temperature: data.hourly.temperature_2m[i],
      precipitation: data.hourly.precipitation[i],
      precipitationProbability:
        data.hourly.precipitation_probability?.[i] ?? null,
      windSpeed: data.hourly.wind_speed_10m[i],
      windDirection: data.hourly.wind_direction_10m[i],
    })),
  };
}

export async function searchCity(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    name: query,
    count: "5",
    language: "es",
    format: "json",
  });

  const res = await fetch(`${GEOCODING_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new WeatherApiError("No se pudo buscar la ciudad.");
  }
  const data = await res.json();

  return (data.results ?? []).map((r: Record<string, unknown>) => ({
    id: r.id,
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));
}
