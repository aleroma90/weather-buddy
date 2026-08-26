import { describe, expect, it } from "vitest";
import { nextHours } from "./hourly";
import type { HourlyPoint } from "./types";

function point(time: string, temperature = 20): HourlyPoint {
  return {
    time,
    temperature,
    precipitation: 0,
    precipitationProbability: 0,
    windSpeed: 0,
    windDirection: 0,
  };
}

describe("nextHours", () => {
  it("returns the next N hours starting at the current hour", () => {
    const hourly = [
      point("2026-08-25T10:00"),
      point("2026-08-25T14:00"),
      point("2026-08-25T15:00"),
      point("2026-08-25T16:00"),
    ];
    const result = nextHours(hourly, "2026-08-25T14:30", 2);
    expect(result.map((p) => p.time)).toEqual([
      "2026-08-25T14:00",
      "2026-08-25T15:00",
    ]);
  });

  it("crosses midnight into the next day instead of stopping at day end", () => {
    const hourly = [
      point("2026-08-25T22:00"),
      point("2026-08-25T23:00"),
      point("2026-08-26T00:00"),
      point("2026-08-26T01:00"),
    ];
    const result = nextHours(hourly, "2026-08-25T23:10", 3);
    expect(result.map((p) => p.time)).toEqual([
      "2026-08-25T23:00",
      "2026-08-26T00:00",
      "2026-08-26T01:00",
    ]);
  });

  it("returns fewer than count when the data runs out", () => {
    const hourly = [point("2026-08-25T23:00"), point("2026-08-26T00:00")];
    const result = nextHours(hourly, "2026-08-25T23:10", 12);
    expect(result.map((p) => p.time)).toEqual([
      "2026-08-25T23:00",
      "2026-08-26T00:00",
    ]);
  });

  it("returns an empty array once the data has fully passed", () => {
    const hourly = [point("2026-08-24T23:00"), point("2026-08-25T00:00")];
    const result = nextHours(hourly, "2026-08-25T09:00", 12);
    expect(result).toEqual([]);
  });
});
