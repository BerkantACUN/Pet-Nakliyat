-- Patiyolu — Sprint 2
-- listings + bids tabloları

-- =========================================================
-- listings
-- =========================================================
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  pickup_address text not null,
  pickup_lat double precision not null,
  pickup_lng double precision not null,
  pickup_city text,
  dropoff_address text not null,
  dropoff_lat double precision not null,
  dropoff_lng double precision not null,
  dropoff_city text,
  distance_km numeric(8,2) not null,
  urgency text not null default 'standard'
    check (urgency in ('standard','express','sameday')),
  est_price_min numeric(10,2) not null,
  est_price_max numeric(10,2) not null,
  scheduled_at timestamptz,
  notes text,
  status text not null default 'draft'
    check (status in ('draft','published','closed','expired','cancelled')),
  listing_fee_paid_at timestamptz,
  listing_fee_amount numeric(8,2),
  iyzico_listing_ref text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_status_urgency on public.listings(status, urgency);
create index if not exists idx_listings_customer on public.listings(customer_id);
create index if not exists idx_listings_pickup_city on public.listings(pickup_city);
create index if not exists idx_listings_dropoff_city on public.listings(dropoff_city);

drop trigger if exists trg_listings_updated on public.listings;
create trigger trg_listings_updated
  before update on public.listings
  for each row execute function public.set_updated_at();

-- =========================================================
-- bids
-- =========================================================
create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  transporter_id uuid not null references public.profiles(id) on delete cascade,
  price numeric(10,2) not null check (price > 0),
  eta_hours numeric(5,2),
  message text,
  status text not null default 'pending'
    check (status in ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, transporter_id)
);

create index if not exists idx_bids_listing on public.bids(listing_id);
create index if not exists idx_bids_transporter on public.bids(transporter_id);

drop trigger if exists trg_bids_updated on public.bids;
create trigger trg_bids_updated
  before update on public.bids
  for each row execute function public.set_updated_at();

-- =========================================================
-- RLS
-- =========================================================
alter table public.listings enable row level security;

-- Müşteri kendi ilanlarını CRUD
drop policy if exists listings_select_own on public.listings;
create policy listings_select_own on public.listings
  for select using (auth.uid() = customer_id);

drop policy if exists listings_select_published on public.listings;
create policy listings_select_published on public.listings
  for select using (status = 'published');

drop policy if exists listings_insert_own on public.listings;
create policy listings_insert_own on public.listings
  for insert with check (auth.uid() = customer_id);

drop policy if exists listings_update_own on public.listings;
create policy listings_update_own on public.listings
  for update using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

drop policy if exists listings_delete_own on public.listings;
create policy listings_delete_own on public.listings
  for delete using (auth.uid() = customer_id);

-- bids
alter table public.bids enable row level security;

drop policy if exists bids_select_own_or_listing_owner on public.bids;
create policy bids_select_own_or_listing_owner on public.bids
  for select using (
    auth.uid() = transporter_id
    or auth.uid() = (select customer_id from public.listings l where l.id = bids.listing_id)
  );

drop policy if exists bids_insert_own on public.bids;
create policy bids_insert_own on public.bids
  for insert with check (
    auth.uid() = transporter_id
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'published'
    )
  );

drop policy if exists bids_update_own on public.bids;
create policy bids_update_own on public.bids
  for update using (auth.uid() = transporter_id)
  with check (auth.uid() = transporter_id);
