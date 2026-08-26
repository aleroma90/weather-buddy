# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the Next.js dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `npm run test` — run all tests once (Vitest)
- `npm run test:watch` — Vitest in watch mode
- Run a single test file: `npx vitest run src/lib/clothing/suggest.test.ts`

Tests live alongside source as `*.test.ts` under `src/`, run in Node environment (see `vitest.config.ts`). Only `src/lib/**` has tests; components are untested.

## Architecture

Single-page Next.js (App Router) app: all state and orchestration lives in `src/app/page.tsx` (client component). There is no server-side data fetching or API routes — weather data and geocoding are fetched directly from the browser via Open-Meteo (`src/lib/weather/openMeteo.ts`), and persistence goes straight from the browser to Supabase (`src/lib/supabase/client.ts`).

**Identity model**: no auth. Each browser gets a random UUID (`src/lib/supabase/deviceId.ts`) stored in `localStorage`, used as the key for the `locations` table in `supabase/schema.sql`. RLS policies are permissive (any anon key can read/write any row) — the device_id filtering is enforced only by the app, not the database. Do not add sensitive data to this schema.

**Graceful degradation**: `src/lib/supabase/client.ts` falls back to placeholder Supabase credentials when env vars are unset, so the app still renders (weather-only, no persistence/history) without configuration. Keep this fallback behavior when touching that file.

**Data flow in `page.tsx`**:
1. Resolve a location on mount — either a saved row in `locations` (by device_id) or the browser's geolocation, falling back to manual search (`LocationPicker`) if both fail.
2. On location change, fetch the forecast (`getForecast`) and upsert the location to Supabase.
3. Render `DailySummary` (current conditions plus a 12-hour-ahead glance: temperature, rain probability/mm, and wind speed/direction per hour), `WeeklyForecast`, and `TemperatureAlert` (from `computeTemperatureAlerts`).

**Wind display**: `src/lib/weather/wind.ts` buckets hourly wind speed (km/h) into calm/mild/medium/strong/extra-strong levels, each with a color class used in `DailySummary`'s hourly panel; wind direction is rendered as a rotated arrow icon.

**Weather codes / units**: Open-Meteo's numeric `weather_code` is the shared vocabulary for `weatherCodes.ts` (icon/condition mapping) — don't invent a parallel representation of conditions.

## Conventions

- All user-facing UI text is in Spanish. Keep new strings Spanish-only.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- TypeScript strict mode is on.
