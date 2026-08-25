export interface WeatherCodeInfo {
  label: string;
  icon: string;
}

// WMO weather interpretation codes -> Spanish label + emoji icon
const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { label: "Cielo despejado", icon: "☀️" },
  1: { label: "Mayormente despejado", icon: "🌤️" },
  2: { label: "Parcialmente nublado", icon: "⛅" },
  3: { label: "Nublado", icon: "☁️" },
  45: { label: "Niebla", icon: "🌫️" },
  48: { label: "Niebla con escarcha", icon: "🌫️" },
  51: { label: "Llovizna ligera", icon: "🌦️" },
  53: { label: "Llovizna moderada", icon: "🌦️" },
  55: { label: "Llovizna intensa", icon: "🌧️" },
  56: { label: "Llovizna helada ligera", icon: "🌧️" },
  57: { label: "Llovizna helada intensa", icon: "🌧️" },
  61: { label: "Lluvia ligera", icon: "🌦️" },
  63: { label: "Lluvia moderada", icon: "🌧️" },
  65: { label: "Lluvia intensa", icon: "🌧️" },
  66: { label: "Lluvia helada ligera", icon: "🌧️" },
  67: { label: "Lluvia helada intensa", icon: "🌧️" },
  71: { label: "Nevada ligera", icon: "🌨️" },
  73: { label: "Nevada moderada", icon: "🌨️" },
  75: { label: "Nevada intensa", icon: "❄️" },
  77: { label: "Granos de nieve", icon: "❄️" },
  80: { label: "Chubascos ligeros", icon: "🌦️" },
  81: { label: "Chubascos moderados", icon: "🌧️" },
  82: { label: "Chubascos violentos", icon: "⛈️" },
  85: { label: "Chubascos de nieve ligeros", icon: "🌨️" },
  86: { label: "Chubascos de nieve intensos", icon: "🌨️" },
  95: { label: "Tormenta eléctrica", icon: "⛈️" },
  96: { label: "Tormenta con granizo ligero", icon: "⛈️" },
  99: { label: "Tormenta con granizo intenso", icon: "⛈️" },
};

const DEFAULT_INFO: WeatherCodeInfo = { label: "Condición desconocida", icon: "🌡️" };

export function getWeatherCodeInfo(code: number): WeatherCodeInfo {
  return WEATHER_CODES[code] ?? DEFAULT_INFO;
}

export type ConditionBucket = "despejado" | "nublado" | "lluvia" | "tormenta" | "nieve";

export function conditionBucket(code: number): ConditionBucket {
  if (code === 0 || code === 1) return "despejado";
  if (code === 2 || code === 3 || code === 45 || code === 48) return "nublado";
  if (code >= 95) return "tormenta";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "nieve";
  return "lluvia";
}
