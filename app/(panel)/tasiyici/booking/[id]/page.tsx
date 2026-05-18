import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { BookingTimeline } from "@/components/booking/BookingTimeline";
import { BookingActions } from "@/components/booking/BookingActions";
import { formatPriceTRY, formatDistanceKm } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Rezervasyon — Patiyolu" };

export default async function TransporterBookingPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!booking) notFound();

  if (booking.transporter_id !== user.id) {
    if (booking.customer_id === user.id) {
      redirect(`/musteri/booking/${booking.id}`);
    }
    notFound();
  }

  const [{ data: listing }, { data: customer }, { data: conv }] =
    await Promise.all([
      supabase
        .from("listings")
        .select(
          "pickup_address,dropoff_address,pickup_city,dropoff_city,distance_km,notes",
        )
        .eq("id", booking.listing_id)
        .maybeSingle(),
      supabase
        .from("public_profiles")
        .select("full_name,city")
        .eq("id", booking.customer_id)
        .maybeSingle(),
      supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", booking.listing_id)
        .eq("customer_id", booking.customer_id)
        .eq("transporter_id", booking.transporter_id)
        .maybeSingle(),
    ]);

  const transporterShare =
    Number(booking.agreed_price) - Number(booking.platform_fee);

  return (
    <div className="space-y-5">
      <Link
        href="/tasiyici/tekliflerim"
        className="inline-flex items-center gap-1 text-[12px] text-gravel hover:text-obsidian"
      >
        <ArrowLeft className="size-3.5" /> Tekliflerim
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

      {customer ? (
        <section className="rounded-3xl border border-chalk bg-white p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            müşterin
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div>
              <div className="font-display text-[18px]">
                {customer.full_name}
              </div>
              {customer.city ? (
                <div className="text-[12px] text-gravel">{customer.city}</div>
              ) : null}
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
            {listing?.notes ? (
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
                  müşteri notu
                </div>
                <div className="text-[13px]">{listing.notes}</div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-chalk bg-eggshell p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          alacağın tutar
        </div>
        <div className="mt-1 font-display text-[32px] leading-none">
          {formatPriceTRY(transporterShare)}
        </div>
        <div className="mt-2 text-[11px] text-gravel">
          Anlaşılan: {formatPriceTRY(Number(booking.agreed_price))} · Platform
          komisyonu: {formatPriceTRY(Number(booking.platform_fee))}
        </div>
      </section>

      <BookingActions
        bookingId={booking.id}
        status={booking.status}
        role="transporter"
        agreedPriceLabel={formatPriceTRY(Number(booking.agreed_price))}
      />
    </div>
  );
}
