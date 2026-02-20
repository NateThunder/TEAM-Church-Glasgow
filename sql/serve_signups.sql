create extension if not exists "pgcrypto";

create table if not exists public.serve_signups (
  id uuid primary key default gen_random_uuid(),
  team_key text not null,
  team_name text not null,
  applicant_name text not null,
  email text not null,
  phone_number text,
  message text,
  contacted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table if exists public.serve_signups
add column if not exists contacted boolean not null default false;

create index if not exists idx_serve_signups_created_at on public.serve_signups (created_at desc);
create index if not exists idx_serve_signups_team_key on public.serve_signups (team_key);

alter table public.serve_signups enable row level security;

drop policy if exists "Public can insert serve signups" on public.serve_signups;
create policy "Public can insert serve signups"
on public.serve_signups
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated can read serve signups" on public.serve_signups;
create policy "Authenticated can read serve signups"
on public.serve_signups
for select
to authenticated
using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update serve signups" on public.serve_signups;
create policy "Authenticated can update serve signups"
on public.serve_signups
for update
to authenticated
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete serve signups" on public.serve_signups;
create policy "Authenticated can delete serve signups"
on public.serve_signups
for delete
to authenticated
using (auth.role() = 'authenticated');
