"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";

const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(800).optional(),
});

export async function submitReviewAction(input: {
  bookingId: string;
  rating: number;
  comment?: string;
}): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { data: booking } = await supabase
    .from("bookings")
    .select("id,status,customer_id,transporter_id")
    .eq("id", parsed.data.bookingId)
    .maybeSingle();
  if (!booking) return { ok: false, error: "Booking bulunamadı" };
  if (booking.status !== "completed") {
    return { ok: false, error: "Sadece tamamlanmış rezervasyon değerlendirilebilir" };
  }
  if (booking.customer_id !== user.id && booking.transporter_id !== user.id) {
    return { ok: false, error: "Yetki yok" };
  }

  const targetId =
    user.id === booking.customer_id
      ? booking.transporter_id
      : booking.customer_id;

  const { error } = await supabase.from("reviews").insert({
    booking_id: booking.id,
    author_id: user.id,
    target_id: targetId,
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/musteri/booking/${booking.id}`);
  revalidatePath(`/tasiyici/booking/${booking.id}`);
  return { ok: true };
}
