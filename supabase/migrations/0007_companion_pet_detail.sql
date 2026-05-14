-- Companion Wall F3: per-pet detail RPC (title list + 80-char content excerpt + POV + photo_url)
-- Privacy: never returns user_id / owner_id / specific entry_date / created_at / tags / pov_generated_at
-- Year-only granularity for timeline; substring(content, 1, 80) caps text exposure

create or replace function public.get_companion_pet_detail(target_pet_id uuid)
returns table (
  id uuid,
  name text,
  species text,
  breed text,
  avatar_url text,
  has_passed_away boolean,
  passed_year int,
  memorial_note text,
  birth_year int,
  entries jsonb
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
    p.memorial_note,
    extract(year from p.birth_date)::int as birth_year,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', e.id,
            'title', e.title,
            'content_excerpt', substring(e.content from 1 for 80),
            'has_more', length(e.content) > 80,
            'year', extract(year from e.entry_date)::int,
            'mood', e.mood,
            'photo_url', e.photo_url,
            'pet_pov_text', e.pet_pov_text,
            'pet_pov_style', e.pet_pov_style
          )
          order by e.entry_date desc
        )
        from entries e
        where e.pet_id = p.id
      ),
      '[]'::jsonb
    ) as entries
  from pets p
  where p.id = target_pet_id
    and p.public_companion = true;
$$;

grant execute on function public.get_companion_pet_detail(uuid) to anon, authenticated;
