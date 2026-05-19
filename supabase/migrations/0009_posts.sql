-- Patiyolu — Sprint 9 / Posts
-- Kullanıcı paylaşımları: text + opsiyonel görsel + beğeni + yorum

-- =========================================================
-- posts tablosu
-- =========================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  image_url text,
  pet_id uuid references public.pets(id) on delete set null,
  like_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_author on public.posts(author_id, created_at desc);

alter table public.posts enable row level security;

drop policy if exists "posts_public_select" on public.posts;
create policy "posts_public_select"
  on public.posts
  for select
  using (true);

drop policy if exists "posts_self_insert" on public.posts;
create policy "posts_self_insert"
  on public.posts
  for insert
  with check (auth.uid() = author_id);

drop policy if exists "posts_self_update" on public.posts;
create policy "posts_self_update"
  on public.posts
  for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "posts_self_delete" on public.posts;
create policy "posts_self_delete"
  on public.posts
  for delete
  using (auth.uid() = author_id);

-- =========================================================
-- post_likes tablosu
-- =========================================================
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists idx_post_likes_user on public.post_likes(user_id);

alter table public.post_likes enable row level security;

drop policy if exists "post_likes_public_select" on public.post_likes;
create policy "post_likes_public_select"
  on public.post_likes
  for select
  using (true);

drop policy if exists "post_likes_self_insert" on public.post_likes;
create policy "post_likes_self_insert"
  on public.post_likes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "post_likes_self_delete" on public.post_likes;
create policy "post_likes_self_delete"
  on public.post_likes
  for delete
  using (auth.uid() = user_id);

-- Like aggregate triggerı
create or replace function public.update_post_like_count()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts set like_count = like_count + 1 where id = NEW.post_id;
  elsif (TG_OP = 'DELETE') then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_post_likes_count on public.post_likes;
create trigger trg_post_likes_count
  after insert or delete on public.post_likes
  for each row
  execute function public.update_post_like_count();

-- =========================================================
-- post_comments tablosu
-- =========================================================
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists idx_post_comments_post on public.post_comments(post_id, created_at);

alter table public.post_comments enable row level security;

drop policy if exists "post_comments_public_select" on public.post_comments;
create policy "post_comments_public_select"
  on public.post_comments
  for select
  using (true);

drop policy if exists "post_comments_self_insert" on public.post_comments;
create policy "post_comments_self_insert"
  on public.post_comments
  for insert
  with check (auth.uid() = author_id);

drop policy if exists "post_comments_self_delete" on public.post_comments;
create policy "post_comments_self_delete"
  on public.post_comments
  for delete
  using (auth.uid() = author_id);

-- Comment aggregate
create or replace function public.update_post_comment_count()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts set comment_count = comment_count + 1 where id = NEW.post_id;
  elsif (TG_OP = 'DELETE') then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_post_comments_count on public.post_comments;
create trigger trg_post_comments_count
  after insert or delete on public.post_comments
  for each row
  execute function public.update_post_comment_count();

-- =========================================================
-- posts storage bucket (görseller)
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posts', 'posts', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "posts_public_read" on storage.objects;
create policy "posts_public_read"
  on storage.objects
  for select
  using (bucket_id = 'posts');

drop policy if exists "posts_owner_upload" on storage.objects;
create policy "posts_owner_upload"
  on storage.objects
  for insert
  with check (
    bucket_id = 'posts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "posts_owner_delete" on storage.objects;
create policy "posts_owner_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'posts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =========================================================
-- Notification türüne post_like ve post_comment ekle
-- =========================================================
alter table public.notifications
  drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check check (type in (
    'follow',
    'bid_received',
    'bid_accepted',
    'bid_rejected',
    'message',
    'booking_update',
    'review_received',
    'post_like',
    'post_comment'
  ));

alter table public.notifications
  add column if not exists related_post uuid references public.posts(id) on delete cascade;

-- Post like → notification
create or replace function public.notify_on_post_like()
returns trigger language plpgsql security definer as $$
declare
  v_author uuid;
begin
  select author_id into v_author from public.posts where id = NEW.post_id;
  if v_author is not null and v_author <> NEW.user_id then
    insert into public.notifications (user_id, type, actor_id, related_post)
    values (v_author, 'post_like', NEW.user_id, NEW.post_id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_post_likes_notify on public.post_likes;
create trigger trg_post_likes_notify
  after insert on public.post_likes
  for each row
  execute function public.notify_on_post_like();

-- Post comment → notification
create or replace function public.notify_on_post_comment()
returns trigger language plpgsql security definer as $$
declare
  v_author uuid;
begin
  select author_id into v_author from public.posts where id = NEW.post_id;
  if v_author is not null and v_author <> NEW.author_id then
    insert into public.notifications (
      user_id, type, actor_id, related_post, payload
    ) values (
      v_author, 'post_comment', NEW.author_id, NEW.post_id,
      jsonb_build_object('preview', left(NEW.body, 120))
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_post_comments_notify on public.post_comments;
create trigger trg_post_comments_notify
  after insert on public.post_comments
  for each row
  execute function public.notify_on_post_comment();
