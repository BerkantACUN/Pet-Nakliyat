import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { BookingTimeline } from "@/components/booking/BookingTimeline";
import { BookingActions } from "@/components/booking/BookingActions";
import { ReviewForm } from "@/components/booking/ReviewForm";
import { formatPriceTRY, formatDistanceKm } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Rezervasyon — Patiyolu" };

export default async function CustomerBookingPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!booking) notFound();

  if (booking.customer_id !== user.id) {
    if (booking.transporter_id === user.id) {
      redirect(`/tasiyici/booking/${booking.id}`);
    }
    notFound();
  }

  const [
    { data: listing },
    { data: transporter },
    { data: conv },
    { data: existingReview },
  ] = await Promise.all([
      supabase
        .from("listings")
        .select(
          "pickup_address,dropoff_address,pickup_city,dropoff_city,distance_km",
        )
        .eq("id", booking.listing_id)
        .maybeSingle(),
      supabase
        .from("transporter_profiles")
        .select("display_name,slug,rating_avg,rating_count")
        .eq("user_id", booking.transporter_id)
        .maybeSingle(),
      supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", booking.listing_id)
        .eq("customer_id", booking.customer_id)
        .eq("transporter_id", booking.transporter_id)
        .maybeSingle(),
      supabase
        .from("reviews")
        .select("id,rating,comment")
        .eq("booking_id", booking.id)
        .eq("author_id", user.id)
        .maybeSingle(),
    ]);

  return (
    <div className="space-y-5">
      <Link
        href="/musteri/ilanlarim"
        className="inline-flex items-center gap-1 text-[12px] text-gravel hover:text-obsidian"
      >
        <ArrowLeft className="size-3.5" /> İlanlarım
      </Link>

      <header className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          Rezervasyon
        </span>
        <h1 className="font-display text-[28px] leading-tight">
          {listing?.pickup_city ?? "Alış"} → {listing?.dropoff_city ?? "Varış"}
        </h1>
        <div className="text-[13px] text-gravel">
          {listing ? formatDistanceKm(Number(listing.distance_km)) : ""}
        </div>
      </header>

      {transporter ? (
        <section className="rounded-3xl border border-chalk bg-white p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            taşıyıcın
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div>
              <Link
                href={`/tasiyicilar/${transporter.slug}`}
                className="font-display text-[18px] underline-offset-4 hover:underline"
              >
                {transporter.display_name}
              </Link>
              <div className="text-[12px] text-gravel">
                {transporter.rating_count > 0
                  ? `★ ${Number(transporter.rating_avg).toFixed(1)} · ${transporter.rating_count} değerlendirme`
                  : "Henüz değerlendirme yok"}
              </div>
            </div>
            {conv ? (
              <Button
                variant="pill-outline"
                size="sm"
                render={<Link href={`/mesajlar/${conv.id}`} />}
              >
                <MessageCircle className="size-3.5" />
                Mesaj
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-chalk bg-white p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          durum
        </div>
        <div className="mt-3">
          <BookingTimeline status={booking.status} />
        </div>
      </section>

      <section className="rounded-3xl border border-chalk bg-white p-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-4 text-gravel" />
          <div className="space-y-2">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
                alış
              </div>
              <div className="text-[13px]">{listing?.pickup_address}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
                varış
              </div>
              <div className="text-[13px]">{listing?.dropoff_address}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-chalk bg-eggshell p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          anlaşılan ücret
        </div>
        <div className="mt-1 font-display text-[32px] leading-none">
          {formatPriceTRY(Number(booking.agreed_price))}
        </div>
        <div className="mt-2 text-[11px] text-gravel">
          Platform komisyonu: {formatPriceTRY(Number(booking.platform_fee))}
        </div>
      </section>

      <BookingActions
        bookingId={booking.id}
        status={booking.status}
        role="customer"
        agreedPriceLabel={formatPriceTRY(Number(booking.agreed_price))}
      />

      {booking.status === "completed" ? (
        existingReview ? (
          <div className="rounded-3xl border border-chalk bg-white p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
              senin değerlendirmen
            </div>
            <div className="mt-2 text-paw">
              {"★".repeat(existingReview.rating)}
              {"☆".repeat(5 - existingReview.rating)}
            </div>
            {existingReview.comment ? (
              <p className="mt-2 text-[13px] text-gravel">
                “{existingReview.comment}”
              </p>
            ) : null}
          </div>
        ) : (
          <ReviewForm bookingId={booking.id} />
        )
      ) : null}
    </div>
  );
}
