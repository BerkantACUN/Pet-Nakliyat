-- Patiyolu — Sprint 1 RLS politikaları
-- Tüm S1 tabloları için Row Level Security

-- =========================================================
-- profiles
-- =========================================================
alter table public.profiles enable row level security;

-- Kendi profilini okuyabilir
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

-- Herkese açık view alanları için ayrı view kullanılacak (aşağıda)
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

-- Public view: sadece güvenli alanlar
create or replace view public.public_profiles as
  select id, full_name, avatar_url, city
  from public.profiles;

grant select on public.public_profiles to anon, authenticated;

-- =========================================================
-- user_roles
-- =========================================================
alter table public.user_roles enable row level security;

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select using (auth.uid() = user_id);

drop policy if exists user_roles_insert_own on public.user_roles;
create policy user_roles_insert_own on public.user_roles
  for insert with check (auth.uid() = user_id);

drop policy if exists user_roles_delete_own on public.user_roles;
create policy user_roles_delete_own on public.user_roles
  for delete using (auth.uid() = user_id);

-- =========================================================
-- transporter_profiles
-- =========================================================
alter table public.transporter_profiles enable row level security;

-- Herkes okuyabilir (public profil sayfası için)
drop policy if exists transporter_profiles_select_public on public.transporter_profiles;
create policy transporter_profiles_select_public on public.transporter_profiles
  for select using (true);

drop policy if exists transporter_profiles_insert_own on public.transporter_profiles;
create policy transporter_profiles_insert_own on public.transporter_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists transporter_profiles_update_own on public.transporter_profiles;
create policy transporter_profiles_update_own on public.transporter_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================
-- pets
-- =========================================================
alter table public.pets enable row level security;

drop policy if exists pets_all_own on public.pets;
create policy pets_all_own on public.pets
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
