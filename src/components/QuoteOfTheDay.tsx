"use client";

import { useEffect, useState } from "react";
import { getDailyQuote, type Quote } from "@/lib/quotes/getQuote";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuoteOfTheDay() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getDailyQuote()
      .then((q) => {
        if (!cancelled) setQuote(q);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  return (
    <Card className="w-full max-w-md gap-2 py-4 shadow-lg shadow-slate-200/60 dark:shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          💬 Frase del día
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {loading || !quote ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <blockquote className="text-sm text-foreground">
            <p className="italic">“{quote.text}”</p>
            {quote.author && (
              <footer className="mt-1 text-xs text-muted-foreground">
                — {quote.author}
              </footer>
            )}
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
