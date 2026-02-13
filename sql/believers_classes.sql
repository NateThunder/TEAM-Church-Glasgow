create extension if not exists "pgcrypto";

create table if not exists public.believers_classes (
  id uuid primary key default gen_random_uuid(),
  class_key text not null unique check (class_key ~ '^[a-z0-9-]+$'),
  title text not null default 'Believers Class',
  duration_label text not null default '',
  summary text not null default '',
  starts_label text not null default '',
  time_label text not null default '',
  location text not null default '',
  register_url text not null default '/connect',
  learn_point_1 text not null default '',
  learn_point_2 text not null default '',
  learn_point_3 text not null default '',
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.believers_classes
  alter column title set default 'Believers Class',
  alter column duration_label set default '',
  alter column summary set default '',
  alter column starts_label set default '',
  alter column time_label set default '',
  alter column location set default '',
  alter column register_url set default '/connect',
  alter column learn_point_1 set default '',
  alter column learn_point_2 set default '',
  alter column learn_point_3 set default '';

update public.believers_classes
set
  title = coalesce(title, 'Believers Class'),
  duration_label = coalesce(duration_label, ''),
  summary = coalesce(summary, ''),
  starts_label = coalesce(starts_label, ''),
  time_label = coalesce(time_label, ''),
  location = coalesce(location, ''),
  register_url = coalesce(register_url, '/connect'),
  learn_point_1 = coalesce(learn_point_1, ''),
  learn_point_2 = coalesce(learn_point_2, ''),
  learn_point_3 = coalesce(learn_point_3, '');

create or replace function public.set_believers_classes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_believers_classes_updated_at on public.believers_classes;
create trigger trg_believers_classes_updated_at
before update on public.believers_classes
for each row
execute function public.set_believers_classes_updated_at();

insert into public.believers_classes (
  class_key,
  duration_label,
  starts_label,
  sort_order,
  is_active
)
values (
  'default-believers-class',
  '6 weeks',
  'Sunday, 16 March 2026',
  10,
  true
)
on conflict (class_key) do update
set
  duration_label = excluded.duration_label,
  starts_label = excluded.starts_label,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

alter table public.believers_classes enable row level security;

drop policy if exists "Public can read active believers classes" on public.believers_classes;
create policy "Public can read active believers classes"
on public.believers_classes
for select
using (is_active = true);

drop policy if exists "Authenticated can insert believers classes" on public.believers_classes;
create policy "Authenticated can insert believers classes"
on public.believers_classes
for insert
to authenticated
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update believers classes" on public.believers_classes;
create policy "Authenticated can update believers classes"
on public.believers_classes
for update
to authenticated
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete believers classes" on public.believers_classes;
create policy "Authenticated can delete believers classes"
on public.believers_classes
for delete
to authenticated
using (auth.role() = 'authenticated');
