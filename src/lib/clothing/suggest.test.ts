import { describe, expect, it } from "vitest";
import { suggestClothing, type ClothingLogEntry } from "./suggest";

describe("suggestClothing", () => {
  it("returns the default rule when there is no history", () => {
    expect(suggestClothing(2, 0, [])).toBe("Abrigo grueso y bufanda");
  });

  it("returns the default rule when fewer than 3 matching samples exist", () => {
    const history: ClothingLogEntry[] = [
      { temperature: 22, weatherCode: 0, actualWorn: "Camiseta" },
      { temperature: 23, weatherCode: 1, actualWorn: "Camiseta" },
    ];
    expect(suggestClothing(21, 0, history)).toBe("Camiseta de manga corta");
  });

  it("returns the most common (mode) worn item once enough matching samples exist", () => {
    const history: ClothingLogEntry[] = [
      { temperature: 22, weatherCode: 0, actualWorn: "Camiseta y gafas de sol" },
      { temperature: 23, weatherCode: 1, actualWorn: "Camiseta y gafas de sol" },
      { temperature: 21, weatherCode: 0, actualWorn: "Camiseta" },
    ];
    expect(suggestClothing(24, 1, history)).toBe("Camiseta y gafas de sol");
  });

  it("only considers history entries matching both temperature and condition buckets", () => {
    const history: ClothingLogEntry[] = [
      { temperature: -2, weatherCode: 0, actualWorn: "Abrigo grueso extra" },
      { temperature: -3, weatherCode: 0, actualWorn: "Abrigo grueso extra" },
      { temperature: -1, weatherCode: 0, actualWorn: "Abrigo grueso extra" },
      { temperature: 22, weatherCode: 61, actualWorn: "Camiseta con paraguas" },
    ];
    // current: 22C, clear -> should not match the <0 or rainy entries
    expect(suggestClothing(22, 0, history)).toBe("Camiseta de manga corta");
  });

  it("returns the default rule for the hottest temperature bucket", () => {
    expect(suggestClothing(35, 0, [])).toBe(
      "Ropa muy ligera, transpirable y protección solar"
    );
  });
});
