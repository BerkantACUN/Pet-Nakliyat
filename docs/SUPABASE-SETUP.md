# Supabase Setup — Patiyolu

Bu rehber, Supabase project'inde Patiyolu için yapılması gereken **tek seferlik**
hazırlığı anlatır.

Project ref: `nofvyzegeyafbuurqsre`

## 1. Migration'ları uygula

`supabase/migrations/` altındaki SQL dosyalarını sırayla çalıştır.

**Yöntem A — Dashboard SQL Editor (en hızlı):**

1. https://supabase.com/dashboard/project/nofvyzegeyafbuurqsre/sql/new
2. `supabase/migrations/0001_profiles_roles_pets.sql` → Run
3. `supabase/migrations/0002_rls_policies_s1.sql` → Run
4. `supabase/migrations/0003_listings_bids.sql` → Run
5. `supabase/migrations/0004_contracts_kyc.sql` → Run
6. `supabase/migrations/0005_seed_contract_v1.sql` → Run (uzun, ~25KB)
7. Sonraki sprint'lerde yeni migration dosyalarını sırayla aynı şekilde çalıştır

**Yöntem B — Supabase CLI:**

```bash
npx supabase login
npx supabase link --project-ref nofvyzegeyafbuurqsre
npx supabase db push
```

## 2. Auth ayarları

### Site URL

https://supabase.com/dashboard/project/nofvyzegeyafbuurqsre/auth/url-configuration

- **Site URL:** `http://localhost:3000` (dev için). Production'da
  `https://patiyolu.app` ile değiştir.
- **Redirect URLs (allow list):** her ortam için ekle:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3001/auth/callback`  (dev'de bazen 3001'e düşüyor)
  - `https://patiyolu.app/auth/callback`

### Email Auth

https://supabase.com/dashboard/project/nofvyzegeyafbuurqsre/auth/providers

- **Email provider:** aktif (default zaten açık)
- **Confirm email:** dev'de **kapatabilirsin** (hızlı test için). Production'da
  açık tut.
- **Secure email change:** açık
- **Password min length:** 8

### Google OAuth (opsiyonel ama önerilir)

1. https://console.cloud.google.com/apis/credentials → OAuth client ID oluştur
   - Authorized redirect URI:
     `https://nofvyzegeyafbuurqsre.supabase.co/auth/v1/callback`
2. Supabase Dashboard → Auth → Providers → Google → Client ID + Secret yapıştır
3. Save

### E-posta şablonlarını Türkçeleştir (opsiyonel)

https://supabase.com/dashboard/project/nofvyzegeyafbuurqsre/auth/templates

- **Confirm signup:** "Patiyolu hesabını onayla 🐾"
- **Magic link:** "Patiyolu'ya giriş bağlantın"
- **Reset password:** "Şifreni sıfırla"

İçerik şablonu örnekleri Faz 2'de eklenecek.

## 3. RLS doğrulama

SQL Editor'da kontrol:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public';
```

Tüm public tablolar `rowsecurity = true` olmalı.

## 4. Doğrula

`.env.local` doluyken `pnpm dev` ile:

1. `/kayit` → form doldur → onayla → /giris'e yönlenir
2. `/giris` → kayıt olduğun e-postayla giriş → /panel'e yönlenir
3. Eğer onboarding yarımsa → /onboarding'e yönlenir, telefon + şehir + rol seç
4. /panel'de "Merhaba, {ad}" karşılaması görünür
5. Avatar dropdown → Çıkış yap → /'ya geri döner

## 5. KYC Storage (Sprint 5)

0004 migration `kyc` adında **private** bir bucket oluşturur ve RLS policies'i ekler. Dashboard'da kontrol:

- https://supabase.com/dashboard/project/nofvyzegeyafbuurqsre/storage/buckets
- `kyc` bucket görünmeli, **Public access = OFF**
- Storage → Policies → bucket = kyc → 4 policy (read/insert/update/delete) sadece kendi `auth.uid()` klasörü için

Path düzeni: `kyc/{user_id}/{doc_type}-{timestamp}.{ext}`

## 6. Sıradaki sprint'ler için

- **S3 — Iyzico:** ayrı doc, ödeme API anahtarları
- **S6 — Realtime:** chat için `messages` ve `conversations` tabloları realtime'a açılır
- **S7 — Admin:** KYC inceleme paneli için admin rolü RPC'leri

## Sorun giderme

- **`Email rate limit exceeded`** → Dashboard'dan email confirmation'ı kapat veya
  Custom SMTP ayarla
- **OAuth callback hatası** → Redirect URL allow list'e callback URL'yi eklediğinden
  emin ol
- **RLS error: new row violates row-level security policy** → ilgili tablonun
  policy'sini SQL Editor'da kontrol et
