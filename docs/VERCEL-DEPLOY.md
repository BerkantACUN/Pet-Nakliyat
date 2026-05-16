# Vercel Deploy — Patiyolu

Bu rehber Patiyolu'nu GitHub repo'sundan Vercel'e deploy etmenin adımlarıdır.

GitHub repo: https://github.com/BerkantACUN/Pet-Nakliyat

---

## 1. Vercel hesabı + projeyi import et

1. https://vercel.com/signup adresinden **GitHub ile giriş yap** (zaten varsa atla).
2. Dashboard → **Add New → Project** → "Import Git Repository" altında `BerkantACUN/Pet-Nakliyat` seç.
3. **Configure Project** ekranında:
   - **Framework Preset:** Next.js (otomatik bulur)
   - **Root Directory:** `pet-nakliyat` (Edit'e bas → bu klasörü seç — repo kökünde değil alt klasörde)
   - **Build Command:** boş bırak (default `next build`)
   - **Output Directory:** boş bırak
   - **Install Command:** boş bırak (otomatik pnpm tespit eder)

## 2. Environment Variables

"Environment Variables" bölümünde aşağıdakileri **ayrı ayrı** ekle. Production + Preview + Development hepsine ekle.

| İsim | Değer | Notlar |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nofvyzegeyafbuurqsre.supabase.co` | Public, frontend'e expose olur |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` içindeki anon key | Public, RLS koruyor |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` içindeki service_role key | **Encrypted**, asla NEXT_PUBLIC_ olmaz |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token | Geocoding + directions için |

> Service role key'i `NEXT_PUBLIC_` prefix'i olmadan eklediğine emin ol — yoksa client bundle'a sızar.

## 3. Deploy

**Deploy** butonuna bas. İlk build 2-3 dakika sürer.

Build başarılı olunca Vercel sana `patiyolu-xxx.vercel.app` gibi bir URL verecek.

## 4. Supabase Auth → Vercel URL'sini whitelist'le

Yeni Vercel URL'sini Supabase Dashboard'a eklemen gerekiyor — yoksa OAuth + email confirm çalışmaz.

1. https://supabase.com/dashboard/project/nofvyzegeyafbuurqsre/auth/url-configuration
2. **Site URL:** `https://patiyolu-xxx.vercel.app` (kendi URL'inle değiştir)
3. **Redirect URLs**, "Add URL":
   - `https://patiyolu-xxx.vercel.app/auth/callback`
   - `https://*-berkantacun.vercel.app/auth/callback` (preview deployment'lar için wildcard)

Eğer custom domain bağlayacaksan (`patiyolu.app` gibi), onu da hem Site URL'e hem Redirect listesine ekle.

## 5. Custom domain (opsiyonel)

1. Vercel project → Settings → Domains → Add → `patiyolu.app` yaz
2. Vercel sana CNAME / A record verir → domain sağlayıcında DNS ayarlarına gir
3. Propagation 5-30 dk sürer
4. Supabase Auth URL Configuration'a yeni domain'i ekle

## 6. Otomatik deploy

Bu noktadan sonra `main` branch'e her push otomatik production deploy tetikler.
PR açarsan preview URL otomatik çıkar.

## Sorun giderme

| Sorun | Çözüm |
|---|---|
| Build "Missing environment variable" hatası | Vercel → Settings → Environment Variables → eksik anahtarı ekle → Redeploy |
| `/giris` sonrası "Unable to authenticate" | Supabase Auth → Site URL ve Redirect URLs listesinde Vercel domain'in var mı kontrol et |
| Mapbox haritası boş geliyor | `NEXT_PUBLIC_MAPBOX_TOKEN` eklendi mi? Token Mapbox account → Tokens'ta "public scopes" var mı? |
| Supabase Storage'dan resim 403 | Storage policy'leri 0004 migration ile geldi mi? `kyc` bucket private kalmalı, avatar için ayrı public bucket gerekirse Sprint 6'da |
| Build "module not found" | `pnpm install` lokalde temiz mi? `pnpm-lock.yaml` commit edilmiş olmalı |

## Build doğrulama (lokal)

Deploy'dan önce production build'i lokalde dene:

```powershell
pnpm build
pnpm start
```

`http://localhost:3000` üzerinden production modu test edebilirsin.
