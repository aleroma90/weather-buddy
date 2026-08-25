import { temperatureBucket, type TemperatureBucket } from "./buckets";
import { conditionBucket, type ConditionBucket } from "../weather/weatherCodes";

export interface ClothingLogEntry {
  temperature: number;
  weatherCode: number;
  actualWorn: string;
}

const MIN_SAMPLES = 3;

const DEFAULT_RULES: Record<TemperatureBucket, Partial<Record<ConditionBucket, string>>> = {
  "<0": {
    despejado: "Camperón, gorro, guantes y bufanda",
    nublado: "Camperón, gorro y guantes",
    lluvia: "Camperón impermeable, gorro y guantes",
    tormenta: "Camperón impermeable y evitá salir si podés",
    nieve: "Camperón, gorro, guantes y botas para nieve",
  },
  "0-5": {
    despejado: "Campera de invierno y bufanda",
    nublado: "Campera de invierno",
    lluvia: "Piloto y paraguas",
    tormenta: "Piloto y paraguas resistente",
    nieve: "Campera de invierno y botas impermeables",
  },
  "5-10": {
    despejado: "Campera liviana",
    nublado: "Campera de entretiempo",
    lluvia: "Campera impermeable y paraguas",
    tormenta: "Campera impermeable y paraguas resistente",
    nieve: "Campera de invierno y calzado impermeable",
  },
  "10-15": {
    despejado: "Campera liviana o buzo",
    nublado: "Buzo",
    lluvia: "Campera impermeable liviana y paraguas",
    tormenta: "Campera impermeable y paraguas resistente",
    nieve: "Campera y calzado impermeable",
  },
  "15-20": {
    despejado: "Remera manga larga o buzo liviano",
    nublado: "Remera manga larga",
    lluvia: "Campera liviana resistente al agua y paraguas",
    tormenta: "Campera impermeable y paraguas",
    nieve: "Campera liviana y calzado impermeable",
  },
  "20-25": {
    despejado: "Remera manga corta",
    nublado: "Remera manga corta o manga larga liviana",
    lluvia: "Remera y una campera liviana impermeable, llevá paraguas",
    tormenta: "Ropa liviana y paraguas resistente",
    nieve: "Ropa de abrigo liviana (poco probable a esta temperatura)",
  },
  "25-30": {
    despejado: "Ropa liviana y fresca, y protección solar",
    nublado: "Ropa liviana y fresca",
    lluvia: "Ropa liviana y paraguas",
    tormenta: "Ropa liviana y paraguas resistente",
    nieve: "Ropa liviana (poco probable a esta temperatura)",
  },
  ">30": {
    despejado: "Ropa muy liviana, transpirable y protección solar",
    nublado: "Ropa liviana y transpirable",
    lluvia: "Ropa liviana y paraguas",
    tormenta: "Ropa liviana y paraguas resistente",
    nieve: "Ropa liviana (poco probable a esta temperatura)",
  },
};

function defaultRule(tempBucket: TemperatureBucket, condition: ConditionBucket): string {
  return (
    DEFAULT_RULES[tempBucket][condition] ?? "Vestite en capas y ajustá según el clima del día"
  );
}

function mode(values: string[]): string {
  const counts = new Map<string, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best = values[0];
  let bestCount = 0;
  for (const [v, count] of counts) {
    if (count > bestCount) {
      best = v;
      bestCount = count;
    }
  }
  return best;
}

export function suggestClothing(
  currentTemp: number,
  weatherCode: number,
  history: ClothingLogEntry[]
): string {
  const tempBucket = temperatureBucket(currentTemp);
  const condition = conditionBucket(weatherCode);

  const matching = history.filter(
    (log) =>
      temperatureBucket(log.temperature) === tempBucket &&
      conditionBucket(log.weatherCode) === condition
  );

  if (matching.length >= MIN_SAMPLES) {
    return mode(matching.map((log) => log.actualWorn));
  }

  return defaultRule(tempBucket, condition);
}
