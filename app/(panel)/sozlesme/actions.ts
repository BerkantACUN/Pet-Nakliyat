"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";

const signSchema = z.object({
  templateId: z.string().uuid(),
  fullName: z
    .string()
    .min(5, "Ad-soyad en az 5 karakter olmalı")
    .max(120, "Çok uzun")
    .regex(/\s/, "Ad ve soyadını birlikte yaz"),
  consent: z.boolean().refine((v) => v === true, {
    message: "Sözleşmeyi okuyup onaylamalısın",
  }),
});

export type SignContractInput = z.infer<typeof signSchema>;

function flattenZodError(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function buildSignatureHash(parts: {
  userId: string;
  templateId: string;
  signedAt: string;
  fullName: string;
  ip: string;
  userAgent: string;
}): string {
  const payload = [
    parts.userId,
    parts.templateId,
    parts.signedAt,
    parts.fullName,
    parts.ip,
    parts.userAgent,
  ].join("|");
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function signContractAction(
  input: SignContractInput,
): Promise<ActionResult> {
  const parsed = signSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  // Template hâlâ geçerli mi?
  const { data: template } = await supabase
    .from("contract_templates")
    .select("id, audience")
    .eq("id", parsed.data.templateId)
    .maybeSingle();
  if (!template) return { ok: false, error: "Sözleşme bulunamadı" };

  // Zaten imzalı mı?
  const { data: existing } = await supabase
    .from("contract_signatures")
    .select("id")
    .eq("user_id", user.id)
    .eq("template_id", template.id)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "Bu sözleşmeyi zaten imzaladın" };
  }

  const hdr = await headers();
  const ip =
    hdr.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdr.get("x-real-ip") ??
    "0.0.0.0";
  const userAgent = hdr.get("user-agent") ?? "unknown";
  const signedAt = new Date().toISOString();

  const signatureHash = buildSignatureHash({
    userId: user.id,
    templateId: template.id,
    signedAt,
    fullName: parsed.data.fullName,
    ip,
    userAgent,
  });

  const { data: inserted, error } = await supabase
    .from("contract_signatures")
    .insert({
      user_id: user.id,
      template_id: template.id,
      signed_full_name: parsed.data.fullName,
      signed_ip: ip,
      signed_user_agent: userAgent,
      signature_hash: signatureHash,
      signed_at: signedAt,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "İmza kaydedilemedi" };
  }

  // Taşıyıcı sözleşmesi imzalandığında transporter_profile'a yansıt
  if (template.audience === "transporter") {
    await supabase
      .from("transporter_profiles")
      .update({
        contract_signature_id: inserted.id,
        contract_signed_at: signedAt,
      })
      .eq("user_id", user.id);
  }

  revalidatePath("/sozlesme");
  revalidatePath("/tasiyici/kyc");
  revalidatePath("/panel");
  return { ok: true };
}
