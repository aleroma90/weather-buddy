"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import type { HourlyPoint } from "@/lib/weather/types";
import { remainingHoursToday } from "@/lib/weather/hourly";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  temperature: {
    label: "Temperatura",
    color: "var(--primary)",
  },
  precipitationProbability: {
    label: "Prob. de lluvia",
    color: "#38bdf8",
  },
} satisfies ChartConfig;

function formatHourLabel(time: string): string {
  const date = new Date(time);
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit" }).format(date);
}

export default function HourlyChart({
  hourly,
  currentTime,
}: {
  hourly: HourlyPoint[];
  currentTime: string;
}) {
  const points = remainingHoursToday(hourly, currentTime);
  if (points.length === 0) return null;

  const data = points.map((p) => ({
    hour: formatHourLabel(p.time),
    temperature: Math.round(p.temperature),
    precipitationProbability: p.precipitationProbability ?? 0,
  }));

  return (
    <Card className="w-full max-w-md gap-2 py-4 shadow-lg shadow-slate-200/60 dark:shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          📈 Próximas horas
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
          <ComposedChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis yAxisId="temp" hide domain={["dataMin - 2", "dataMax + 2"]} />
            <YAxis yAxisId="rain" hide domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              yAxisId="rain"
              dataKey="precipitationProbability"
              fill="var(--color-precipitationProbability)"
              radius={4}
              opacity={0.5}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="var(--color-temperature)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
