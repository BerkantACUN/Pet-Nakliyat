"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResult } from "@/app/(auth)/actions";

const bidSchema = z.object({
  listingId: z.string().uuid(),
  price: z
    .number({ message: "Fiyat gerekli" })
    .min(100, "En az 100 ₺")
    .max(50000, "Çok yüksek"),
  etaHours: z
    .number()
    .min(0.5, "En az 0.5 saat")
    .max(120, "120 saatten fazla olamaz")
    .optional(),
  message: z.string().max(500, "En fazla 500 karakter").optional(),
});

export type BidInput = z.infer<typeof bidSchema>;

function flattenZodError(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createBidAction(
  input: BidInput,
): Promise<ActionResult> {
  const parsed = bidSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenZodError(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  // Taşıyıcı profili + sözleşme + KYC kontrolü
  const { data: tp } = await supabase
    .from("transporter_profiles")
    .select("user_id, kyc_status, contract_signature_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!tp) {
    return {
      ok: false,
      error: "Önce taşıyıcı profilini oluşturmalısın",
    };
  }
  if (!tp.contract_signature_id) {
    return {
      ok: false,
      error: "Teklif vermek için önce taşıyıcı sözleşmesini imzala",
    };
  }
  // Dev modu: KYC pending iken de teklife izin veriyoruz.
  // Production: aşağıdaki kontrolü aç —
  // if (tp.kyc_status !== "approved") {
  //   return { ok: false, error: "KYC onayın bekliyor; onaylandıktan sonra teklif verebilirsin" };
  // }
  if (tp.kyc_status === "rejected") {
    return {
      ok: false,
      error: "KYC reddedildi. Belgelerini güncelleyip tekrar başvur.",
    };
  }

  const { error } = await supabase.from("bids").insert({
    listing_id: parsed.data.listingId,
    transporter_id: user.id,
    price: parsed.data.price,
    eta_hours: parsed.data.etaHours ?? null,
    message: parsed.data.message ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Bu ilana zaten teklif vermişsin" };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/tasiyici/ilanlar/${parsed.data.listingId}`);
  revalidatePath("/tasiyici/tekliflerim");
  revalidatePath(`/musteri/${parsed.data.listingId}`);
  return { ok: true };
}

export async function withdrawBidAction(
  bidId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { data: bid } = await supabase
    .from("bids")
    .select("transporter_id, listing_id, status")
    .eq("id", bidId)
    .maybeSingle();
  if (!bid || bid.transporter_id !== user.id) {
    return { ok: false, error: "Yetki yok" };
  }
  if (bid.status !== "pending") {
    return { ok: false, error: "Sadece bekleyen teklifler geri çekilebilir" };
  }

  const { error } = await supabase
    .from("bids")
    .update({ status: "withdrawn" })
    .eq("id", bidId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/tasiyici/tekliflerim");
  revalidatePath(`/tasiyici/ilanlar/${bid.listing_id}`);
  return { ok: true };
}
