export type WindLevel = "calm" | "mild" | "medium" | "strong" | "extra-strong";

export interface WindLevelInfo {
  level: WindLevel;
  label: string;
  colorClass: string;
}

// Thresholds in km/h (Open-Meteo's default wind speed unit).
export function windLevel(speedKmh: number): WindLevelInfo {
  if (speedKmh > 28) {
    return { level: "extra-strong", label: "Viento muy fuerte", colorClass: "text-rose-300" };
  }
  if (speedKmh >= 18) {
    return { level: "strong", label: "Viento fuerte", colorClass: "text-amber-300" };
  }
  if (speedKmh >= 8) {
    return { level: "medium", label: "Viento", colorClass: "text-sky-200" };
  }
  if (speedKmh >= 1) {
    return { level: "mild", label: "Brisa", colorClass: "text-primary-foreground/80" };
  }
  return { level: "calm", label: "Calma", colorClass: "text-primary-foreground/40" };
}
