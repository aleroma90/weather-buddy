import { describe, expect, it } from "vitest";
import { temperatureBucket } from "./buckets";

describe("temperatureBucket", () => {
  it("buckets negative temperatures as <0", () => {
    expect(temperatureBucket(-5)).toBe("<0");
  });

  it("buckets boundary values into the upper bucket (inclusive lower bound)", () => {
    expect(temperatureBucket(0)).toBe("0-5");
    expect(temperatureBucket(5)).toBe("5-10");
    expect(temperatureBucket(10)).toBe("10-15");
    expect(temperatureBucket(15)).toBe("15-20");
    expect(temperatureBucket(20)).toBe("20-25");
    expect(temperatureBucket(25)).toBe("25-30");
    expect(temperatureBucket(30)).toBe(">30");
  });

  it("buckets values within a range correctly", () => {
    expect(temperatureBucket(3)).toBe("0-5");
    expect(temperatureBucket(22)).toBe("20-25");
  });

  it("buckets very high temperatures as >30", () => {
    expect(temperatureBucket(40)).toBe(">30");
  });
});
