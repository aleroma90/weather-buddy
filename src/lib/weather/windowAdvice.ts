import type { HourlyPoint } from "./types";

export type WindowVerdict = "open" | "caution" | "close";

export interface WindowAdvice {
  verdict: WindowVerdict;
  /** Σ mm × probabilidad: milímetros "esperados" en la ventana de horas. */
  expectedMm: number;
  /** Hora con mayor probabilidad (desempata por mm). */
  peak: HourlyPoint | null;
  /** Primera hora con riesgo de lluvia (≥30% o mm > 0). */
  firstRiskHour: HourlyPoint | null;
  /** Hay viento fuerte en alguna hora con riesgo de lluvia. */
  windyRain: boolean;
}

const CAUTION_PROBABILITY = 30;
const CLOSE_PROBABILITY = 60;
const CLOSE_HOURLY_MM = 0.5;
const CLOSE_EXPECTED_MM = 1;
const STRONG_WIND_KMH = 18;

const probability = (p: HourlyPoint) => p.precipitationProbability ?? 0;

const isRisky = (p: HourlyPoint) =>
  probability(p) >= CAUTION_PROBABILITY || p.precipitation >= 0.1;

export function adviseWindow(points: HourlyPoint[]): WindowAdvice {
  const expectedMm = points.reduce(
    (sum, p) => sum + p.precipitation * (probability(p) / 100),
    0
  );

  const peak = points.reduce<HourlyPoint | null>((best, p) => {
    if (!best) return p;
    if (probability(p) > probability(best)) return p;
    if (probability(p) === probability(best) && p.precipitation > best.precipitation) return p;
    return best;
  }, null);

  const firstRiskHour = points.find(isRisky) ?? null;
  const windyRain = points.some((p) => isRisky(p) && p.windSpeed >= STRONG_WIND_KMH);
  const heavyHour = points.some(
    (p) => probability(p) >= CLOSE_PROBABILITY && p.precipitation >= CLOSE_HOURLY_MM
  );

  let verdict: WindowVerdict = "open";
  if (heavyHour || expectedMm >= CLOSE_EXPECTED_MM || windyRain) {
    verdict = "close";
  } else if (firstRiskHour) {
    verdict = "caution";
  }

  return { verdict, expectedMm, peak, firstRiskHour, windyRain };
}
