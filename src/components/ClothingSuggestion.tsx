"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { suggestClothing } from "@/lib/clothing/suggest";
import type { ClothingLogRow } from "@/types/domain";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const PRESET_OPTIONS = [
  "Camiseta",
  "Camiseta manga larga",
  "Jersey",
  "Chaqueta ligera",
  "Abrigo grueso",
  "Impermeable",
  "Bufanda y guantes",
];

export default function ClothingSuggestion({
  deviceId,
  temperature,
  weatherCode,
  precipitationProb,
}: {
  deviceId: string;
  temperature: number;
  weatherCode: number;
  precipitationProb: number | null;
}) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [customWorn, setCustomWorn] = useState("");
  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("clothing_logs")
        .select("temperature, weather_code, actual_worn")
        .eq("device_id", deviceId)
        .order("created_at", { ascending: false })
        .limit(200);

      if (cancelled) return;

      const history = (data ?? []).map((row: Pick<ClothingLogRow, "temperature" | "weather_code" | "actual_worn">) => ({
        temperature: row.temperature,
        weatherCode: row.weather_code,
        actualWorn: row.actual_worn,
      }));

      setSuggestion(suggestClothing(temperature, weatherCode, history));
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [deviceId, temperature, weatherCode]);

  async function logChoice(actualWorn: string, confirmed: boolean) {
    setSaving(true);
    await supabase.from("clothing_logs").insert({
      device_id: deviceId,
      temperature,
      weather_code: weatherCode,
      precipitation_prob: precipitationProb,
      suggested_category: suggestion ?? "",
      actual_worn: actualWorn,
      confirmed_suggestion: confirmed,
    });
    setSaving(false);
    setAlreadyLogged(true);
    setFeedbackOpen(false);
  }

  return (
    <Card className="w-full max-w-md py-5 shadow-lg shadow-slate-200/60 dark:shadow-none">
      <CardContent>
        <p className="text-sm font-medium text-muted-foreground">👕 ¿Qué me pongo hoy?</p>

        {loading ? (
          <Skeleton className="mt-2 h-7 w-40" />
        ) : (
          <p className="mt-1 text-xl font-bold text-foreground">{suggestion}</p>
        )}

        {alreadyLogged ? (
          <p className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            ✅ ¡Gracias! Hemos guardado tu respuesta.
          </p>
        ) : (
          !loading && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                onClick={() => logChoice(suggestion ?? "", true)}
                disabled={saving}
                className="rounded-full"
              >
                Me lo pongo
              </Button>
              <Button
                variant="outline"
                onClick={() => setFeedbackOpen((v) => !v)}
                disabled={saving}
                className="rounded-full"
              >
                Usé otra cosa
              </Button>
            </div>
          )
        )}

        {feedbackOpen && (
          <div className="mt-4 space-y-3">
            <Separator />
            <div className="flex flex-wrap gap-2">
              {PRESET_OPTIONS.map((opt) => (
                <Badge
                  key={opt}
                  variant="outline"
                  onClick={() => !saving && logChoice(opt, false)}
                  className="cursor-pointer px-3 py-1 text-xs font-medium transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-disabled={saving}
                >
                  {opt}
                </Badge>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customWorn.trim()) logChoice(customWorn.trim(), false);
              }}
              className="flex gap-2"
            >
              <Input
                type="text"
                value={customWorn}
                onChange={(e) => setCustomWorn(e.target.value)}
                placeholder="Escribe qué usaste"
                className="rounded-full"
              />
              <Button type="submit" disabled={saving} className="shrink-0 rounded-full">
                Guardar
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
