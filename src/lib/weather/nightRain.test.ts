import { describe, expect, it } from "vitest";
import { nightWindowHours, summarizeNightRain } from "./nightRain";
import type { HourlyPoint } from "./types";

function point(time: string, precipitation = 0, precipitationProbability: number | null = 0): HourlyPoint {
  return {
    time,
    temperature: 15,
    precipitation,
    precipitationProbability,
    windSpeed: 0,
    windDirection: 0,
  };
}

const hourly = [
  point("2026-08-25T19:00"),
  point("2026-08-25T20:00"),
  point("2026-08-25T21:00"),
  point("2026-08-25T22:00"),
  point("2026-08-25T23:00"),
  point("2026-08-26T00:00"),
  point("2026-08-26T08:00"),
  point("2026-08-26T09:00"),
  point("2026-08-26T10:00"),
  point("2026-08-26T21:00"),
];

describe("nightWindowHours", () => {
  it("targets the upcoming night when it's daytime", () => {
    const result = nightWindowHours(hourly, "2026-08-25T15:00", 21, 9);
    expect(result.map((p) => p.time)).toEqual([
      "2026-08-25T21:00",
      "2026-08-25T22:00",
      "2026-08-25T23:00",
      "2026-08-26T00:00",
      "2026-08-26T08:00",
      "2026-08-26T09:00",
    ]);
  });

  it("stays on the same night once past the start hour", () => {
    const result = nightWindowHours(hourly, "2026-08-25T22:30", 21, 9);
    expect(result.map((p) => p.time)).toEqual([
      "2026-08-25T21:00",
      "2026-08-25T22:00",
      "2026-08-25T23:00",
      "2026-08-26T00:00",
      "2026-08-26T08:00",
      "2026-08-26T09:00",
    ]);
  });

  it("stays on the previous night's window during early morning", () => {
    const result = nightWindowHours(hourly, "2026-08-26T05:00", 21, 9);
    expect(result.map((p) => p.time)).toEqual([
      "2026-08-25T21:00",
      "2026-08-25T22:00",
      "2026-08-25T23:00",
      "2026-08-26T00:00",
      "2026-08-26T08:00",
      "2026-08-26T09:00",
    ]);
  });
});

describe("summarizeNightRain", () => {
  it("reports no rain when nothing crosses the threshold", () => {
    const summary = summarizeNightRain([point("2026-08-25T21:00", 0, 10)]);
    expect(summary.willRain).toBe(false);
    expect(summary.intensity).toBe("none");
  });

  it("reports heavy rain for high probability or accumulation", () => {
    const summary = summarizeNightRain([point("2026-08-25T21:00", 6, 90)]);
    expect(summary.willRain).toBe(true);
    expect(summary.intensity).toBe("heavy");
  });
});
