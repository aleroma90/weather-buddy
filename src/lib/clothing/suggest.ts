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
    despejado: "Abrigo grueso, gorro, guantes y bufanda",
    nublado: "Abrigo grueso, gorro y guantes",
    lluvia: "Abrigo grueso impermeable, gorro y guantes",
    tormenta: "Abrigo grueso impermeable y evita salir si es posible",
    nieve: "Abrigo grueso, gorro, guantes y botas para nieve",
  },
  "0-5": {
    despejado: "Abrigo grueso y bufanda",
    nublado: "Abrigo grueso",
    lluvia: "Abrigo impermeable y paraguas",
    tormenta: "Abrigo impermeable y paraguas resistente",
    nieve: "Abrigo grueso y botas impermeables",
  },
  "5-10": {
    despejado: "Chaqueta o abrigo ligero",
    nublado: "Chaqueta de entretiempo",
    lluvia: "Chaqueta impermeable y paraguas",
    tormenta: "Chaqueta impermeable y paraguas resistente",
    nieve: "Abrigo grueso y calzado impermeable",
  },
  "10-15": {
    despejado: "Chaqueta ligera o jersey",
    nublado: "Jersey o sudadera",
    lluvia: "Chaqueta impermeable ligera y paraguas",
    tormenta: "Chaqueta impermeable y paraguas resistente",
    nieve: "Abrigo y calzado impermeable",
  },
  "15-20": {
    despejado: "Camiseta de manga larga o jersey ligero",
    nublado: "Camiseta de manga larga",
    lluvia: "Chaqueta ligera resistente al agua y paraguas",
    tormenta: "Chaqueta impermeable y paraguas",
    nieve: "Abrigo ligero y calzado impermeable",
  },
  "20-25": {
    despejado: "Camiseta de manga corta",
    nublado: "Camiseta de manga corta o manga larga ligera",
    lluvia: "Camiseta y una chaqueta ligera impermeable, lleva paraguas",
    tormenta: "Ropa ligera y paraguas resistente",
    nieve: "Ropa de abrigo ligera (poco probable a esta temperatura)",
  },
  "25-30": {
    despejado: "Ropa ligera y fresca, y protección solar",
    nublado: "Ropa ligera y fresca",
    lluvia: "Ropa ligera y paraguas",
    tormenta: "Ropa ligera y paraguas resistente",
    nieve: "Ropa ligera (poco probable a esta temperatura)",
  },
  ">30": {
    despejado: "Ropa muy ligera, transpirable y protección solar",
    nublado: "Ropa ligera y transpirable",
    lluvia: "Ropa ligera y paraguas",
    tormenta: "Ropa ligera y paraguas resistente",
    nieve: "Ropa ligera (poco probable a esta temperatura)",
  },
};

function defaultRule(tempBucket: TemperatureBucket, condition: ConditionBucket): string {
  return (
    DEFAULT_RULES[tempBucket][condition] ?? "Viste en capas y ajusta según el clima del día"
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
