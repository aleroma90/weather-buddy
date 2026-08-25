-- Weather Buddy — schema (run once in the Supabase SQL editor)
-- No auth is used; app is single-user per browser, identified by a
-- client-generated device_id (UUID) stored in localStorage.
-- NOTE: because there is no real auth, RLS policies below are permissive
-- (anon key can read/write any row). The app itself always filters by
-- device_id. Do not store sensitive data in this app.

create table public.locations (
  device_id uuid primary key,
  label text not null,
  latitude double precision not null,
  longitude double precision not null,
  timezone text,
  updated_at timestamptz not null default now()
);

create table public.clothing_logs (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null,
  log_date date not null default current_date,
  temperature double precision not null,
  weather_code int not null,
  precipitation_prob int,
  suggested_category text not null,
  actual_worn text not null,
  confirmed_suggestion boolean not null,
  created_at timestamptz not null default now()
);

create index clothing_logs_device_idx on public.clothing_logs (device_id);
create index clothing_logs_bucket_idx on public.clothing_logs (device_id, weather_code, temperature);

alter table public.locations enable row level security;
alter table public.clothing_logs enable row level security;

create policy "device can read own location" on public.locations
  for select using (true);
create policy "device can upsert own location" on public.locations
  for insert with check (true);
create policy "device can update own location" on public.locations
  for update using (true);

create policy "device can read own logs" on public.clothing_logs
  for select using (true);
create policy "device can insert own logs" on public.clothing_logs
  for insert with check (true);
