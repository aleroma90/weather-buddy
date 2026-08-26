import type { HourlyPoint } from "./types";

const RAIN_PROBABILITY_THRESHOLD = 30;

function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Returns hourly points covering "tonight": from `startHour` (default 9pm)
 * through `endHour` (default 9am) the next day. Always resolves to the
 * night currently in progress or the upcoming one, based on `nowIso`.
 */
export function nightWindowHours(
  hourly: HourlyPoint[],
  nowIso: string,
  startHour = 21,
  endHour = 9
): HourlyPoint[] {
  const nowDate = nowIso.slice(0, 10);
  const nowHour = Number(nowIso.slice(11, 13));

  const nightStartDate = nowHour < endHour ? addDaysToDateString(nowDate, -1) : nowDate;
  const nightEndDate = addDaysToDateString(nightStartDate, 1);

  const startKey = `${nightStartDate}T${String(startHour).padStart(2, "0")}`;
  const endKey = `${nightEndDate}T${String(endHour).padStart(2, "0")}`;

  return hourly.filter((point) => {
    const key = point.time.slice(0, 13);
    return key >= startKey && key <= endKey;
  });
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
