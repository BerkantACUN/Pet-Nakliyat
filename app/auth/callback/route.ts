import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase OAuth + e-posta onayı callback'i.
 * `?code=…` PKCE değişimini yapar, sonra ?next varsa oraya yönlendirir,
 * yoksa varsayılan olarak /panel'e gönderir.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/panel";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // OAuth ile gelen kullanıcı: profil yoksa /onboarding'e at,
      // varsa next'e.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, onboarding_completed_at, kvkk_consent_at")
          .eq("id", user.id)
          .maybeSingle();

        // İlk Google girişinde profil yoksa: minimal kayıt + onboarding'e yönlendir
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

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Hata: girişe geri yolla
  return NextResponse.redirect(new URL("/giris?err=oauth", request.url));
}
