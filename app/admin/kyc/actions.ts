"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";

const reviewSchema = z.object({
  docId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  note: z.string().max(500).optional(),
});

export type ReviewKycInput = z.infer<typeof reviewSchema>;

export async function reviewKycAction(input: ReviewKycInput): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Geçersiz" };

  const supabase = createServiceRoleClient();
  const { data: doc, error: dErr } = await supabase
    .from("kyc_documents")
    .update({
      status: parsed.data.decision,
      reviewer_note: parsed.data.note ?? null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.docId)
    .select("user_id")
    .single();

  if (dErr || !doc) return { ok: false, error: dErr?.message ?? "Bulunamadı" };

  // Kullanıcının tüm 4 belgesinin durumuna göre transporter_profiles.kyc_status'unu güncelle
  const { data: allDocs } = await supabase
    .from("kyc_documents")
    .select("doc_type, status")
    .eq("user_id", doc.user_id);

  if (allDocs) {
    const approved = allDocs.filter((d) => d.status === "approved").length;
    const rejected = allDocs.some((d) => d.status === "rejected");
    let nextStatus: "pending" | "approved" | "rejected" = "pending";
    if (rejected) nextStatus = "rejected";
    else if (approved === 4) nextStatus = "approved";

    await supabase
      .from("transporter_profiles")
      .update({ kyc_status: nextStatus })
      .eq("user_id", doc.user_id);
  }

  revalidatePath("/admin/kyc");
  revalidatePath("/admin");
  revalidatePath("/tasiyici/kyc");
  return { ok: true };
}
