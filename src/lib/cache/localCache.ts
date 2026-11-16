import type { Forecast } from "@/lib/weather/types";

const LOCATION_KEY = "wb_last_location";
const FORECAST_KEY = "wb_last_forecast";

export interface CachedLocation {
  label: string;
  latitude: number;
  longitude: number;
}

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: caching is best-effort.
  }
}

export const loadCachedLocation = () => read<CachedLocation>(LOCATION_KEY);
export const saveCachedLocation = (l: CachedLocation) => write(LOCATION_KEY, l);

/** Only returns a forecast cached for the same coordinates. */
export function loadCachedForecast(lat: number, lon: number): Forecast | null {
  const cached = read<{ lat: number; lon: number; forecast: Forecast }>(FORECAST_KEY);
  if (!cached || cached.lat !== lat || cached.lon !== lon) return null;
  return cached.forecast;
}

export function saveCachedForecast(lat: number, lon: number, forecast: Forecast) {
  write(FORECAST_KEY, { lat, lon, forecast });
}
