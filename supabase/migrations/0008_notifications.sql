-- Patiyolu — Sprint 8 / Notifications
-- notifications tablosu + triggerlar (follow, bid_received, bid_outcome, message)

-- =========================================================
-- notifications tablosu
-- =========================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'follow',
    'bid_received',
    'bid_accepted',
    'bid_rejected',
    'message',
    'booking_update',
    'review_received'
  )),
  actor_id uuid references public.profiles(id) on delete cascade,
  related_listing uuid references public.listings(id) on delete cascade,
  related_bid uuid references public.bids(id) on delete cascade,
  related_booking uuid references public.bookings(id) on delete cascade,
  related_conversation uuid references public.conversations(id) on delete cascade,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread
  on public.notifications(user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_own_select" on public.notifications;
create policy "notifications_own_select"
  on public.notifications
  for select
  using (auth.uid() = user_id);

drop policy if exists "notifications_own_update" on public.notifications;
create policy "notifications_own_update"
  on public.notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Insert sadece trigger / service role'dan
alter publication supabase_realtime add table public.notifications;

-- =========================================================
-- follow → notification
-- =========================================================
create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer as $$
begin
  insert into public.notifications (user_id, type, actor_id)
  values (NEW.following_id, 'follow', NEW.follower_id);
  return NEW;
end;
$$;

drop trigger if exists trg_follows_notify on public.follows;
create trigger trg_follows_notify
  after insert on public.follows
  for each row
  execute function public.notify_on_follow();

-- =========================================================
-- bids → notification (ilan sahibine yeni teklif)
-- =========================================================
create or replace function public.notify_on_bid_insert()
returns trigger language plpgsql security definer as $$
declare
  v_customer_id uuid;
begin
  select customer_id into v_customer_id
  from public.listings
  where id = NEW.listing_id;

  if v_customer_id is not null then
    insert into public.notifications (
      user_id, type, actor_id, related_listing, related_bid, payload
    )
    values (
      v_customer_id, 'bid_received', NEW.transporter_id,
      NEW.listing_id, NEW.id, jsonb_build_object('price', NEW.price)
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_bids_notify_insert on public.bids;
create trigger trg_bids_notify_insert
  after insert on public.bids
  for each row
  execute function public.notify_on_bid_insert();

-- =========================================================
-- bids → notification (teklif kabul/red — taşıyıcıya)
-- =========================================================
create or replace function public.notify_on_bid_status_change()
returns trigger language plpgsql security definer as $$
begin
  if NEW.status = 'accepted' and (OLD.status is null or OLD.status <> 'accepted') then
    insert into public.notifications (
      user_id, type, related_bid, related_listing, payload
    ) values (
      NEW.transporter_id, 'bid_accepted', NEW.id, NEW.listing_id,
      jsonb_build_object('price', NEW.price)
    );
  elsif NEW.status = 'rejected' and (OLD.status is null or OLD.status <> 'rejected') then
    insert into public.notifications (
      user_id, type, related_bid, related_listing
    ) values (
      NEW.transporter_id, 'bid_rejected', NEW.id, NEW.listing_id
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_bids_notify_status on public.bids;
create trigger trg_bids_notify_status
  after update on public.bids
  for each row
  execute function public.notify_on_bid_status_change();

-- =========================================================
-- messages → notification (karşı tarafa yeni mesaj)
-- =========================================================
create or replace function public.notify_on_message()
returns trigger language plpgsql security definer as $$
declare
  v_customer_id uuid;
  v_transporter_id uuid;
  v_recipient uuid;
begin
  select customer_id, transporter_id into v_customer_id, v_transporter_id
  from public.conversations
  where id = NEW.conversation_id;

  v_recipient := case
    when NEW.sender_id = v_customer_id then v_transporter_id
    else v_customer_id
  end;

  if v_recipient is not null and v_recipient <> NEW.sender_id then
    insert into public.notifications (
      user_id, type, actor_id, related_conversation, payload
    ) values (
      v_recipient, 'message', NEW.sender_id, NEW.conversation_id,
      jsonb_build_object('preview', left(NEW.body, 120))
    );
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_messages_notify on public.messages;
create trigger trg_messages_notify
  after insert on public.messages
  for each row
  execute function public.notify_on_message();

-- =========================================================
-- reviews → notification (yorum yapılan kişiye)
-- =========================================================
create or replace function public.notify_on_review()
returns trigger language plpgsql security definer as $$
begin
  if NEW.target_id <> NEW.author_id then
    insert into public.notifications (
      user_id, type, actor_id, related_booking, payload
    ) values (
      NEW.target_id, 'review_received', NEW.author_id, NEW.booking_id,
      jsonb_build_object('rating', NEW.rating)
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_reviews_notify on public.reviews;
create trigger trg_reviews_notify
  after insert on public.reviews
  for each row
  execute function public.notify_on_review();
