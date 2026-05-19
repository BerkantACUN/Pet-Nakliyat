-- Patiyolu — Sprint 7 / Social
-- avatars storage bucket + follows tablosu + public profile için profile alanları

-- =========================================================
-- profiles: bio + cover + last_seen_at + (avatar_url zaten var)
-- =========================================================
alter table public.profiles
  add column if not exists bio text check (char_length(bio) <= 280),
  add column if not exists cover_url text,
  add column if not exists last_seen_at timestamptz;

-- =========================================================
-- follows tablosu
-- =========================================================
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists idx_follows_follower on public.follows(follower_id, created_at desc);
create index if not exists idx_follows_following on public.follows(following_id, created_at desc);

alter table public.follows enable row level security;

-- Herkes herkesin takipçi/takip ettiğini görebilsin (public)
drop policy if exists "follows_public_select" on public.follows;
create policy "follows_public_select"
  on public.follows
  for select
  using (true);

-- Sadece kullanıcı kendi adına takip ekleyebilir
drop policy if exists "follows_self_insert" on public.follows;
create policy "follows_self_insert"
  on public.follows
  for insert
  with check (auth.uid() = follower_id);

-- Sadece kendi takiplerini silebilir
drop policy if exists "follows_self_delete" on public.follows;
create policy "follows_self_delete"
  on public.follows
  for delete
  using (auth.uid() = follower_id);

-- =========================================================
-- avatars storage bucket (public okuma, sahibi upload)
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public okuma (avatar herkese açık)
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

-- Sadece kendi user_id'sine yükleyebilir (path: <user_id>/<filename>)
drop policy if exists "avatars_owner_upload" on storage.objects;
create policy "avatars_owner_upload"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =========================================================
-- Direkt mesaj desteği — conversations.listing_id nullable
-- =========================================================
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'conversations'
      and column_name = 'listing_id'
      and is_nullable = 'NO'
  ) then
    execute 'alter table public.conversations alter column listing_id drop not null';
  end if;
end$$;

-- Eski unique constraint'i partial unique index'lerle değiştir
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'conversations_listing_id_customer_id_transporter_id_key'
  ) then
    execute 'alter table public.conversations drop constraint conversations_listing_id_customer_id_transporter_id_key';
  end if;
end$$;

create unique index if not exists conversations_listing_unique
  on public.conversations (listing_id, customer_id, transporter_id)
  where listing_id is not null;

create unique index if not exists conversations_direct_unique
  on public.conversations (customer_id, transporter_id)
  where listing_id is null;

-- =========================================================
-- public.profile_stats view — public profile için tek satır
-- =========================================================
create or replace view public.profile_stats as
select
  p.id,
  p.full_name,
  p.avatar_url,
  p.cover_url,
  p.bio,
  p.city,
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
