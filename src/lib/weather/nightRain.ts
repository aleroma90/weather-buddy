import type { HourlyPoint } from "./types";

const RAIN_PROBABILITY_THRESHOLD = 30;

/**
 * Returns hourly points from `nowIso` through the next occurrence of
 * `endHour` (default 9am) on a later day, i.e. "the rest of the night".
 */
export function nightRainHours(
  hourly: HourlyPoint[],
  nowIso: string,
  endHour = 9
): HourlyPoint[] {
  const currentHour = nowIso.slice(0, 13);
  const startIndex = hourly.findIndex((point) => point.time.slice(0, 13) >= currentHour);
  if (startIndex === -1) return [];

  const startDate = hourly[startIndex].time.slice(0, 10);
  const result: HourlyPoint[] = [];

  for (let i = startIndex; i < hourly.length; i++) {
    const point = hourly[i];
    result.push(point);
    const date = point.time.slice(0, 10);
    const hour = Number(point.time.slice(11, 13));
    if (date !== startDate && hour >= endHour) break;
  }

  return result;
}

export type NightRainIntensity = "none" | "light" | "moderate" | "heavy";

export interface NightRainSummary {
  willRain: boolean;
  intensity: NightRainIntensity;
  totalMm: number;
  maxProbability: number;
  rainHours: HourlyPoint[];
}

export function summarizeNightRain(points: HourlyPoint[]): NightRainSummary {
  const rainHours = points.filter(
    (point) => (point.precipitationProbability ?? 0) >= RAIN_PROBABILITY_THRESHOLD || point.precipitation > 0
  );
  const totalMm = points.reduce((sum, point) => sum + point.precipitation, 0);
  const maxProbability = points.reduce(
    (max, point) => Math.max(max, point.precipitationProbability ?? 0),
    0
  );
  const willRain = rainHours.length > 0;

  let intensity: NightRainIntensity = "none";
  if (willRain) {
    if (totalMm >= 10 || maxProbability >= 80) {
      intensity = "heavy";
    } else if (totalMm >= 2 || maxProbability >= 50) {
      intensity = "moderate";
    } else {
      intensity = "light";
    }
  }

  return { willRain, intensity, totalMm, maxProbability, rainHours };
}
