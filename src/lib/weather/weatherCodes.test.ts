import { describe, expect, it } from "vitest";
import { conditionBucket, getWeatherCodeInfo } from "./weatherCodes";

describe("getWeatherCodeInfo", () => {
  it("returns the correct label for a known code", () => {
    expect(getWeatherCodeInfo(0)).toEqual({ label: "Cielo despejado", icon: "☀️" });
  });

  it("falls back to a default for an unknown code", () => {
    expect(getWeatherCodeInfo(9999)).toEqual({
      label: "Condición desconocida",
      icon: "🌡️",
    });
  });
});

describe("conditionBucket", () => {
  it("classifies clear codes as despejado", () => {
    expect(conditionBucket(0)).toBe("despejado");
    expect(conditionBucket(1)).toBe("despejado");
  });

  it("classifies cloudy/fog codes as nublado", () => {
    expect(conditionBucket(2)).toBe("nublado");
    expect(conditionBucket(3)).toBe("nublado");
    expect(conditionBucket(45)).toBe("nublado");
    expect(conditionBucket(48)).toBe("nublado");
  });

  it("classifies snow codes as nieve", () => {
    expect(conditionBucket(71)).toBe("nieve");
    expect(conditionBucket(77)).toBe("nieve");
    expect(conditionBucket(85)).toBe("nieve");
    expect(conditionBucket(86)).toBe("nieve");
  });

  it("classifies thunderstorm codes (>=95) as tormenta", () => {
    expect(conditionBucket(95)).toBe("tormenta");
    expect(conditionBucket(99)).toBe("tormenta");
  });

  it("classifies remaining precipitation codes as lluvia", () => {
    expect(conditionBucket(51)).toBe("lluvia");
    expect(conditionBucket(61)).toBe("lluvia");
    expect(conditionBucket(80)).toBe("lluvia");
  });
});
