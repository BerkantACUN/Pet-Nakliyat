"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Mevcut şifre gerekli"),
    newPassword: z
      .string()
      .min(8, "En az 8 karakter")
      .max(72, "En fazla 72 karakter"),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    path: ["newPassword"],
    message: "Yeni şifre mevcut şifreyle aynı olamaz",
  });

const emailSchema = z.object({
  email: z.string().email("Geçerli bir e-posta gir"),
});

const phoneSchema = z.object({
  phone: z
    .string()
    .transform((v) => v.replace(/[\s\-().]/g, ""))
    .pipe(
      z
        .string()
        .regex(
          /^(\+90)?5\d{9}$/,
          "Geçerli bir Türkiye cep telefonu gir (5XX XXX XX XX)",
        ),
    ),
});

function flattenZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = i.path.join(".");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZod(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { ok: false, error: "Oturum yok" };

  // Mevcut şifreyi doğrula
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (signInErr) {
    return {
      ok: false,
      fieldErrors: { currentPassword: "Mevcut şifre yanlış" },
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function changeEmailAction(input: {
  email: string;
}): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZod(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  if (user.email === parsed.data.email) {
    return {
      ok: false,
      fieldErrors: { email: "Yeni e-posta mevcutla aynı" },
    };
  }

  const { error } = await supabase.auth.updateUser({
    email: parsed.data.email,
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function changePhoneAction(input: {
  phone: string;
}): Promise<ActionResult> {
  const parsed = phoneSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZod(parsed.error) };
  }

  const normalized = parsed.data.phone.startsWith("+90")
    ? parsed.data.phone
    : parsed.data.phone.startsWith("0")
      ? `+90${parsed.data.phone.slice(1)}`
      : `+90${parsed.data.phone}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { error } = await supabase
    .from("profiles")
    .update({ phone: normalized })
    .eq("id", user.id);
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        fieldErrors: { phone: "Bu telefon başka bir hesapta kayıtlı" },
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/ayarlar");
  revalidatePath("/profil");
  return { ok: true };
}

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
