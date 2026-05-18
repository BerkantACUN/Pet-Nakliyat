"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  signUpSchema,
  signInSchema,
  resetPasswordRequestSchema,
  updatePasswordSchema,
  type SignUpInput,
  type SignInInput,
  type ResetPasswordRequestInput,
  type UpdatePasswordInput,
} from "@/lib/validations/auth";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function flattenZodError(err: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function signUpAction(input: SignUpInput): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }
  const { email, password, fullName, marketingConsent } = parsed.data;

  const supabase = await createClient();
  const reqHeaders = await headers();
  const origin =
    reqHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { full_name: fullName },
    },
  });

  if (error) return { ok: false, error: error.message };
  if (!data.user) return { ok: false, error: "Hesap oluşturulamadı" };

  // profil satırı oluştur (KVKK timestamp ile birlikte)
  const nowIso = new Date().toISOString();
  const { error: profileErr } = await supabase.from("profiles").insert({
    id: data.user.id,
    full_name: fullName,
    kvkk_consent_at: nowIso,
    marketing_consent: marketingConsent,
    default_role: "customer",
  });

  // default customer rolünü ekle
  if (!profileErr) {
    await supabase.from("user_roles").insert({
      user_id: data.user.id,
      role: "customer",
    });
  }

  return { ok: true };
}

export async function signInAction(input: SignInInput): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const code = (error as { code?: string }).code ?? "";
    const msg = error.message ?? "";

    if (code === "email_not_confirmed" || msg.toLowerCase().includes("not confirmed")) {
      return {
        ok: false,
        error:
          "E-postanı henüz onaylamamışsın. Gelen kutuna (ve spam klasörüne) Patiyolu/Supabase'den gelen onay linkine tıkla, sonra tekrar dene.",
      };
    }
    if (code === "invalid_credentials") {
      return { ok: false, error: "E-posta veya şifre hatalı" };
    }
    if (code === "user_not_found") {
      return { ok: false, error: "Bu e-postayla kayıtlı hesap bulunamadı" };
    }
    if (code === "over_request_rate_limit" || msg.toLowerCase().includes("rate")) {
      return {
        ok: false,
        error: "Çok fazla deneme oldu. Birkaç dakika sonra tekrar dene.",
      };
    }
    return { ok: false, error: msg || "Giriş yapılamadı" };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signInWithGoogleAction(): Promise<void> {
  const supabase = await createClient();
  const reqHeaders = await headers();
  const origin =
    reqHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/giris?err=oauth");
  }
  redirect(data.url);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(
  input: ResetPasswordRequestInput,
): Promise<ActionResult> {
  const parsed = resetPasswordRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }

  const supabase = await createClient();
  const reqHeaders = await headers();
  const origin =
    reqHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/auth/callback?next=/sifre-yenile` },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePasswordAction(
  input: UpdatePasswordInput,
): Promise<ActionResult> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
