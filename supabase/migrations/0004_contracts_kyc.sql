-- Patiyolu — Sprint 5
-- contract_templates + contract_signatures + kyc_documents + storage bucket

-- =========================================================
-- contract_templates  (seed v1 below)
-- =========================================================
create table if not exists public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  audience text not null check (audience in ('transporter','customer')),
  title text not null,
  content_md text not null,
  word_count int not null default 0,
  effective_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_contract_templates_audience on public.contract_templates(audience, effective_at desc);

alter table public.contract_templates enable row level security;

drop policy if exists "contract_templates_public_read" on public.contract_templates;
create policy "contract_templates_public_read"
  on public.contract_templates
  for select
  using (true);

-- =========================================================
-- contract_signatures
-- =========================================================
create table if not exists public.contract_signatures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid not null references public.contract_templates(id),
  signed_full_name text not null,
  signed_ip inet,
  signed_user_agent text,
  signature_hash text not null,
  signed_at timestamptz not null default now(),
  unique (user_id, template_id)
);

create index if not exists idx_contract_signatures_user on public.contract_signatures(user_id);

alter table public.contract_signatures enable row level security;

drop policy if exists "contract_signatures_own_read" on public.contract_signatures;
create policy "contract_signatures_own_read"
  on public.contract_signatures
  for select
  using (auth.uid() = user_id);

drop policy if exists "contract_signatures_own_insert" on public.contract_signatures;
create policy "contract_signatures_own_insert"
  on public.contract_signatures
  for insert
  with check (auth.uid() = user_id);

-- imza kayıtları immutable — update / delete yok

-- =========================================================
-- kyc_documents
-- =========================================================
create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  doc_type text not null check (doc_type in ('id_front','id_back','plate_photo','vehicle_registration')),
  storage_path text not null,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  reviewer_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, doc_type)
);

create index if not exists idx_kyc_documents_user on public.kyc_documents(user_id);
create index if not exists idx_kyc_documents_status on public.kyc_documents(status);

alter table public.kyc_documents enable row level security;

drop policy if exists "kyc_documents_own_select" on public.kyc_documents;
create policy "kyc_documents_own_select"
  on public.kyc_documents
  for select
  using (auth.uid() = user_id);

drop policy if exists "kyc_documents_own_insert" on public.kyc_documents;
create policy "kyc_documents_own_insert"
  on public.kyc_documents
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "kyc_documents_own_update" on public.kyc_documents;
create policy "kyc_documents_own_update"
  on public.kyc_documents
  for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "kyc_documents_own_delete" on public.kyc_documents;
create policy "kyc_documents_own_delete"
  on public.kyc_documents
  for delete
  using (auth.uid() = user_id and status = 'pending');

-- =========================================================
-- transporter_profiles  contract_signed_at convenience column
-- =========================================================
alter table public.transporter_profiles
  add column if not exists contract_signed_at timestamptz;

-- =========================================================
-- updated_at trigger reuse
-- =========================================================
drop trigger if exists trg_kyc_documents_updated on public.kyc_documents;
create trigger trg_kyc_documents_updated
  before update on public.kyc_documents
  for each row
  execute function public.set_updated_at();

-- =========================================================
-- Storage bucket — kyc (private)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('kyc', 'kyc', false)
on conflict (id) do nothing;

-- Storage policies — kullanıcı kendi klasörüne yükler/okur
-- Path format: kyc/{user_id}/{doc_type}.{ext}

drop policy if exists "kyc_storage_own_read" on storage.objects;
create policy "kyc_storage_own_read"
  on storage.objects
  for select
  using (
    bucket_id = 'kyc'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "kyc_storage_own_insert" on storage.objects;
create policy "kyc_storage_own_insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'kyc'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "kyc_storage_own_update" on storage.objects;
create policy "kyc_storage_own_update"
  on storage.objects
  for update
  using (
    bucket_id = 'kyc'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "kyc_storage_own_delete" on storage.objects;
create policy "kyc_storage_own_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'kyc'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
