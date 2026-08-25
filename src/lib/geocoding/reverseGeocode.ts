const REVERSE_GEOCODE_URL = "https://nominatim.openstreetmap.org/reverse";

export interface ReverseGeocodeResult {
  barrio: string | null;
}

/**
 * Resolves a neighborhood-level name for a coordinate via OpenStreetMap
 * Nominatim (Open-Meteo's own geocoding API only returns city-level names).
 * Never throws — any failure resolves to `{ barrio: null }` so callers can
 * treat the neighborhood label as purely optional/decorative.
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<ReverseGeocodeResult> {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lon),
      zoom: "16",
      addressdetails: "1",
      "accept-language": "es",
    });

    const res = await fetch(`${REVERSE_GEOCODE_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { barrio: null };

    const data = await res.json();
    const address = data?.address ?? {};
    const barrio =
      address.suburb ??
      address.neighbourhood ??
      address.city_district ??
      address.quarter ??
      null;

    return { barrio: typeof barrio === "string" ? barrio : null };
  } catch {
    return { barrio: null };
  }
}
