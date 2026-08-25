export type TemperatureBucket =
  | "<0"
  | "0-5"
  | "5-10"
  | "10-15"
  | "15-20"
  | "20-25"
  | "25-30"
  | ">30";

export function temperatureBucket(temp: number): TemperatureBucket {
  if (temp < 0) return "<0";
  if (temp < 5) return "0-5";
  if (temp < 10) return "5-10";
  if (temp < 15) return "10-15";
  if (temp < 20) return "15-20";
  if (temp < 25) return "20-25";
  if (temp < 30) return "25-30";
  return ">30";
}
