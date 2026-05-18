"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/profile";
import type { ActionResult } from "./actions";

function flattenZodError(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function completeOnboardingAction(
  input: OnboardingInput,
): Promise<ActionResult> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }
  const { phone, city, defaultRole, marketingConsent } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const normalizedPhone = phone.startsWith("+90")
    ? phone
    : phone.startsWith("0")
      ? `+90${phone.slice(1)}`
      : `+90${phone}`;

  const nowIso = new Date().toISOString();
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Patiyolu kullanıcısı";

  // Email-confirmation-gated signup'ta profile.insert RLS'e takılıp atlanmış olabilir.
  // Upsert ile hem var olan satırı güncelliyoruz hem yoksa oluşturuyoruz.
  const { error: profileErr } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        phone: normalizedPhone,
        city,
        default_role: defaultRole,
        marketing_consent: marketingConsent,
        kvkk_consent_at: nowIso,
        onboarding_completed_at: nowIso,
      },
      { onConflict: "id" },
    );

  if (profileErr) {
    if (profileErr.code === "23505") {
      return {
        ok: false,
        fieldErrors: { phone: "Bu telefon başka bir hesapta kayıtlı" },
      };
    }
    return { ok: false, error: profileErr.message };
  }

  // Default customer rolü yoksa ekle (signup sırasında RLS atlamış olabilir)
  await supabase
    .from("user_roles")
    .upsert(
      { user_id: user.id, role: "customer" },
      { onConflict: "user_id,role" },
    );

  // Seçilen rol customer değilse onu da ekle
  if (defaultRole !== "customer") {
    await supabase
      .from("user_roles")
      .upsert(
        { user_id: user.id, role: defaultRole },
        { onConflict: "user_id,role" },
      );
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
