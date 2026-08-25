import type { HourlyPoint } from "./types";

/**
 * Filters hourly points to those remaining today, using `nowIso` (the
 * location's local "current" time from the API, not the browser's clock)
 * as the reference so results stay correct for locations in other timezones.
 */
export function remainingHoursToday(
  hourly: HourlyPoint[],
  nowIso: string
): HourlyPoint[] {
  const today = nowIso.slice(0, 10);
  const nowHour = Number(nowIso.slice(11, 13));

  return hourly.filter((point) => {
    const date = point.time.slice(0, 10);
    const hour = Number(point.time.slice(11, 13));
    return date === today && hour >= nowHour;
  });
}
