import { describe, expect, it } from "vitest";
import { adviseWindow } from "./windowAdvice";
import type { HourlyPoint } from "./types";

function point(
  hour: number,
  precipitation = 0,
  precipitationProbability: number | null = 0,
  windSpeed = 0
): HourlyPoint {
  return {
    time: `2026-08-25T${String(hour).padStart(2, "0")}:00`,
    temperature: 15,
    precipitation,
    precipitationProbability,
    windSpeed,
    windDirection: 0,
  };
}

describe("adviseWindow", () => {
  it("says open when there is no rain risk", () => {
    const advice = adviseWindow([point(10), point(11, 0, 10), point(12)]);
    expect(advice.verdict).toBe("open");
    expect(advice.firstRiskHour).toBeNull();
    expect(advice.expectedMm).toBe(0);
  });

  it("says caution for a moderate probability with little rain", () => {
    const advice = adviseWindow([point(10), point(11, 0.1, 40), point(12)]);
    expect(advice.verdict).toBe("caution");
    expect(advice.firstRiskHour?.time).toBe("2026-08-25T11:00");
  });

  it("says close for a likely, significant hour", () => {
    const advice = adviseWindow([point(10), point(11, 0.8, 70)]);
    expect(advice.verdict).toBe("close");
    expect(advice.peak?.time).toBe("2026-08-25T11:00");
  });

  it("weights mm by probability for the expected total", () => {
    const advice = adviseWindow([point(10, 2, 50), point(11, 1, 50)]);
    expect(advice.expectedMm).toBeCloseTo(1.5);
    expect(advice.verdict).toBe("close");
  });

  it("closes on rain risk with strong wind", () => {
    const advice = adviseWindow([point(10, 0, 35, 25)]);
    expect(advice.windyRain).toBe(true);
    expect(advice.verdict).toBe("close");
  });

  it("breaks peak ties by mm", () => {
    const advice = adviseWindow([point(10, 0.2, 50), point(11, 1, 50)]);
    expect(advice.peak?.time).toBe("2026-08-25T11:00");
  });

  it("handles missing probability and empty input", () => {
    expect(adviseWindow([point(10, 0, null)]).verdict).toBe("open");
    expect(adviseWindow([]).peak).toBeNull();
  });
});
