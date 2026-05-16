"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";

export async function toggleMarketingConsentAction(
  enabled: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { error } = await supabase
    .from("profiles")
    .update({ marketing_consent: enabled })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/ayarlar");
  return { ok: true };
}

export async function setDefaultRoleAction(
  role: "customer" | "transporter",
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  // Sadece sahip olduğu rolü default yapabilsin
  if (role === "transporter") {
    const { data: hasRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "transporter")
      .maybeSingle();
    if (!hasRole) {
      return { ok: false, error: "Önce taşıyıcı modunu aç" };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ default_role: role })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/ayarlar");
  revalidatePath("/panel");
  return { ok: true };
}
