"use client";

import { useState } from "react";
import { searchCity } from "@/lib/weather/openMeteo";
import type { GeocodingResult } from "@/lib/weather/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LocationPicker({
  onSelect,
  currentLabel,
}: {
  onSelect: (loc: GeocodingResult) => void;
  currentLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const found = await searchCity(query);
      setResults(found);
      if (found.length === 0) {
        setError("No se encontraron ciudades con ese nombre.");
      }
    } catch {
      setError("Ocurrió un error al buscar la ciudad. Inténtalo de nuevo.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <Card className="w-full max-w-md py-5 shadow-lg shadow-slate-200/60 dark:shadow-none">
      <CardContent>
        {currentLabel && (
          <p className="mb-3 text-sm text-muted-foreground">
            📍 Ubicación actual:{" "}
            <span className="font-medium text-foreground">{currentLabel}</span>
          </p>
        )}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar una ciudad, p. ej. Madrid"
            className="rounded-full"
          />
          <Button type="submit" disabled={searching} className="shrink-0 rounded-full">
            {searching ? "Buscando…" : "Buscar"}
          </Button>
        </form>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        {results.length > 0 && (
          <ul className="mt-3 divide-y divide-border">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => {
                    onSelect(r);
                    setResults([]);
                    setQuery("");
                  }}
                  className="w-full rounded-lg px-2 py-2 text-left text-sm text-foreground/80 transition hover:bg-accent hover:text-accent-foreground"
                >
                  {r.name}
                  {r.admin1 ? `, ${r.admin1}` : ""}
                  {r.country ? `, ${r.country}` : ""}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
