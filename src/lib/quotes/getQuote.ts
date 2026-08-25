const QUOTE_URL = "https://dummyjson.com/quotes/random";
const TRANSLATE_URL = "https://api.mymemory.translated.net/get";

export interface Quote {
  text: string;
  author: string | null;
}

export class QuoteApiError extends Error {}

/**
 * Fetches a random quote from DummyJSON (English) and translates it to
 * Spanish via MyMemory. Both are free, keyless APIs; either failing throws
 * QuoteApiError so the caller can hide the quote card instead of showing
 * broken/English content.
 */
export async function getDailyQuote(): Promise<Quote> {
  const res = await fetch(QUOTE_URL, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new QuoteApiError("No se pudo obtener la frase del día.");

  const entry = await res.json();
  if (!entry?.quote) throw new QuoteApiError("Respuesta de frase inválida.");

  const text = await translate(entry.quote);
  const author = entry.author ? await translate(entry.author) : null;

  return { text, author };
}

async function translate(text: string): Promise<string> {
  const params = new URLSearchParams({ q: text, langpair: "en|es" });
  const res = await fetch(`${TRANSLATE_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new QuoteApiError("No se pudo traducir la frase del día.");

  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (typeof translated !== "string") {
    throw new QuoteApiError("Respuesta de traducción inválida.");
  }
  return translated;
}
