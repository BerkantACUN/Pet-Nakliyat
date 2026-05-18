"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/(auth)/actions";

async function getOwnedBooking(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum yok", supabase, user: null, booking: null };

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return { error: "Booking bulunamadı", supabase, user, booking: null };
  if (booking.customer_id !== user.id && booking.transporter_id !== user.id) {
    return { error: "Yetki yok", supabase, user, booking: null };
  }
  return { error: null, supabase, user, booking };
}

/**
 * Iyzico ödemesini simüle eder. Anahtarlar olduğunda gerçek Iyzico SDK ile değiştirilecek.
 * Dev mode: doğrudan başarılı say + payment kaydı ekle + booking accepted.
 */
export async function payBookingAction(
  bookingId: string,
): Promise<ActionResult> {
  const ctx = await getOwnedBooking(bookingId);
  if (ctx.error || !ctx.booking || !ctx.user) {
    return { ok: false, error: ctx.error ?? "Hata" };
  }
  const { user, booking } = ctx;
  if (user.id !== booking.customer_id) {
    return { ok: false, error: "Sadece müşteri ödeme yapabilir" };
  }
  if (booking.status !== "pending_payment") {
    return { ok: false, error: "Ödeme bu booking için artık geçerli değil" };
  }

  const iyzicoConfigured =
    !!process.env.IYZICO_API_KEY && !!process.env.IYZICO_SECRET_KEY;

  // Gerçek Iyzico: checkout başlat, webhook 'accepted' yapsın.
  // Dev: doğrudan accepted.
  const nowIso = new Date().toISOString();
  const ref = iyzicoConfigured ? null : `DEV-${Date.now()}`;

  const service = createServiceRoleClient();

  const { error: updateErr } = await service
    .from("bookings")
    .update({
      status: "accepted",
      paid_at: nowIso,
      iyzico_payment_ref: ref,
    })
    .eq("id", booking.id);
  if (updateErr) return { ok: false, error: updateErr.message };

  await service.from("payments").insert({
    user_id: booking.customer_id,
    type: "booking_full",
    amount: Number(booking.agreed_price),
    related_booking: booking.id,
    related_listing: booking.listing_id,
    status: "success",
    provider_ref: ref,
    provider: iyzicoConfigured ? "iyzico" : "stub",
  });

  revalidatePath(`/musteri/booking/${booking.id}`);
  revalidatePath(`/tasiyici/booking/${booking.id}`);
  revalidatePath("/panel");
  return { ok: true };
}

/**
 * Taşıyıcı: yola çıkdığını işaretler.
 */
export async function markEnRouteAction(bookingId: string): Promise<ActionResult> {
  const ctx = await getOwnedBooking(bookingId);
  if (ctx.error || !ctx.booking || !ctx.user) {
    return { ok: false, error: ctx.error ?? "Hata" };
  }
  if (ctx.user.id !== ctx.booking.transporter_id) {
    return { ok: false, error: "Sadece taşıyıcı bu adımı geçebilir" };
  }
  if (ctx.booking.status !== "accepted") {
    return { ok: false, error: "Önce ödeme tamamlanmalı" };
  }

  const { error } = await ctx.supabase
    .from("bookings")
    .update({
      status: "en_route",
      started_at: new Date().toISOString(),
    })
    .eq("id", bookingId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/musteri/booking/${bookingId}`);
  revalidatePath(`/tasiyici/booking/${bookingId}`);
  return { ok: true };
}

/**
 * Taşıyıcı: teslim ettiğini işaretler.
 */
export async function markDeliveredAction(bookingId: string): Promise<ActionResult> {
  const ctx = await getOwnedBooking(bookingId);
  if (ctx.error || !ctx.booking || !ctx.user) {
    return { ok: false, error: ctx.error ?? "Hata" };
  }
  if (ctx.user.id !== ctx.booking.transporter_id) {
    return { ok: false, error: "Sadece taşıyıcı bu adımı geçebilir" };
  }
  if (ctx.booking.status !== "en_route") {
    return { ok: false, error: "Önce yola çıkmalısın" };
  }

  const { error } = await ctx.supabase
    .from("bookings")
    .update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
    })
    .eq("id", bookingId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/musteri/booking/${bookingId}`);
  revalidatePath(`/tasiyici/booking/${bookingId}`);
  return { ok: true };
}

/**
 * Müşteri: teslim aldığını onaylar → completed.
 */
export async function markCompletedAction(bookingId: string): Promise<ActionResult> {
  const ctx = await getOwnedBooking(bookingId);
  if (ctx.error || !ctx.booking || !ctx.user) {
    return { ok: false, error: ctx.error ?? "Hata" };
  }
  if (ctx.user.id !== ctx.booking.customer_id) {
    return { ok: false, error: "Sadece müşteri tamamlanmayı onaylayabilir" };
  }
  if (ctx.booking.status !== "delivered") {
    return { ok: false, error: "Önce taşıyıcı teslim ettim demeli" };
  }

  const { error } = await ctx.supabase
    .from("bookings")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", bookingId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/musteri/booking/${bookingId}`);
  revalidatePath(`/tasiyici/booking/${bookingId}`);
  return { ok: true };
}

export async function cancelBookingAction(
  bookingId: string,
  reason: string,
): Promise<ActionResult> {
  const ctx = await getOwnedBooking(bookingId);
  if (ctx.error || !ctx.booking || !ctx.user) {
    return { ok: false, error: ctx.error ?? "Hata" };
  }
  if (!["pending_payment", "accepted"].includes(ctx.booking.status)) {
    return { ok: false, error: "Bu aşamada iptal edilemez" };
  }
  const { error } = await ctx.supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason.slice(0, 500),
    })
    .eq("id", bookingId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/musteri/booking/${bookingId}`);
  revalidatePath(`/tasiyici/booking/${bookingId}`);
  return { ok: true };
}
