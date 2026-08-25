import { afterEach, describe, expect, it, vi } from "vitest";
import { getDailyQuote, QuoteApiError } from "./getQuote";

function mockFetchSequence(responses: unknown[]) {
  const fn = vi.fn();
  for (const body of responses) {
    fn.mockResolvedValueOnce({ ok: true, json: async () => body });
  }
  vi.stubGlobal("fetch", fn);
}

describe("getDailyQuote", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the quote and translates text and author", async () => {
    mockFetchSequence([
      { quote: "Stay hungry, stay foolish.", author: "Steve Jobs" },
      { responseData: { translatedText: "Mantente hambriento, mantente insensato." } },
      { responseData: { translatedText: "Steve Jobs" } },
    ]);

    const quote = await getDailyQuote();
    expect(quote).toEqual({
      text: "Mantente hambriento, mantente insensato.",
      author: "Steve Jobs",
    });
  });

  it("throws QuoteApiError when the quote request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(getDailyQuote()).rejects.toThrow(QuoteApiError);
  });

  it("throws QuoteApiError when the quote payload is malformed", async () => {
    mockFetchSequence([{}]);
    await expect(getDailyQuote()).rejects.toThrow(QuoteApiError);
  });

  it("throws QuoteApiError when translation fails", async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ quote: "Hello", author: "Someone" }),
      })
      .mockResolvedValueOnce({ ok: false });
    vi.stubGlobal("fetch", fn);
    await expect(getDailyQuote()).rejects.toThrow(QuoteApiError);
  });

  it("propagates network errors as rejections", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(getDailyQuote()).rejects.toThrow();
  });
});
