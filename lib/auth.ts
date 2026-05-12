import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, AppRole } from "@/lib/supabase/types";

export interface AuthedUser {
  id: string;
  email: string | null;
  profile: Profile | null;
  roles: AppRole[];
}

/**
 * Mevcut oturumdaki kullanıcıyı + profili + rollerini döndürür.
 * Oturum yoksa null.
 */
export async function getUser(): Promise<AuthedUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: rolesData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  return {
    id: user.id,
    email: user.email ?? null,
    profile,
    roles: (rolesData ?? []).map((r) => r.role as AppRole),
  };
}

/**
 * Korunan sayfalar için. Oturum yoksa /giris'e yönlendirir.
 */
export async function requireUser(): Promise<AuthedUser> {
  const user = await getUser();
  if (!user) redirect("/giris");
  return user;
}

/**
 * Profil tamamlanmadıysa /onboarding'e yönlendirir.
 */
export async function requireOnboardedUser(): Promise<AuthedUser> {
  const user = await requireUser();
  if (!user.profile || !user.profile.onboarding_completed_at) {
    redirect("/onboarding");
  }
  return user;
}

export function hasRole(user: AuthedUser, role: AppRole): boolean {
  return user.roles.includes(role);
}
