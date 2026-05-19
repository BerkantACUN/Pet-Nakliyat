# Supabase Email Templates — Patiyolu

Bu klasördeki HTML dosyaları Supabase Dashboard'a yapıştırılacak email template'leri.

## Nasıl uygulanır?

1. **Supabase Dashboard** → Project → **Authentication** → **Email Templates**
2. Aşağıdaki listeye göre her template'i editle ve karşılığını yapıştır:

| Supabase template | Dosya |
|---|---|
| **Confirm signup** | `confirm-signup.html` |
| **Magic Link** | `magic-link.html` |
| **Reset Password** | `recovery.html` |
| **Change Email Address** | `confirm-signup.html`'i kopyalayıp başlığı "E-posta değişikliği" yap |
| **Invite user** | (kullanmıyoruz) |

3. Subject alanlarını da güncelle:

| Template | Subject |
|---|---|
| Confirm signup | `Patiyolu — Hesabını aktifleştir 🐾` |
| Magic Link | `Patiyolu — Tek tıkla giriş` |
| Reset Password | `Patiyolu — Şifre sıfırlama` |
| Change Email Address | `Patiyolu — E-posta değişikliği onayı` |

4. **Site URL** ayarı:
   - Authentication → URL Configuration → **Site URL**: `https://pet-nakliyat.vercel.app`
   - **Redirect URLs** listesine ekle: `https://pet-nakliyat.vercel.app/auth/callback`

## Variable referansı

Supabase template'lerinde kullanılan değişkenler:

- `{{ .ConfirmationURL }}` — Aktivasyon/onay/sıfırlama linki (callback'e yönlendirilir)
- `{{ .Email }}` — Kullanıcının e-posta adresi
- `{{ .SiteURL }}` — Site ana URL'i
- `{{ .Token }}` — OTP kodu (kullanmıyoruz, linki tercih ediyoruz)

## Akış (Confirm signup örneği)

1. Kullanıcı `/kayit`'tan kayıt olur
2. Supabase otomatik onay maili gönderir (yukarıdaki template)
3. Kullanıcı maildeki butona tıklar → `https://pet-nakliyat.vercel.app/auth/callback?code=…&type=signup`
4. `app/auth/callback/route.ts` `type=signup` görür → oturumu kapatır, `/giris?confirmed=1`'e yönlendirir
5. Giriş sayfasında yeşil "E-postan onaylandı 🎉" mesajı görünür
6. Kullanıcı şifresiyle giriş yapar → `/onboarding` (yeni kullanıcı) veya `/panel`
