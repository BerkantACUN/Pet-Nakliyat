import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase OAuth + e-posta onayı callback'i.
 * `?code=…` PKCE değişimini yapar.
 *
 * Yönlendirme mantığı:
 *  - type=signup (e-posta onayı): /giris?confirmed=1 — kullanıcı şifreyle giriş yapsın
 *  - type=recovery (şifre sıfırlama): /sifre-yenile
 *  - type=email_change: /ayarlar?email_changed=1
 *  - OAuth (Google vs): profil yoksa /onboarding, varsa /panel
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(new URL("/giris?err=oauth", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/giris?err=oauth&reason=${encodeURIComponent(error.message)}`, request.url),
    );
  }

  // Tip bazlı yönlendirme
  if (type === "recovery") {
    return NextResponse.redirect(new URL("/sifre-yenile", request.url));
  }
  if (type === "email_change") {
    // Oturumu kapat ki tekrar girişle değişikliği teyit etsin
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/giris?email_changed=1", request.url),
    );
  }
  if (type === "signup") {
    // Yeni kayıt onayı — oturumu kapat, /giris?confirmed=1'e yolla
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/giris?confirmed=1", request.url));
  }

  // OAuth (Google vs) veya next param
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const fullName =
        (user.user_metadata?.full_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "Kullanıcı";
      await supabase.from("profiles").insert({
        id: user.id,
        full_name: fullName,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        kvkk_consent_at: new Date().toISOString(),
        default_role: "customer",
      });
      await supabase.from("user_roles").insert({
        user_id: user.id,
        role: "customer",
      });
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (!profile.onboarding_completed_at) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return NextResponse.redirect(new URL(next ?? "/panel", request.url));
}
