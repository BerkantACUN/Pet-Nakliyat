"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";
import type { KycDocType } from "@/lib/supabase/types";

const DOC_TYPES: KycDocType[] = [
  "id_front",
  "id_back",
  "plate_photo",
  "vehicle_registration",
];

const recordSchema = z.object({
  docType: z.enum(DOC_TYPES as [KycDocType, ...KycDocType[]]),
  storagePath: z.string().min(5).max(512),
});

const deleteSchema = z.object({
  docType: z.enum(DOC_TYPES as [KycDocType, ...KycDocType[]]),
});

export type RecordKycDocInput = z.infer<typeof recordSchema>;
export type DeleteKycDocInput = z.infer<typeof deleteSchema>;

export async function recordKycDocAction(
  input: RecordKycDocInput,
): Promise<ActionResult> {
  const parsed = recordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Geçersiz belge bilgisi" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  // storage_path kullanıcının kendi klasörüne ait olmalı (RLS de zorlar)
  if (!parsed.data.storagePath.startsWith(`${user.id}/`)) {
    return { ok: false, error: "Geçersiz storage yolu" };
  }

  // Upsert: aynı doc_type varsa storage_path'i güncelle + status'u tekrar pending'e al
  const { error } = await supabase
    .from("kyc_documents")
    .upsert(
      {
        user_id: user.id,
        doc_type: parsed.data.docType,
        storage_path: parsed.data.storagePath,
        status: "pending",
        reviewer_note: null,
        reviewed_by: null,
        reviewed_at: null,
      },
      { onConflict: "user_id,doc_type" },
    );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/tasiyici/kyc");
  return { ok: true };
}

export async function deleteKycDocAction(
  input: DeleteKycDocInput,
): Promise<ActionResult> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Geçersiz" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { data: doc } = await supabase
    .from("kyc_documents")
    .select("storage_path, status")
    .eq("user_id", user.id)
    .eq("doc_type", parsed.data.docType)
    .maybeSingle();

  if (!doc) return { ok: false, error: "Belge bulunamadı" };
  if (doc.status !== "pending") {
    return { ok: false, error: "Onaylanmış / reddedilmiş belge silinemez" };
  }

  // Önce DB kaydını, sonra storage objesini sil
  const { error: dbErr } = await supabase
    .from("kyc_documents")
    .delete()
    .eq("user_id", user.id)
    .eq("doc_type", parsed.data.docType);
  if (dbErr) return { ok: false, error: dbErr.message };

  await supabase.storage.from("kyc").remove([doc.storage_path]);

  revalidatePath("/tasiyici/kyc");
  return { ok: true };
}

export async function getSignedKycUrlAction(
  storagePath: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };
  if (!storagePath.startsWith(`${user.id}/`)) {
    return { ok: false, error: "Yetki yok" };
  }

  const { data, error } = await supabase.storage
    .from("kyc")
    .createSignedUrl(storagePath, 300); // 5 dk
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Önizleme alınamadı" };
  }
  return { ok: true, url: data.signedUrl };
}
