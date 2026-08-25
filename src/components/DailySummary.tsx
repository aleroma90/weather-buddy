import type { Forecast } from "@/lib/weather/types";
import { getWeatherCodeInfo } from "@/lib/weather/weatherCodes";
import WeatherIcon from "./WeatherIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function formatTodayLabel(): string {
  const label = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function DailySummary({ forecast }: { forecast: Forecast }) {
  const today = forecast.daily[0];
  const { label } = getWeatherCodeInfo(forecast.current.weatherCode);

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
          </div>
        </div>

        <Separator className="mt-5 mb-0 bg-white/20" />

        <dl className="mt-3 grid grid-cols-3 gap-3 rounded-2xl bg-white/15 p-3 text-center text-sm backdrop-blur-sm">
          <div>
            <dt className="text-xs text-primary-foreground/75">Sensación</dt>
            <dd className="font-semibold">{Math.round(forecast.current.apparentTemperature)}°C</dd>
          </div>
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
      </CardContent>
    </Card>
  );
}
