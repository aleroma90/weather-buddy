import { getWeatherCodeInfo } from "@/lib/weather/weatherCodes";

export default function WeatherIcon({
  code,
  className,
}: {
  code: number;
  className?: string;
}) {
  const { icon, label } = getWeatherCodeInfo(code);
  return (
    <span role="img" aria-label={label} className={className}>
      {icon}
    </span>
  );
}
