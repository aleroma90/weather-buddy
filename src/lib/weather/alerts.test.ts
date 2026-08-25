import { describe, expect, it } from "vitest";
import { computeTemperatureAlerts } from "./alerts";
import type { ForecastDay } from "./types";

function day(date: string, tempMax: number): ForecastDay {
  return {
    date,
    weatherCode: 0,
    tempMax,
    tempMin: tempMax - 5,
    apparentTempMax: tempMax,
    apparentTempMin: tempMax - 5,
    precipitationProbabilityMax: null,
  };
}

describe("computeTemperatureAlerts", () => {
  it("returns no alerts when temperatures are stable", () => {
    const daily = [day("2026-08-21", 20), day("2026-08-22", 21), day("2026-08-23", 19)];
    expect(computeTemperatureAlerts(daily)).toEqual([]);
  });

  it("flags a rise at/above the threshold as 'subirá'", () => {
    const daily = [day("2026-08-21", 15), day("2026-08-22", 21)];
    const alerts = computeTemperatureAlerts(daily);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toContain("subirá");
    expect(alerts[0]).toContain("6°C");
  });

  it("flags a drop at/above the threshold as 'bajará'", () => {
    const daily = [day("2026-08-21", 20), day("2026-08-22", 13)];
    const alerts = computeTemperatureAlerts(daily);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toContain("bajará");
    expect(alerts[0]).toContain("7°C");
  });

  it("uses 'mañana' as the label for day index 1, capitalized", () => {
    const daily = [day("2026-08-21", 10), day("2026-08-22", 16)];
    const alerts = computeTemperatureAlerts(daily);
    expect(alerts[0]).toMatch(/^Mañana/);
  });

  it("respects a custom threshold", () => {
    const daily = [day("2026-08-21", 20), day("2026-08-22", 22)];
    expect(computeTemperatureAlerts(daily, 5)).toEqual([]);
    expect(computeTemperatureAlerts(daily, 1)).toHaveLength(1);
  });

  it("only checks up to the first 4 days", () => {
    const daily = [
      day("2026-08-21", 10),
      day("2026-08-22", 10),
      day("2026-08-23", 10),
      day("2026-08-24", 10),
      day("2026-08-25", 30),
    ];
    expect(computeTemperatureAlerts(daily)).toEqual([]);
  });
});
