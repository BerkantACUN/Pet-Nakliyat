# Patiyolu — Pet Nakliyat

Tüylü dostlar için güvenli, sözleşmeli, puanlı bir nakliyat pazaryeri. Müşteri,
taşıyıcı ve (Faz 2) bakıcı + veteriner panellerini tek hesap altında birleştirir.

> **Faz 1 scope:** Nakliyat çekirdek akışı (ilan → teklif → kabul → sözleşme →
> tamamlama → değerlendirme → ödeme). Bakıcı booking + veteriner dizini Faz 2.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-nova preset, Base UI primitives)
- **Framer Motion** + **lottie-react** — page transitions, micro-interactions, tatlı patik loader
- **Supabase** (Auth + Postgres + Storage + Realtime + RLS)
- **Mapbox GL JS** + Directions API — km bazlı fiyat
- **Iyzico** — ödeme (TR, taksit, 3D Secure)
- **react-hook-form** + **zod** — form + validasyon
- **TanStack Query** — server state
- **next-intl** — i18n (TR default)

Tam plan: `../PLAN.md` (proje kökünde de masaüstü kopyası).

## Hızlı başlangıç

```bash
pnpm install
cp .env.example .env.local   # değerleri doldur (Supabase, Mapbox, Iyzico)
pnpm dev                     # http://localhost:3000
```

Supabase ve diğer servis anahtarları olmadan da landing sayfası açılır
(proxy.ts oturum güncellemeyi sessizce atlar).

### Komutlar

| Komut | Açıklama |
|---|---|
| `pnpm dev` | Dev sunucu (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Build'i çalıştır |
| `pnpm lint` | ESLint |
| `pnpm exec tsc --noEmit` | Tip kontrolü |

## Klasör yapısı

```
app/                  # App Router sayfaları + globals.css
components/           # ui (shadcn), marketing, motion, layout, ...
lib/                  # supabase, mapbox, iyzico, pricing, utils
hooks/                # useReducedMotion, ...
public/lottie/        # Animasyon JSON'ları
supabase/migrations/  # SQL göçleri
docs/                 # DESIGN.md, sözleşmeler
proxy.ts              # Next.js 16 proxy (eski middleware)
```

## Design system

Bkz. `docs/DESIGN.md`. Özet:

- **Yüzey:** eggshell `#fdfcfc`, powder `#f5f3f1`, chalk `#e5e5e5`
- **Yazı:** obsidian `#111111`, gravel `#777169`
- **Fonksiyonel:** signal `#0447ff`, danger `#c93f3f`
- **Pet aksesuar:** paw `#f4a261`, clover `#6aa971`, blush `#f7c5c0`
- **Font:** Fraunces 300 (display), Inter 400/500 (body), Geist Mono (badge)
- **CTA:** siyah pill (`rounded-full`, `bg-primary`, `text-primary-foreground`)
- **Gölge yok**, sadece hairline `1px var(--color-chalk)` border

## Geliştirme prensipleri

- **RLS her zaman açık.** Supabase'de service_role asla client'a sızmaz.
- **Iyzico webhook'larında HMAC doğrula.**
- **`asChild` yok** — Base UI button `render` prop'u kullanır.
- **Mutation server action.** Form submit'lerde client → server action akışı.
- **Reduced motion respect.** Tüm animasyonlar `prefers-reduced-motion` ile bypass.
- Sözleşme imzalamadan, KYC onaylanmadan taşıyıcı teklif veremez.
