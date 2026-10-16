-- TAP IN managed opportunities.
-- Apply this migration in the Supabase SQL editor before enabling the TAP IN manager.
create extension if not exists pgcrypto;

create table if not exists public.tap_in_opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) between 2 and 180),
  country text not null default '' check (length(country) <= 120),
  region text not null default '' check (length(region) <= 120),
  sector text not null check (length(trim(sector)) between 2 and 120),
  opportunity_type text not null check (length(trim(opportunity_type)) between 2 and 120),
  description text not null check (length(trim(description)) between 10 and 12000),
  who_this_is_for text not null check (length(trim(who_this_is_for)) between 5 and 3000),
  enquiry_questions jsonb not null default '[]'::jsonb
    check (jsonb_typeof(enquiry_questions) = 'array'
      and jsonb_array_length(enquiry_questions) between 2 and 4),
  status text not null default 'draft'
    check (status in ('draft', 'live', 'closed', 'archived')),
  image_url text,
  share_image_url text,
  seo_title text check (seo_title is null or length(seo_title) <= 180),
  seo_description text check (seo_description is null or length(seo_description) <= 320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tap_in_opportunities_status_updated_idx
  on public.tap_in_opportunities (status, updated_at desc);
create index if not exists tap_in_opportunities_country_idx
  on public.tap_in_opportunities (country);
create index if not exists tap_in_opportunities_region_idx
  on public.tap_in_opportunities (region);
create index if not exists tap_in_opportunities_sector_idx
  on public.tap_in_opportunities (sector);
create index if not exists tap_in_opportunities_type_idx
  on public.tap_in_opportunities (opportunity_type);

create or replace function public.tap_in_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tap_in_opportunities_set_updated_at on public.tap_in_opportunities;
create trigger tap_in_opportunities_set_updated_at
before update on public.tap_in_opportunities
for each row execute function public.tap_in_set_updated_at();

-- All reads and writes are performed server-side with the service-role key.
-- RLS is enabled so public browser clients cannot read drafts or mutate listings directly.
alter table public.tap_in_opportunities enable row level security;
