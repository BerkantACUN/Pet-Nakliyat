-- Patiyolu — Sprint 6
-- bookings + conversations + messages + payments + reviews

-- =========================================================
-- bookings
-- =========================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid unique not null references public.listings(id) on delete cascade,
  bid_id uuid unique not null references public.bids(id) on delete restrict,
  transporter_id uuid not null references public.profiles(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  agreed_price numeric(10,2) not null,
  platform_fee numeric(10,2) not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','accepted','en_route','delivered','completed','cancelled','disputed')),
  iyzico_payment_ref text,
  paid_at timestamptz,
  started_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_customer on public.bookings(customer_id, status);
create index if not exists idx_bookings_transporter on public.bookings(transporter_id, status);

alter table public.bookings enable row level security;

drop policy if exists "bookings_participants_select" on public.bookings;
create policy "bookings_participants_select"
  on public.bookings
  for select
  using (auth.uid() = customer_id or auth.uid() = transporter_id);

drop policy if exists "bookings_participants_update" on public.bookings;
create policy "bookings_participants_update"
  on public.bookings
  for update
  using (auth.uid() = customer_id or auth.uid() = transporter_id)
  with check (auth.uid() = customer_id or auth.uid() = transporter_id);

-- Insert is server-only (acceptBidAction yapar)
drop policy if exists "bookings_participants_insert" on public.bookings;
create policy "bookings_participants_insert"
  on public.bookings
  for insert
  with check (auth.uid() = customer_id);

drop trigger if exists trg_bookings_updated on public.bookings;
create trigger trg_bookings_updated
  before update on public.bookings
  for each row
  execute function public.set_updated_at();

-- =========================================================
-- conversations
-- =========================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  transporter_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  last_message_at timestamptz,
  customer_unread_count int not null default 0,
  transporter_unread_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (listing_id, customer_id, transporter_id)
);

create index if not exists idx_conversations_customer on public.conversations(customer_id, last_message_at desc);
create index if not exists idx_conversations_transporter on public.conversations(transporter_id, last_message_at desc);

alter table public.conversations enable row level security;

drop policy if exists "conversations_participants_select" on public.conversations;
create policy "conversations_participants_select"
  on public.conversations
  for select
  using (auth.uid() = customer_id or auth.uid() = transporter_id);

drop policy if exists "conversations_participants_insert" on public.conversations;
create policy "conversations_participants_insert"
  on public.conversations
  for insert
  with check (auth.uid() = customer_id or auth.uid() = transporter_id);

drop policy if exists "conversations_participants_update" on public.conversations;
create policy "conversations_participants_update"
  on public.conversations
  for update
  using (auth.uid() = customer_id or auth.uid() = transporter_id)
  with check (auth.uid() = customer_id or auth.uid() = transporter_id);

-- =========================================================
-- messages
-- =========================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "messages_participants_select" on public.messages;
create policy "messages_participants_select"
  on public.messages
  for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or c.transporter_id = auth.uid())
    )
  );

drop policy if exists "messages_participants_insert" on public.messages;
create policy "messages_participants_insert"
  on public.messages
  for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or c.transporter_id = auth.uid())
    )
  );

-- Realtime için publication'a ekle
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.bookings;

-- =========================================================
-- payments — booking + listing fee ödemeleri
-- =========================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('listing_fee','booking_commission','booking_full','refund')),
  amount numeric(10,2) not null,
  currency text not null default 'TRY',
  provider text not null default 'iyzico',
  provider_ref text,
  status text not null default 'pending'
    check (status in ('pending','success','failed','refunded')),
  related_listing uuid references public.listings(id) on delete set null,
  related_booking uuid references public.bookings(id) on delete set null,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_user on public.payments(user_id, created_at desc);
create index if not exists idx_payments_booking on public.payments(related_booking);

alter table public.payments enable row level security;

drop policy if exists "payments_own_select" on public.payments;
create policy "payments_own_select"
  on public.payments
  for select
  using (auth.uid() = user_id);

-- Insert sadece server-side service role'dan yapılacak — direct insert policy yok.

-- =========================================================
-- reviews
-- =========================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 2000),
  created_at timestamptz not null default now(),
  unique (booking_id, author_id)
);

create index if not exists idx_reviews_target on public.reviews(target_id, created_at desc);

alter table public.reviews enable row level security;

-- Herkes bir taşıyıcının yorumlarını okuyabilir (public profile için)
drop policy if exists "reviews_public_select" on public.reviews;
create policy "reviews_public_select"
  on public.reviews
  for select
  using (true);

drop policy if exists "reviews_author_insert" on public.reviews;
create policy "reviews_author_insert"
  on public.reviews
  for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.status = 'completed'
        and (b.customer_id = auth.uid() or b.transporter_id = auth.uid())
    )
  );

-- Update / delete yok — yorumlar immutable.

-- =========================================================
-- transporter rating aggregate trigger
-- =========================================================
create or replace function public.update_transporter_rating()
returns trigger language plpgsql as $$
declare
  avg_rating numeric(3,2);
  cnt int;
begin
  select coalesce(avg(rating), 0)::numeric(3,2), count(*)
  into avg_rating, cnt
  from public.reviews
  where target_id = NEW.target_id;

  update public.transporter_profiles
  set rating_avg = avg_rating, rating_count = cnt
  where user_id = NEW.target_id;

  return NEW;
end;
$$;

drop trigger if exists trg_reviews_aggregate on public.reviews;
create trigger trg_reviews_aggregate
  after insert on public.reviews
  for each row
  execute function public.update_transporter_rating();

-- =========================================================
-- transporter completed_count: booking completed olunca artır
-- =========================================================
create or replace function public.increment_completed_count()
returns trigger language plpgsql as $$
begin
  if NEW.status = 'completed' and (OLD.status is null or OLD.status <> 'completed') then
    update public.transporter_profiles
    set completed_count = completed_count + 1
    where user_id = NEW.transporter_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_bookings_completed on public.bookings;
create trigger trg_bookings_completed
  after update on public.bookings
  for each row
  execute function public.increment_completed_count();
