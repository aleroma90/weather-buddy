import type { ForecastDay } from "@/lib/weather/types";
import WeatherIcon from "./WeatherIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDayLabel(dateStr: string, index: number): string {
  if (index === 0) return "Hoy";
  const date = new Date(`${dateStr}T00:00:00`);
  const label = new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1).replace(".", "");
}

export default function WeeklyForecast({ daily }: { daily: ForecastDay[] }) {
  return (
    <Card className="w-full max-w-md gap-2 py-4 shadow-lg shadow-slate-200/60 dark:shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          📅 Próximos 7 días
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {daily.slice(0, 7).map((day, i) => (
            <div
              key={day.date}
              className="flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center transition hover:bg-accent"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {formatDayLabel(day.date, i)}
              </span>
              <WeatherIcon code={day.weatherCode} className="text-2xl" />
              <span className="text-sm font-semibold text-foreground">
                {Math.round(day.tempMax)}°
              </span>
              <span className="text-xs text-muted-foreground/70">
                {Math.round(day.tempMin)}°
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
