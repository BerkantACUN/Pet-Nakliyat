-- Patiyolu — Faz 1 / Sprint 1
-- profiles + user_roles + transporter_profiles + pets

-- Helper: updated_at otomatik tetikleyici
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =========================================================
-- profiles
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone text unique,
  city text,
  kvkk_consent_at timestamptz not null,
  marketing_consent boolean not null default false,
  default_role text not null default 'customer'
    check (default_role in ('customer','transporter','sitter','vet')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_city on public.profiles(city);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================================
-- user_roles
-- =========================================================
create table if not exists public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null
    check (role in ('customer','transporter','sitter','vet')),
  enabled_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index if not exists idx_user_roles_role on public.user_roles(role);

-- =========================================================
-- transporter_profiles
-- =========================================================
create table if not exists public.transporter_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  slug text unique not null,
  bio text,
  company_name text,
  vehicle_type text check (vehicle_type in ('car','van','truck')),
  plate text,
  service_cities text[] not null default '{}',
  base_rate_per_km numeric(8,2) not null default 8.00,
  min_charge numeric(10,2) not null default 350.00,
  kyc_status text not null default 'pending'
    check (kyc_status in ('pending','approved','rejected')),
  contract_signature_id uuid,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  completed_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transporter_kyc_status on public.transporter_profiles(kyc_status);
create index if not exists idx_transporter_cities on public.transporter_profiles using gin(service_cities);

drop trigger if exists trg_transporter_profiles_updated on public.transporter_profiles;
create trigger trg_transporter_profiles_updated
  before update on public.transporter_profiles
  for each row execute function public.set_updated_at();

-- =========================================================
-- pets
-- =========================================================
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  species text not null check (species in ('dog','cat','bird','rabbit','other')),
  breed text,
  weight_kg numeric(5,2),
  age_years numeric(4,1),
  photo_url text,
  special_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pets_owner on public.pets(owner_id);

drop trigger if exists trg_pets_updated on public.pets;
create trigger trg_pets_updated
  before update on public.pets
  for each row execute function public.set_updated_at();

-- =========================================================
-- handle_new_user — yeni kullanıcı auth.users'a eklendiğinde
-- profiles satırını otomatik oluşturmaz; sign-up server action yapar.
-- Bu, KVKK consent timestamp'inin yakalanmasını zorunlu kılar.
-- (Trigger yok bilerek.)
-- =========================================================
