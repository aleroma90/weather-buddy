import type { HourlyPoint } from "@/lib/weather/types";

const CHART_HEIGHT = 220;
const CHART_WIDTH = 300;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 22;
const PADDING_LEFT = 26;
const PADDING_RIGHT = 30;

function formatMm(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

export default function NightRainChart({ points }: { points: HourlyPoint[] }) {
  if (points.length === 0) return null;

  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const plotLeft = PADDING_LEFT;
  const plotRight = CHART_WIDTH - PADDING_RIGHT;
  const innerWidth = plotRight - plotLeft;
  const stepX = innerWidth / points.length;
  const maxMm = Math.max(1, ...points.map((point) => point.precipitation));
  const barWidth = Math.min(18, stepX * 0.55);

  function xCenter(index: number) {
    return plotLeft + index * stepX + stepX / 2;
  }

  function probabilityY(probability: number) {
    return PADDING_TOP + plotHeight - (probability / 100) * plotHeight;
  }

  function mmY(mm: number) {
    return PADDING_TOP + plotHeight - (mm / maxMm) * plotHeight;
  }

  const linePoints = points
    .map((point, i) => `${xCenter(i)},${probabilityY(point.precipitationProbability ?? 0)}`)
    .join(" ");

  const probabilityTicks = [0, 50, 100];
  const mmTicks = [0, maxMm / 2, maxMm];

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        width="100%"
        height={CHART_HEIGHT}
        preserveAspectRatio="none"
        role="img"
        aria-label="Probabilidad de lluvia (línea, eje izquierdo) y milímetros por hora (barras, eje derecho)"
      >
        {probabilityTicks.map((tick) => (
          <line
            key={`grid-${tick}`}
            x1={plotLeft}
            x2={plotRight}
            y1={probabilityY(tick)}
            y2={probabilityY(tick)}
            className="stroke-muted-foreground/15"
            strokeWidth={1}
          />
        ))}

        {points.map((point, i) => {
          const barHeight = (point.precipitation / maxMm) * plotHeight;
          return (
            <rect
              key={`bar-${point.time}`}
              x={xCenter(i) - barWidth / 2}
              y={PADDING_TOP + (plotHeight - barHeight)}
              width={barWidth}
              height={barHeight}
              rx={2}
              className="fill-sky-400/50 dark:fill-sky-300/40"
            />
          );
        })}

        <polyline
          points={linePoints}
          fill="none"
          className="stroke-violet-500 dark:stroke-violet-400"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((point, i) => (
          <circle
            key={`dot-${point.time}`}
            cx={xCenter(i)}
            cy={probabilityY(point.precipitationProbability ?? 0)}
            r={2.5}
            className="fill-violet-500 dark:fill-violet-400"
          />
        ))}

        {/* Left axis: rain probability (%) */}
        {probabilityTicks.map((tick) => (
          <text
            key={`prob-tick-${tick}`}
            x={plotLeft - 4}
            y={probabilityY(tick) + 3}
            textAnchor="end"
            className="fill-violet-500 text-[9px] font-medium dark:fill-violet-400"
          >
            {tick}%
          </text>
        ))}

        {/* Right axis: precipitation (mm) */}
        {mmTicks.map((tick) => (
          <text
            key={`mm-tick-${tick}`}
            x={plotRight + 5}
            y={mmY(tick) + 3}
            textAnchor="start"
            className="fill-sky-500 text-[9px] font-medium dark:fill-sky-300"
          >
            {formatMm(tick)}
          </text>
        ))}

        {points.map(
          (point, i) =>
            i % 2 === 0 && (
              <text
                key={`label-${point.time}`}
                x={xCenter(i)}
                y={CHART_HEIGHT - 6}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px]"
              >
                {point.time.slice(11, 13)}h
              </text>
            )
        )}
      </svg>

      <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-3 rounded-full bg-violet-500 dark:bg-violet-400" /> %
          probabilidad
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sky-400/50" /> mm
        </span>
      </div>
    </div>
  );
}
