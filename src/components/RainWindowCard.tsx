import type { Forecast } from "@/lib/weather/types";
import { nextHours } from "@/lib/weather/hourly";
import { adviseWindow, type WindowVerdict } from "@/lib/weather/windowAdvice";
import { Card, CardContent } from "@/components/ui/card";
import RainChart from "@/components/RainChart";

const HOURS_TO_SHOW = 12;

const VERDICT_STYLE: Record<WindowVerdict, { emoji: string; className: string }> = {
  open: {
    emoji: "🟢",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  caution: {
    emoji: "🟡",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  close: {
    emoji: "🔴",
    className: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  },
};

const hourLabel = (time: string) => `${time.slice(11, 13)}h`;
const formatMm = (mm: number) => (mm < 0.05 ? "0" : mm.toFixed(1));

export default function RainWindowCard({ forecast }: { forecast: Forecast }) {
  const points = nextHours(forecast.hourly, forecast.current.time, HOURS_TO_SHOW);
  if (points.length === 0) return null;

  const advice = adviseWindow(points);
  const style = VERDICT_STYLE[advice.verdict];
  const peakProbability = advice.peak?.precipitationProbability ?? 0;

  let headline = "Dejala abierta";
  if (advice.verdict === "close") headline = "Cerrá la ventana";
  else if (advice.verdict === "caution" && advice.firstRiskHour)
    headline = `Ojo desde las ${hourLabel(advice.firstRiskHour.time)}`;

  return (
    <Card className="w-full max-w-md gap-3 py-4 shadow-lg shadow-slate-200/60 dark:shadow-none">
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">🪟 ¿Dejo la ventana abierta?</h2>
          <span className="text-xs text-muted-foreground">
            {hourLabel(points[0].time)}–{hourLabel(points[points.length - 1].time)}
          </span>
        </div>

        <div className={`rounded-lg px-3 py-2 text-center text-base font-bold ${style.className}`}>
          {style.emoji} {headline}
          {advice.windyRain && (
            <span className="block text-xs font-medium">💨 Lluvia con viento fuerte</span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="rounded-lg bg-muted p-2">
            <dt className="text-xs text-muted-foreground">Total esperado</dt>
            <dd className="font-semibold">~{formatMm(advice.expectedMm)} mm</dd>
          </div>
          <div className="rounded-lg bg-muted p-2">
            <dt className="text-xs text-muted-foreground">Pico</dt>
            <dd className="font-semibold">
              {peakProbability > 0 && advice.peak
                ? `${peakProbability}% · ${hourLabel(advice.peak.time)} · ${formatMm(advice.peak.precipitation)} mm`
                : "Sin lluvia"}
            </dd>
          </div>
        </dl>

        <RainChart points={points} />
      </CardContent>
    </Card>
  );
}
