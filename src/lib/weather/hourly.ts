import type { HourlyPoint } from "./types";

/**
 * Returns the next `count` hourly points starting at the current hour,
 * using `nowIso` (the location's local "current" time from the API, not
 * the browser's clock) as the reference. Unlike a same-day filter, this
 * crosses midnight so "next 12 hours" stays 12 hours even late at night.
 */
export function nextHours(
  hourly: HourlyPoint[],
  nowIso: string,
  count: number
): HourlyPoint[] {
  const currentHour = nowIso.slice(0, 13);
  const startIndex = hourly.findIndex((point) => point.time.slice(0, 13) >= currentHour);
  if (startIndex === -1) return [];
  return hourly.slice(startIndex, startIndex + count);
}
