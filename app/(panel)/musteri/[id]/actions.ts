"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LISTING_FEE_TRY, PLATFORM_COMMISSION } from "@/lib/pricing";
import type { ActionResult } from "@/app/(auth)/actions";

/**
 * İlanı yayınla.
 *
 * Iyzico entegrasyonu sonraki sprint'te. Şimdilik:
 *   - Iyzico anahtarları doluysa → checkout başlatılacak (TODO Sprint 3.5)
 *   - Anahtarlar yoksa → fee'yi atla, doğrudan yayınla (dev/demo modu)
 */
export async function publishListingAction(
  id: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  // İlan sahibi mi + draft mi?
  const { data: listing } = await supabase
    .from("listings")
    .select("id, status")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!listing) return { ok: false, error: "İlan bulunamadı" };
  if (listing.status !== "draft") {
    return { ok: false, error: "Sadece taslak ilanlar yayınlanabilir" };
  }

  const iyzicoConfigured =
    !!process.env.IYZICO_API_KEY && !!process.env.IYZICO_SECRET_KEY;

  if (iyzicoConfigured) {
    // TODO: Iyzico checkout başlat, başarılı webhook'tan sonra status='published'
    // Şu an demo: anahtarlar olsa bile fee'yi atla
  }

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("listings")
    .update({
      status: "published",
      published_at: nowIso,
      listing_fee_paid_at: nowIso,
      listing_fee_amount: LISTING_FEE_TRY,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/musteri/${id}`);
  revalidatePath("/musteri/ilanlarim");
  revalidatePath("/tasiyici/ilanlar");
  return { ok: true };
}

export async function acceptBidAction(
  bidId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  // Bid + listing'i doğrula
  const { data: bid } = await supabase
    .from("bids")
    .select("id, listing_id, transporter_id, status, price")
    .eq("id", bidId)
    .maybeSingle();
  if (!bid) return { ok: false, error: "Teklif bulunamadı" };

  const { data: listing } = await supabase
    .from("listings")
    .select("id, customer_id, status")
    .eq("id", bid.listing_id)
    .maybeSingle();
  if (!listing) return { ok: false, error: "İlan bulunamadı" };
  if (listing.customer_id !== user.id) {
    return { ok: false, error: "Yetki yok" };
  }
  if (listing.status !== "published") {
    return { ok: false, error: "Sadece yayında olan ilanların teklifi kabul edilebilir" };
  }
  if (bid.status !== "pending") {
    return { ok: false, error: "Bu teklif zaten işlem görmüş" };
  }

  // 1) Bid'leri güncelle
  const { error: bidErr } = await supabase
    .from("bids")
    .update({ status: "accepted" })
    .eq("id", bidId);
  if (bidErr) return { ok: false, error: bidErr.message };

  await supabase
    .from("bids")
    .update({ status: "rejected" })
    .eq("listing_id", bid.listing_id)
    .neq("id", bidId)
    .eq("status", "pending");

  await supabase
    .from("listings")
    .update({ status: "closed" })
    .eq("id", bid.listing_id);

  // 2) Booking oluştur (pending_payment)
  const agreedPrice = Number(bid.price);
  const platformFee =
    Math.round(agreedPrice * PLATFORM_COMMISSION * 100) / 100;

  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      listing_id: bid.listing_id,
      bid_id: bid.id,
      transporter_id: bid.transporter_id,
      customer_id: user.id,
      agreed_price: agreedPrice,
      platform_fee: platformFee,
      status: "pending_payment",
    })
    .select("id")
    .single();
  if (bookingErr || !booking) {
    return { ok: false, error: bookingErr?.message ?? "Booking oluşturulamadı" };
  }

  // 3) Konuşma yarat (varsa unique constraint'e takılır, onConflict ile do nothing)
  await supabase
    .from("conversations")
    .upsert(
      {
        listing_id: bid.listing_id,
        customer_id: user.id,
        transporter_id: bid.transporter_id,
        booking_id: booking.id,
      },
      { onConflict: "listing_id,customer_id,transporter_id" },
    );

  revalidatePath(`/musteri/${bid.listing_id}`);
  revalidatePath("/musteri/ilanlarim");
  revalidatePath("/tasiyici/tekliflerim");
  revalidatePath("/mesajlar");

  // Müşteriyi booking ödeme ekranına gönder
  redirect(`/musteri/booking/${booking.id}`);
}

export async function rejectBidAction(
  bidId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Oturum yok" };

  const { data: bid } = await supabase
    .from("bids")
    .select("id, listing_id, status")
    .eq("id", bidId)
    .maybeSingle();
  if (!bid) return { ok: false, error: "Teklif bulunamadı" };

  const { data: listing } = await supabase
    .from("listings")
    .select("customer_id")
    .eq("id", bid.listing_id)
    .maybeSingle();
  if (!listing || listing.customer_id !== user.id) {
    return { ok: false, error: "Yetki yok" };
  }

  const { error } = await supabase
    .from("bids")
    .update({ status: "rejected" })
    .eq("id", bidId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/musteri/${bid.listing_id}`);
  return { ok: true };
}
