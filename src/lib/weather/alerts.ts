import type { ForecastDay } from "./types";

const THRESHOLD_C = 5;
const MAX_DAYS_CHECKED = 4;

function dayLabel(dateStr: string, dayIndex: number): string {
  if (dayIndex === 0) return "hoy";
  if (dayIndex === 1) return "mañana";
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(date);
}

export function computeTemperatureAlerts(
  daily: ForecastDay[],
  thresholdC: number = THRESHOLD_C
): string[] {
  const alerts: string[] = [];
  const days = daily.slice(0, MAX_DAYS_CHECKED);

  for (let i = 1; i < days.length; i++) {
    const delta = days[i].tempMax - days[i - 1].tempMax;
    if (Math.abs(delta) >= thresholdC) {
      const today = dayLabel(days[i].date, i);
      const prev = dayLabel(days[i - 1].date, i - 1);
      const direction = delta < 0 ? "bajará" : "subirá";
      const label = i === 1 ? today[0].toUpperCase() + today.slice(1) : today;
      alerts.push(
        `${label} la temperatura ${direction} ${Math.abs(Math.round(delta))}°C respecto a ${prev}`
      );
    }
  }

  return alerts;
}
