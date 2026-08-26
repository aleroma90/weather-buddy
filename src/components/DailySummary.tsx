import type { Forecast, HourlyPoint } from "@/lib/weather/types";
import { getWeatherCodeInfo } from "@/lib/weather/weatherCodes";
import { nextHours } from "@/lib/weather/hourly";
import { windLevel } from "@/lib/weather/wind";
import WeatherIcon from "./WeatherIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, Minus } from "lucide-react";

const HOURS_TO_SHOW = 12;

function formatTodayLabel(): string {
  const label = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatHourLabel(time: string): string {
  const hour = time.slice(11, 13);
  return `${hour}h`;
}

function HourColumn({ point }: { point: HourlyPoint }) {
  const wind = windLevel(point.windSpeed);
  const mm = point.precipitation;

  return (
    <>
      <div className="text-[11px] text-primary-foreground/70">{formatHourLabel(point.time)}</div>
      <div className="text-sm font-semibold">{Math.round(point.temperature)}°</div>
      <div className="text-[11px] leading-tight">
        <div>💧{point.precipitationProbability ?? 0}%</div>
        <div className="text-primary-foreground/60">{mm > 0 ? `${mm.toFixed(1)}mm` : "–"}</div>
      </div>
      <div className={`flex flex-col items-center leading-tight ${wind.colorClass}`}>
        {wind.level === "calm" ? (
          <Minus className="h-3.5 w-3.5" aria-label="Calma" />
        ) : (
          <ArrowUp
            className="h-3.5 w-3.5"
            style={{ transform: `rotate(${(point.windDirection + 180) % 360}deg)` }}
            aria-label={wind.label}
          />
        )}
        <span className="text-[11px]">{Math.round(point.windSpeed)}</span>
      </div>
    </>
  );
}

export default function DailySummary({
  forecast,
  barrio,
}: {
  forecast: Forecast;
  barrio?: string | null;
}) {
  const today = forecast.daily[0];
  const { label } = getWeatherCodeInfo(forecast.current.weatherCode);
  const hours = nextHours(forecast.hourly, forecast.current.time, HOURS_TO_SHOW);

  return (
    <Card className="w-full max-w-md gap-4 border-primary/20 bg-gradient-to-br from-primary to-indigo-500 py-6 text-primary-foreground shadow-lg shadow-primary/20">
      <CardContent>
        <p className="text-sm font-medium text-primary-foreground/80">{formatTodayLabel()}</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <WeatherIcon code={forecast.current.weatherCode} className="text-4xl" />
          </div>
          <div>
            <p className="text-4xl font-extrabold tracking-tight">
              {Math.round(forecast.current.temperature)}°C
            </p>
            <p className="text-sm text-primary-foreground/90">{label}</p>
            {barrio && (
              <p className="text-xs text-primary-foreground/75">📍 {barrio}</p>
            )}
          </div>
        </div>

        <Separator className="mt-5 mb-0 bg-white/20" />

        <dl className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-white/15 p-3 text-center text-sm backdrop-blur-sm">
          <div>
            <dt className="text-xs text-primary-foreground/75">Máx / mín</dt>
            <dd className="font-semibold">
              {Math.round(today.tempMax)}° / {Math.round(today.tempMin)}°
            </dd>
          </div>
          <div>
            <dt className="text-xs text-primary-foreground/75">Lluvia</dt>
            <dd className="font-semibold">💧 {today.precipitationProbabilityMax ?? 0}%</dd>
          </div>
        </dl>

        {hours.length > 0 && (
          <>
            <p className="mt-4 mb-2 text-xs font-medium text-primary-foreground/75">
              🕐 Próximas horas
            </p>
            <div className="scrollbar-hide overflow-x-auto overflow-y-hidden pb-1">
              <div
                className="grid grid-flow-col gap-x-3 gap-y-2 text-center"
                style={{
                  gridTemplateRows: "repeat(4, auto)",
                  gridAutoColumns: "44px",
                }}
              >
                {hours.map((point) => (
                  <HourColumn key={point.time} point={point} />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
