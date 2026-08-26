"use client";

import type { Forecast } from "@/lib/weather/types";
import { nightWindowHours, summarizeNightRain } from "@/lib/weather/nightRain";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import NightRainChart from "@/components/NightRainChart";
import { CloudRain } from "lucide-react";

const INTENSITY_LABEL: Record<string, string> = {
  light: "Lluvia débil",
  moderate: "Lluvia moderada",
  heavy: "Lluvia fuerte",
};

export default function NightRainButton({ forecast }: { forecast: Forecast }) {
  const points = nightWindowHours(forecast.hourly, forecast.current.time, 21, 9);
  const summary = summarizeNightRain(points);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="¿Lloverá esta noche?"
            className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:translate-y-px sm:hidden"
          />
        }
      >
        <CloudRain className="h-6 w-6" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {summary.willRain && (
          <div className="rounded-lg bg-amber-500/15 px-3 py-2 text-center text-sm font-semibold text-amber-700 dark:text-amber-400">
            🪟 Cerrá la ventana del lavadero
          </div>
        )}

        <DialogHeader>
          <DialogTitle>¿Lloverá esta noche?</DialogTitle>
          <DialogDescription>De 21h a 9h de mañana.</DialogDescription>
        </DialogHeader>

        {summary.willRain ? (
          <p className="text-sm">
            🌧️ Sí, se espera{" "}
            <span className="font-semibold">
              {INTENSITY_LABEL[summary.intensity]?.toLowerCase() ?? "lluvia"}
            </span>{" "}
            (hasta {summary.maxProbability}% de probabilidad
            {summary.totalMm > 0 ? `, ~${summary.totalMm.toFixed(1)}mm` : ""}).
          </p>
        ) : (
          <p className="text-sm">☀️ No se espera lluvia por la noche.</p>
        )}

        <NightRainChart points={points} />
      </DialogContent>
    </Dialog>
  );
}
