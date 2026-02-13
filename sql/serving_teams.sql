create extension if not exists "pgcrypto";

create table if not exists public.serving_teams (
  id uuid primary key default gen_random_uuid(),
  team_key text not null unique check (team_key ~ '^[a-z0-9-]+$'),
  group_name text not null,
  group_sort integer not null default 100,
  team_sort integer not null default 100,
  name text not null,
  leader text,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.serving_teams
add column if not exists leader text;

create or replace function public.set_serving_teams_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_serving_teams_updated_at on public.serving_teams;
create trigger trg_serving_teams_updated_at
before update on public.serving_teams
for each row
execute function public.set_serving_teams_updated_at();

insert into public.serving_teams (
  team_key,
  group_name,
  group_sort,
  team_sort,
  name,
  leader,
  description
)
values
  (
    'ushering',
    'Frontline Teams',
    10,
    10,
    'Ushering Team',
    null,
    'Create a welcoming first impression and help guests find their seats.'
  ),
  (
    'welcoming',
    'Frontline Teams',
    10,
    20,
    'Welcoming Team',
    null,
    'Host new guests, answer questions, and help people feel at home.'
  ),
  (
    'hospitality',
    'Frontline Teams',
    10,
    30,
    'Hospitality',
    null,
    'Serve refreshments and care for guests with warmth and kindness.'
  ),
  (
    'media',
    'Creative & Technical',
    20,
    10,
    'Media Team',
    null,
    'Capture and share what God is doing through video, graphics, and lighting.'
  ),
  (
    'worship',
    'Creative & Technical',
    20,
    20,
    'Worship Team',
    null,
    'Lead our church family into worship with skill and humility.'
  ),
  (
    'children',
    'Next Generation',
    30,
    10,
    'Children Ministry',
    null,
    'Help kids discover Jesus in a safe and joyful environment.'
  ),
  (
    'youth',
    'Next Generation',
    30,
    20,
    'Youth Ministry',
    null,
    'Invest in teenagers and help them grow in faith and community.'
  ),
  (
    'maintenance',
    'Support',
    40,
    10,
    'Maintenance',
    null,
    'Care for our spaces so every gathering feels excellent.'
  )
on conflict (team_key) do update
set
  group_name = excluded.group_name,
  group_sort = excluded.group_sort,
  team_sort = excluded.team_sort,
  name = excluded.name,
  leader = excluded.leader,
  description = excluded.description,
  is_active = true,
  updated_at = now();

alter table public.serving_teams enable row level security;

drop policy if exists "Public can read serving teams" on public.serving_teams;
create policy "Public can read serving teams"
on public.serving_teams
for select
using (is_active = true);

drop policy if exists "Authenticated can insert serving teams" on public.serving_teams;
create policy "Authenticated can insert serving teams"
on public.serving_teams
for insert
to authenticated
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update serving teams" on public.serving_teams;
create policy "Authenticated can update serving teams"
on public.serving_teams
for update
to authenticated
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete serving teams" on public.serving_teams;
create policy "Authenticated can delete serving teams"
on public.serving_teams
for delete
to authenticated
using (auth.role() = 'authenticated');
