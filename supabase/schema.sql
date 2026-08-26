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

alter table public.locations enable row level security;

create policy "device can read own location" on public.locations
  for select using (true);
create policy "device can upsert own location" on public.locations
  for insert with check (true);
create policy "device can update own location" on public.locations
  for update using (true);
