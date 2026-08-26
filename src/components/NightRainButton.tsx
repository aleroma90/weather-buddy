"use client";

import type { Forecast } from "@/lib/weather/types";
import { nightRainHours, summarizeNightRain } from "@/lib/weather/nightRain";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CloudRain } from "lucide-react";

function formatHourLabel(time: string): string {
  return `${time.slice(11, 13)}h`;
}

const INTENSITY_LABEL: Record<string, string> = {
  light: "Lluvia débil",
  moderate: "Lluvia moderada",
  heavy: "Lluvia fuerte",
};

export default function NightRainButton({ forecast }: { forecast: Forecast }) {
  const points = nightRainHours(forecast.hourly, forecast.current.time, 9);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Lloverá esta noche?</DialogTitle>
          <DialogDescription>Desde ahora hasta las 9h de mañana.</DialogDescription>
        </DialogHeader>

        {summary.willRain ? (
          <div className="space-y-2 text-sm">
            <p>
              🌧️ Sí, se espera{" "}
              <span className="font-semibold">
                {INTENSITY_LABEL[summary.intensity]?.toLowerCase() ?? "lluvia"}
              </span>{" "}
              (hasta {summary.maxProbability}% de probabilidad
              {summary.totalMm > 0 ? `, ~${summary.totalMm.toFixed(1)}mm` : ""}).
            </p>
            <p className="text-muted-foreground">
              Horarios con mayor chance:{" "}
              {summary.rainHours.map((point) => formatHourLabel(point.time)).join(", ")}
            </p>
          </div>
        ) : (
          <p className="text-sm">☀️ No se espera lluvia por la noche.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
