-- Companion Wall: public-facing pet directory (no PII, opt-out per pet)
-- D1=a: default ON; D2=a: alive/passed mixed (caller-side); D4=b: mock seed handled separately

alter table public.pets
  add column if not exists public_companion boolean not null default true;

-- RPC: returns minimal pet fields, SECURITY DEFINER bypasses RLS but only exposes safe columns
create or replace function public.get_companion_wall()
returns table (
  id uuid,
  name text,
  species text,
  breed text,
  avatar_url text,
  has_passed_away boolean,
  passed_year int,
  entries_count int
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    p.species,
    p.breed,
    p.avatar_url,
    (p.passed_away_at is not null) as has_passed_away,
    extract(year from p.passed_away_at)::int as passed_year,
    coalesce((select count(*)::int from entries where pet_id = p.id), 0) as entries_count
  from pets p
  where p.public_companion = true
  order by random();
$$;

grant execute on function public.get_companion_wall() to anon, authenticated;
