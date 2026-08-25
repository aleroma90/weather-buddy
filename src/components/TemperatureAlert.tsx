import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function TemperatureAlert({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;

  return (
    <Alert className="w-full max-w-md border-amber-200 bg-amber-50/90 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/80 dark:text-amber-300 [&>svg]:hidden">
      <AlertTitle className="font-semibold text-amber-800 dark:text-amber-300">
        ⚠️ Cambios de temperatura previstos
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-400">
        <ul className="space-y-1">
          {alerts.map((alert, i) => (
            <li key={i}>{alert}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
