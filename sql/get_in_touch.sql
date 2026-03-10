create extension if not exists "pgcrypto";

create table if not exists public.get_in_touch_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null check (form_type in ('plan_visit', 'prayer_request', 'contact_us')),
  name text,
  email text,
  phone_number text,
  subject text,
  message text,
  additional_info text,
  prayer_request text,
  confidential boolean not null default false,
  contacted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_get_in_touch_created_at on public.get_in_touch_submissions (created_at desc);
create index if not exists idx_get_in_touch_form_type on public.get_in_touch_submissions (form_type);

alter table public.get_in_touch_submissions enable row level security;

drop policy if exists "Public can insert get in touch submissions" on public.get_in_touch_submissions;
create policy "Public can insert get in touch submissions"
on public.get_in_touch_submissions
for insert
to anon, authenticated
with check (
  (
    form_type = 'plan_visit'
    and coalesce(name, '') <> ''
    and coalesce(email, '') <> ''
  )
  or
  (
    form_type = 'prayer_request'
    and coalesce(prayer_request, '') <> ''
  )
  or
  (
    form_type = 'contact_us'
    and coalesce(name, '') <> ''
    and coalesce(email, '') <> ''
    and coalesce(message, '') <> ''
  )
);

drop policy if exists "Authenticated can read get in touch submissions" on public.get_in_touch_submissions;
create policy "Authenticated can read get in touch submissions"
on public.get_in_touch_submissions
for select
to authenticated
using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update get in touch submissions" on public.get_in_touch_submissions;
create policy "Authenticated can update get in touch submissions"
on public.get_in_touch_submissions
for update
to authenticated
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete get in touch submissions" on public.get_in_touch_submissions;
create policy "Authenticated can delete get in touch submissions"
on public.get_in_touch_submissions
for delete
to authenticated
using (auth.role() = 'authenticated');
