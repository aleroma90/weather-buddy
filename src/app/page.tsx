"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getDeviceId } from "@/lib/supabase/deviceId";
import { getForecast } from "@/lib/weather/openMeteo";
import { computeTemperatureAlerts } from "@/lib/weather/alerts";
import { reverseGeocode } from "@/lib/geocoding/reverseGeocode";
import type { Forecast, GeocodingResult } from "@/lib/weather/types";
import LocationPicker from "@/components/LocationPicker";
import DailySummary from "@/components/DailySummary";
import WeeklyForecast from "@/components/WeeklyForecast";
import TemperatureAlert from "@/components/TemperatureAlert";
import QuoteOfTheDay from "@/components/QuoteOfTheDay";
import RainWindowCard from "@/components/RainWindowCard";
import {
  loadCachedForecast,
  loadCachedLocation,
  saveCachedForecast,
  saveCachedLocation,
} from "@/lib/cache/localCache";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ActiveLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export default function Home() {
  const [deviceId] = useState<string | null>(() => getDeviceId() || null);
  const [location, setLocation] = useState<ActiveLocation | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [barrio, setBarrio] = useState<string | null>(null);

  // Resolve the initial location on mount. Cached location/forecast render
  // instantly; otherwise Supabase and geolocation are queried in parallel.
  useEffect(() => {
    if (!deviceId) return;

    const cached = loadCachedLocation();
    let cancelled = false;

    if (cached) {
      // Deferred (not a lazy initial state) so the first client render
      // matches the static HTML and hydration doesn't mismatch.
      queueMicrotask(() => {
        if (cancelled) return;
        const cachedForecast = loadCachedForecast(cached.latitude, cached.longitude);
        if (cachedForecast) setForecast(cachedForecast);
        setLocation(cached);
      });
      return () => {
        cancelled = true;
      };
    }

    const geoPromise = new Promise<ActiveLocation | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            label: "Tu ubicación actual",
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => resolve(null),
        { timeout: 8000, maximumAge: 30 * 60 * 1000, enableHighAccuracy: false }
      );
    });

    async function resolveLocation() {
      if (isSupabaseConfigured) {
        const { data } = await supabase
          .from("locations")
          .select("label, latitude, longitude")
          .eq("device_id", deviceId)
          .maybeSingle()
          .then(
            (r) => r,
            () => ({ data: null })
          );
        if (cancelled) return;
        if (data) {
          setLocation(data);
          return;
        }
      }

      const geo = await geoPromise;
      if (cancelled) return;
      if (geo) {
        setLocation(geo);
      } else {
        setShowPicker(true);
        setLoading(false);
      }
    }

    resolveLocation();
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  // Fetch forecast whenever location changes, and persist location
  useEffect(() => {
    if (!location || !deviceId) return;
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      saveCachedLocation(location!);
      try {
        const f = await getForecast(location!.latitude, location!.longitude);
        if (cancelled) return;
        setForecast(f);
        saveCachedForecast(location!.latitude, location!.longitude, f);

        if (isSupabaseConfigured) {
          // Fire-and-forget: persistence must not delay rendering.
          void supabase.from("locations").upsert({
            device_id: deviceId,
            label: location!.label,
            latitude: location!.latitude,
            longitude: location!.longitude,
            timezone: f.timezone,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar el pronóstico del tiempo. Inténtalo de nuevo más tarde.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [location, deviceId]);

  // Resolve the neighborhood name for the current location, best-effort.
  useEffect(() => {
    if (!location) return;
    let cancelled = false;

    reverseGeocode(location.latitude, location.longitude).then((result) => {
      if (!cancelled) setBarrio(result.barrio);
    });

    return () => {
      cancelled = true;
    };
  }, [location]);

  function handleLocationSelect(result: GeocodingResult) {
    const parts = [result.name, result.admin1, result.country].filter(Boolean);
    setLocation({
      label: parts.join(", "),
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setShowPicker(false);
  }

  const alerts = forecast ? computeTemperatureAlerts(forecast.daily) : [];

  return (
    <main className="flex flex-1 flex-col items-center gap-5 px-4 py-12">
      <div className="mb-1 flex flex-col items-center gap-1 text-center">
        <span className="text-4xl">🌤️</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Weather Buddy
        </h1>
      </div>

      {loading && !forecast && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          <span className="ml-1">Cargando el clima…</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showPicker && (
        <LocationPicker onSelect={handleLocationSelect} currentLabel={location?.label} />
      )}

      {forecast && deviceId && (
        <>
          <RainWindowCard forecast={forecast} />
          <DailySummary forecast={forecast} barrio={barrio} />
          <WeeklyForecast daily={forecast.daily} />
          <TemperatureAlert alerts={alerts} />
          <QuoteOfTheDay />
          {!showPicker && (
            <Button
              variant="link"
              onClick={() => setShowPicker(true)}
              className="mt-1 h-auto p-0 text-sm font-medium"
            >
              📍 Cambiar ubicación
            </Button>
          )}
        </>
      )}
    </main>
  );
}
