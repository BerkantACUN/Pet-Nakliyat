# Patiyolu Design System

> Temel: **ElevenLabs editorial disiplini** (eggshell zemin, monokrom yazı,
> hairline border, pill CTA). Üzerine **pet aksesuar** (paw amber, clover
> green, blush rose) ekledik. Sıcaklığı renk değil **animasyon + illüstrasyon +
> yazı** taşıyor.

## 1. Renk paleti

| İsim | Hex | Token | Kullanım |
|---|---|---|---|
| Eggshell | `#fdfcfc` | `--color-eggshell` | Sayfa zemini |
| Powder | `#f5f3f1` | `--color-powder` | Hover, section vurgu, müted accent |
| Chalk | `#e5e5e5` | `--color-chalk` | **Tek border rengi**, divider, input border |
| Obsidian | `#111111` | `--color-obsidian` | Birincil metin, primary CTA bg |
| Cinder | `#575734` | `--color-cinder` | Orta ton |
| Gravel | `#777169` | `--color-gravel` | İkincil metin, badge yazı |
| Slate | `#a59f97` | `--color-slate` | Üçüncül metin, ikon stroke |
| Fog | `#b1b0b0` | `--color-fog` | Disabled, placeholder, logo grayscale |
| Signal | `#0447ff` | `--color-signal` | Focus ring, link, çubuk |
| Danger | `#c93f3f` | `--color-danger` | Destruktif aksiyon, hata |
| Success | `#2f8a4e` | `--color-success` | Tamamlandı, başarı |
| **Paw** | `#f4a261` | `--color-paw` | Taşıyıcı tier dot, sıcak aksent |
| **Clover** | `#6aa971` | `--color-clover` | Bakıcı tier dot (Faz 2) |
| **Blush** | `#f7c5c0` | `--color-blush` | Premium, sevimli vurgu |
| Ember | `#ff4704` | `--color-ember` | Express/urgent vurgu |

Renk kullanım kuralı:

- **Pet aksesuarı asla bütün bir bileşeni boyamaz** — sadece 8–16px dot, badge
  veya küçük avatar.
- Buton/zemin renkleri hep obsidian + eggshell + powder + chalk.

shadcn semantik değişkenleri bu paletten besleniyor:
- `--primary` = obsidian (CTA siyah)
- `--background` = eggshell, `--foreground` = obsidian
- `--muted` = powder, `--muted-foreground` = gravel
- `--border` = `--input` = chalk
- `--ring` = signal

## 2. Tipografi

| Rol | Font | Weight | Boyut | Tracking |
|---|---|---|---|---|
| Hero / Display | Fraunces | 300 | clamp(44px, 7vw, 80px) | -0.025em |
| Heading | Fraunces | 300 | 32 / 36px | -0.025em |
| Subheading | Fraunces / Inter | 500 | 20 / 24px | normal |
| Body | Inter | 400 | 16px | 0.01em |
| Body small | Inter | 400 | 14px | 0.01em |
| UI / Button | Inter | 500 | 14px | 0.01em |
| Badge / Caption | Geist Mono | 400 | 10–11px UPPERCASE | 0.05em |

`.font-display`, `.font-mono` yardımcı sınıfları globals.css'te.

## 3. Spacing & radius

- 4px tabanlı (8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96 / 120)
- Bölüm boşluğu: `--space-section: clamp(48px, 5vw + 24px, 120px)`

Radius:
- `rounded-pill` (9999px) → CTA, badge
- `rounded-xl` (16px) → card
- `rounded-lg` (12px) → input, secondary button
- `rounded-sm` (6px) → small accent

## 4. Gölge

Yalnızca hairline. Asla "elevation depth" kullanma.

- `--shadow-hairline: 0 0 0 1px var(--color-chalk)`
- `--shadow-card: 0 1px 2px rgba(17,17,17,0.04), 0 0 0 1px var(--color-chalk)`
- `--shadow-focus: 0 0 0 2px rgba(4,71,255,0.35)`

## 5. Hareket

- Easing: `var(--ease-out-soft)` = `cubic-bezier(0.22, 1, 0.36, 1)`
- Durations: fast 160ms, normal 280ms, slow 480ms
- Stagger list: 40ms aralık, 280ms item duration
- `prefers-reduced-motion: reduce` → tüm animasyonlar 0.01ms

Components:
- `<PageTransition>` — route geçişi, AnimatePresence + 6px translateY + 0.28s fade
- `<FadeUp>` — scroll-trigger, 12px translateY + 0.48s
- `<StaggerList>` + `<StaggerItem>` — liste için
- `<LottiePawLoader>` — yürüyen patik loader (şimdilik CSS fallback)

## 6. Buton

```tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

<Button variant="pill" size="lg" render={<Link href="/kayit" />}>
  Üye ol
</Button>

<Button variant="pill-outline" size="lg">İptal</Button>
```

Varyantlar:
- `pill` — primary CTA (obsidian bg, eggshell text, full radius)
- `pill-outline` — secondary (white bg, chalk border)
- `pill-ghost` — tertiary (sadece text + hover bg)
- `default` / `outline` / `secondary` / `ghost` / `destructive` / `link` — shadcn standart

`asChild` yok — Base UI button `render` prop'u kullanır:
```tsx
<Button render={<Link href="..." />}>...</Button>
```

## 7. Marka

- Marka adı: **patiyolu** (lowercase, font-display)
- Logo işareti: 5 daire patik (Navbar içinde inline SVG, `PawMark`)
- Tagline TR: "Tüylü dostların güvenli bir yolda."

## 8. Erişilebilirlik

- Focus halkası her zaman görünür (signal blue 2px, outline-offset 2px)
- Form label association (htmlFor)
- Min hedef alanı 44×44px (size="lg" pill butonlar)
- Renk kontrastı WCAG AA (obsidian on eggshell = 19:1, gravel on eggshell = 4.8:1)
- `<html lang="tr">`, anlamlı alt metinler
