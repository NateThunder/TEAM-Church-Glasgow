create extension if not exists "pgcrypto";

create table if not exists public.foodbank_profile (
  id uuid primary key default gen_random_uuid(),
  profile_key text not null unique default 'default-foodbank' check (profile_key ~ '^[a-z0-9-]+$'),
  hero_image_url text not null default '/optimized/home-welcome.jpg',
  hero_kicker text not null default 'OUR FOODBANK',
  hero_title text not null default 'Everlasting Foodbank',
  hero_summary text not null default 'Our foodbank serves Dennistoun and beyond with practical food support, encouragement, and a warm welcome.',
  mission_title text not null default 'Mission and history',
  mission_body text not null default 'The Everlasting Foodbank SCIO was founded in Glasgow in 2014 by the treasurer and Pastor of Everlasting Arms Ministries Church in Dennistoun. The Everlasting Foodbank is a Christian organisation that serves the community of Dennistoun and beyond by providing food to those in need. Although we are a foodbank, we believe that "man cannot live by bread alone" (Matthew 4:4). Our goal is not just to feed people for a day, but to give them the confidence and encouragement they need to prosper every day.',
  committee_title text not null default 'Meet the committee',
  committee_summary text not null default 'The Foodbank committee helps guide the work, steward donations, and support the practical running of the charity.',
  committee_members text not null default E'Yinka Ogunnoiki | Treasurer | /foodbank/pastor.png\nTolani Hassan | Chairman | /foodbank/auntie%20t.png\nUnoma Okudo | Financial Secretary | /foodbank/unoma.png\nTemilolu Agbede | Assistant Secretary | /foodbank/temi.png\nAnnet Conde | Secretary | /foodbank/annet.png',
  committee_url text not null default 'https://www.everlastingfoodbank.org/blank',
  support_title text not null default 'Volunteer and support',
  support_intro text not null default 'Join the team by volunteering, donating food, or giving financially to help the Foodbank serve local people week by week.',
  support_role_status text not null default 'There are currently no paid job positions available, but volunteer help is welcome.',
  support_join_details text not null default 'You can get involved by volunteering time, donating food and essentials, or supporting the Foodbank financially.',
  support_location_details text not null default 'The Foodbank operates from 12 Whitehill Street, Glasgow G31 2LH.',
  support_opening_details text not null default 'The Foodbank opens on Saturdays, with extended hours on first and third Saturdays. Contact the team before visiting if you need current details.',
  help_summary text not null default 'If you need food support, come during the opening times below or contact the Foodbank team directly before visiting.',
  hours_primary_label text not null default 'First and third Saturdays',
  hours_primary_value text not null default '1:00 PM - 3:00 PM',
  hours_secondary_label text not null default 'Other Saturdays',
  hours_secondary_value text not null default '1:00 PM - 2:00 PM',
  address text not null default '12 Whitehill Street, Glasgow G31 2LH',
  directions_url text not null default 'https://www.google.com/maps/dir/?api=1&destination=12+Whitehill+Street,+Glasgow+G31+2LH',
  phone text not null default '07983021283',
  email text not null default 'contact@everlastingfoodbank.org',
  donation_summary text not null default 'Support the Foodbank financially, volunteer your time, or help restock essentials for local families.',
  item_donation_details text not null default 'Food, clothes and toiletries can be donated directly on Saturdays 12:00 PM - 3:00 PM and Sundays 9:00 AM - 1:30 PM.',
  charity_name text not null default 'The Everlasting Foodbank SCIO',
  charity_number text not null default 'SC047458',
  website_url text not null default 'https://www.everlastingfoodbank.org/',
  support_url text not null default 'https://www.everlastingfoodbank.org/support-us',
  donate_url text not null default 'https://www.everlastingfoodbank.org/donate',
  contact_url text not null default 'https://www.everlastingfoodbank.org/contact-us',
  about_url text not null default 'https://www.everlastingfoodbank.org/about',
  facebook_url text not null default 'https://www.facebook.com/everlastingfoodbank',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.foodbank_profile
  add column if not exists committee_title text not null default 'Meet the committee',
  add column if not exists committee_summary text not null default 'The Foodbank committee helps guide the work, steward donations, and support the practical running of the charity.',
  add column if not exists committee_members text not null default E'Yinka Ogunnoiki | Treasurer | /foodbank/pastor.png\nTolani Hassan | Chairman | /foodbank/auntie%20t.png\nUnoma Okudo | Financial Secretary | /foodbank/unoma.png\nTemilolu Agbede | Assistant Secretary | /foodbank/temi.png\nAnnet Conde | Secretary | /foodbank/annet.png',
  add column if not exists committee_url text not null default 'https://www.everlastingfoodbank.org/blank',
  add column if not exists support_title text not null default 'Volunteer and support',
  add column if not exists support_intro text not null default 'Join the team by volunteering, donating food, or giving financially to help the Foodbank serve local people week by week.',
  add column if not exists support_role_status text not null default 'There are currently no paid job positions available, but volunteer help is welcome.',
  add column if not exists support_join_details text not null default 'You can get involved by volunteering time, donating food and essentials, or supporting the Foodbank financially.',
  add column if not exists support_location_details text not null default 'The Foodbank operates from 12 Whitehill Street, Glasgow G31 2LH.',
  add column if not exists support_opening_details text not null default 'The Foodbank opens on Saturdays, with extended hours on first and third Saturdays. Contact the team before visiting if you need current details.';

alter table if exists public.foodbank_profile
  alter column committee_members set default E'Yinka Ogunnoiki | Treasurer | /foodbank/pastor.png\nTolani Hassan | Chairman | /foodbank/auntie%20t.png\nUnoma Okudo | Financial Secretary | /foodbank/unoma.png\nTemilolu Agbede | Assistant Secretary | /foodbank/temi.png\nAnnet Conde | Secretary | /foodbank/annet.png';

update public.foodbank_profile
set committee_members = E'Yinka Ogunnoiki | Treasurer | /foodbank/pastor.png\nTolani Hassan | Chairman | /foodbank/auntie%20t.png\nUnoma Okudo | Financial Secretary | /foodbank/unoma.png\nTemilolu Agbede | Assistant Secretary | /foodbank/temi.png\nAnnet Conde | Secretary | /foodbank/annet.png',
    updated_at = now()
where committee_members = E'Yinka Ogunnoiki | Treasurer\nTolani Hassan | Chairman\nUnoma Okudo | Financial Secretary\nTemilolu Agbede | Assistant Secretary\nAnnet Conde | Secretary';

create or replace function public.set_foodbank_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_foodbank_profile_updated_at on public.foodbank_profile;
create trigger trg_foodbank_profile_updated_at
before update on public.foodbank_profile
for each row
execute function public.set_foodbank_profile_updated_at();

insert into public.foodbank_profile (profile_key)
values ('default-foodbank')
on conflict (profile_key) do update
set updated_at = now();

alter table public.foodbank_profile enable row level security;

drop policy if exists "Public can read active foodbank profile" on public.foodbank_profile;
create policy "Public can read active foodbank profile"
on public.foodbank_profile
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Authenticated can read foodbank profiles" on public.foodbank_profile;
create policy "Authenticated can read foodbank profiles"
on public.foodbank_profile
for select
to authenticated
using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can insert foodbank profiles" on public.foodbank_profile;
create policy "Authenticated can insert foodbank profiles"
on public.foodbank_profile
for insert
to authenticated
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update foodbank profiles" on public.foodbank_profile;
create policy "Authenticated can update foodbank profiles"
on public.foodbank_profile
for update
to authenticated
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete foodbank profiles" on public.foodbank_profile;
create policy "Authenticated can delete foodbank profiles"
on public.foodbank_profile
for delete
to authenticated
using (auth.role() = 'authenticated');
