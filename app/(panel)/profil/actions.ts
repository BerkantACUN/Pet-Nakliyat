"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";

const profileSchema = z.object({
  fullName: z.string().min(3, "Ad-soyad en az 3 karakter").max(120),
  city: z.string().min(2, "Şehir en az 2 karakter").max(60),
  phone: z
    .string()
    .min(7, "Telefon en az 7 karakter")
    .max(20)
    .regex(/^[+0-9()\- ]+$/, "Geçersiz format"),
});

const transporterSchema = z.object({
  displayName: z.string().min(3).max(80),
  bio: z.string().max(500).optional().nullable(),
  companyName: z.string().max(120).optional().nullable(),
  vehicleType: z.enum(["car", "van", "truck"]).optional().nullable(),
  plate: z.string().max(20).optional().nullable(),
  serviceCities: z.string().max(400).optional().nullable(),
  baseRatePerKm: z.number().min(2).max(100),
  minCharge: z.number().min(100).max(5000),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type TransporterProfileInput = z.infer<typeof transporterSchema>;

function flattenZodError(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function updateProfileAction(
  input: ProfileInput,
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      city: parsed.data.city,
      phone: parsed.data.phone,
    })
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
  revalidatePath("/profil");
  revalidatePath("/panel");
  return { ok: true };
}

function slugify(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ğ/g, "g")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function enableCustomerAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: user.id, role: "customer" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profil");
  revalidatePath("/panel");
  revalidatePath("/musteri");
  return { ok: true };
}

export async function enableTransporterAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return { ok: false, error: "Profil bulunamadı" };

  await supabase
    .from("user_roles")
    .upsert({ user_id: user.id, role: "transporter" });

  // Profil yoksa varsayılan oluştur
  const baseSlug = slugify(profile.full_name);
  const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

  const { error } = await supabase
    .from("transporter_profiles")
    .upsert(
      {
        user_id: user.id,
        display_name: profile.full_name,
        slug,
        base_rate_per_km: 8,
        min_charge: 350,
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  if (error && error.code !== "23505") {
    return { ok: false, error: error.message };
  }

  // Daha önce sözleşme imzalanmışsa, contract_signatures tablosundan
  // backfill et — eski race condition'da link kaybolmuş olabilir.
  const { data: tpl } = await supabase
    .from("contract_templates")
    .select("id")
    .eq("audience", "transporter")
    .order("effective_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (tpl) {
    const { data: sig } = await supabase
      .from("contract_signatures")
      .select("id, signed_at")
      .eq("user_id", user.id)
      .eq("template_id", tpl.id)
      .maybeSingle();
    if (sig) {
      await supabase
        .from("transporter_profiles")
        .update({
          contract_signature_id: sig.id,
          contract_signed_at: sig.signed_at,
        })
        .eq("user_id", user.id);
    }
  }

  revalidatePath("/profil");
  revalidatePath("/panel");
  revalidatePath("/sozlesme");
  revalidatePath("/tasiyici/kyc");
  return { ok: true };
}

export async function updateTransporterProfileAction(
  input: TransporterProfileInput,
): Promise<ActionResult> {
  const parsed = transporterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const cities = (parsed.data.serviceCities ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("transporter_profiles")
    .update({
      display_name: parsed.data.displayName,
      bio: parsed.data.bio ?? null,
      company_name: parsed.data.companyName ?? null,
      vehicle_type: parsed.data.vehicleType ?? null,
      plate: parsed.data.plate ?? null,
      service_cities: cities,
      base_rate_per_km: parsed.data.baseRatePerKm,
      min_charge: parsed.data.minCharge,
    })
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/profil");
  return { ok: true };
}
