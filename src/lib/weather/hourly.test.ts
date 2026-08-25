import { describe, expect, it } from "vitest";
import { remainingHoursToday } from "./hourly";
import type { HourlyPoint } from "./types";

function point(time: string, temperature = 20): HourlyPoint {
  return { time, temperature, precipitation: 0, precipitationProbability: 0 };
}

describe("remainingHoursToday", () => {
  it("keeps only today's hours at or after the current hour", () => {
    const hourly = [
      point("2026-08-25T10:00"),
      point("2026-08-25T14:00"),
      point("2026-08-25T15:00"),
      point("2026-08-26T00:00"),
    ];
    const result = remainingHoursToday(hourly, "2026-08-25T14:30");
    expect(result.map((p) => p.time)).toEqual([
      "2026-08-25T14:00",
      "2026-08-25T15:00",
    ]);
  });

  it("returns just the last hour near midnight", () => {
    const hourly = [
      point("2026-08-25T22:00"),
      point("2026-08-25T23:00"),
      point("2026-08-26T00:00"),
    ];
    const result = remainingHoursToday(hourly, "2026-08-25T23:10");
    expect(result.map((p) => p.time)).toEqual(["2026-08-25T23:00"]);
  });

  it("returns an empty array once the day has fully passed", () => {
    const hourly = [point("2026-08-24T23:00"), point("2026-08-26T00:00")];
    const result = remainingHoursToday(hourly, "2026-08-25T09:00");
    expect(result).toEqual([]);
  });
});
