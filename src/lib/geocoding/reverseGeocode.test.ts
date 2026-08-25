import { afterEach, describe, expect, it, vi } from "vitest";
import { reverseGeocode } from "./reverseGeocode";

describe("reverseGeocode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the suburb when present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ address: { suburb: "Palermo" } }),
      })
    );
    expect(await reverseGeocode(-34.58, -58.43)).toEqual({ barrio: "Palermo" });
  });

  it("falls back to neighbourhood when suburb is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ address: { neighbourhood: "Recoleta" } }),
      })
    );
    expect(await reverseGeocode(-34.58, -58.43)).toEqual({ barrio: "Recoleta" });
  });

  it("returns null when the address has no neighborhood-level field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ address: { city: "Buenos Aires" } }),
      })
    );
    expect(await reverseGeocode(-34.58, -58.43)).toEqual({ barrio: null });
  });

  it("returns null on a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await reverseGeocode(-34.58, -58.43)).toEqual({ barrio: null });
  });

  it("returns null when the network call throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect(await reverseGeocode(-34.58, -58.43)).toEqual({ barrio: null });
  });
});
