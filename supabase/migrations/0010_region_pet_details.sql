-- Patiyolu — Sprint 10 / Region + detailed pet info
-- profiles.region (bölge), pets.food_brand + feeding_schedule + toilet_schedule + medications

-- =========================================================
-- profiles.region — Türkiye coğrafi bölgesi
-- =========================================================
alter table public.profiles
  add column if not exists region text check (region in (
    'marmara', 'ege', 'akdeniz', 'ic_anadolu',
    'karadeniz', 'dogu_anadolu', 'guneydogu_anadolu'
  ));

create index if not exists idx_profiles_region on public.profiles(region);

-- =========================================================
-- pets — bakım detayları
-- =========================================================
alter table public.pets
  add column if not exists food_brand text check (food_brand is null or char_length(food_brand) <= 120),
  add column if not exists food_type text check (food_type is null or food_type in (
    'dry', 'wet', 'raw', 'home_cooked', 'mixed', 'other'
  )),
  add column if not exists feeding_times text[] default array[]::text[],
  add column if not exists toilet_times text[] default array[]::text[],
  add column if not exists medications text check (medications is null or char_length(medications) <= 500),
  add column if not exists is_neutered boolean default false,
  add column if not exists is_vaccinated boolean default false,
  add column if not exists vet_contact text check (vet_contact is null or char_length(vet_contact) <= 200),
  add column if not exists emergency_contact text check (emergency_contact is null or char_length(emergency_contact) <= 200);

-- =========================================================
-- listings — taşıma sırasında dikkat edilecekler
-- =========================================================
alter table public.listings
  add column if not exists care_notes text check (care_notes is null or char_length(care_notes) <= 1000),
  add column if not exists feeding_during_transit boolean default false,
  add column if not exists carrier_provided text check (carrier_provided is null or carrier_provided in (
    'customer', 'transporter', 'none'
  )),
  add column if not exists temperature_preference text check (temperature_preference is null or temperature_preference in (
    'cool', 'normal', 'warm'
  ));

-- =========================================================
-- profile_stats view'ı yenile (region eklendi)
-- =========================================================
drop view if exists public.profile_stats;

create view public.profile_stats as
select
  p.id,
  p.full_name,
  p.avatar_url,
  p.cover_url,
  p.bio,
  p.city,
  p.region,
  p.created_at,
  p.last_seen_at,
  coalesce(tp.rating_avg, 0)::numeric(3,2) as rating_avg,
  coalesce(tp.rating_count, 0) as rating_count,
  coalesce(tp.completed_count, 0) as completed_count,
  tp.service_cities,
  tp.vehicle_type,
  tp.slug as transporter_slug,
  exists(select 1 from public.user_roles ur where ur.user_id = p.id and ur.role = 'transporter') as is_transporter,
  exists(select 1 from public.user_roles ur where ur.user_id = p.id and ur.role = 'customer') as is_customer,
  (select count(*) from public.follows f where f.following_id = p.id) as followers_count,
  (select count(*) from public.follows f where f.follower_id = p.id) as following_count
from public.profiles p
left join public.transporter_profiles tp on tp.user_id = p.id;

grant select on public.profile_stats to anon, authenticated;
