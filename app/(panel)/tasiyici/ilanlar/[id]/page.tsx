import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/Chip";
import { BidSheet } from "@/components/listings/BidSheet";
import {
  formatPriceRange,
  formatDistanceKm,
  formatPriceTRY,
} from "@/lib/utils";
import type { Listing, Pet, Bid } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const URGENCY_LABEL: Record<Listing["urgency"], string> = {
  standard: "Standart",
  express: "Express (24 saat)",
  sameday: "Aynı gün",
};

export default async function TasiyiciIlanDetayPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (!listing) notFound();

  // Pet bilgisi
  let pet: Pet | null = null;
  if (listing.pet_id) {
    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("id", listing.pet_id)
      .maybeSingle();
    pet = data as Pet | null;
  }

  // Bu taşıyıcının bu ilana var olan teklifi
  const { data: myBid } = await supabase
    .from("bids")
    .select("*")
    .eq("listing_id", id)
    .eq("transporter_id", user.id)
    .maybeSingle();

  const isOwnListing = listing.customer_id === user.id;
  const existingBid = myBid as Bid | null;

  return (
    <div className="space-y-5">
      <Link
        href="/tasiyici/ilanlar"
        className="inline-flex items-center gap-1 text-[12px] text-gravel hover:text-obsidian"
      >
        <ArrowLeft className="size-3.5" /> Açık ilanlar
      </Link>

      <header className="space-y-2">
        <Chip className="bg-eggshell">{URGENCY_LABEL[listing.urgency]}</Chip>
        <h1 className="font-display text-[26px] leading-tight">
          {listing.pickup_city ?? "Alış"} → {listing.dropoff_city ?? "Varış"}
        </h1>
        <div className="text-[13px] text-gravel">
          {formatDistanceKm(listing.distance_km)} ·{" "}
          {listing.scheduled_at
            ? new Date(listing.scheduled_at).toLocaleString("tr-TR", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "tarih belirsiz"}
        </div>
      </header>

      {pet ? (
        <div className="flex items-center gap-3 rounded-3xl border border-chalk bg-white p-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-paw/20 text-2xl">
            {speciesEmoji(pet.species)}
          </div>
          <div className="flex-1">
            <div className="font-display text-[17px] leading-tight">
              {pet.name}
            </div>
            <div className="text-[12px] text-gravel">
              {[pet.breed, pet.weight_kg ? `${pet.weight_kg} kg` : null]
                .filter(Boolean)
                .join(" · ") || "Detay yok"}
              {pet.special_notes ? (
                <span className="mt-1 block text-gravel">
                  Not: {pet.special_notes}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-3xl border border-chalk bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex flex-col items-center">
            <span className="size-2 rounded-full bg-signal" />
            <span className="my-1 h-10 w-px bg-chalk" />
            <span className="size-2 rounded-full bg-paw" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
                alış
              </div>
              <div className="text-[13px]">{listing.pickup_address}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
                varış
              </div>
              <div className="text-[13px]">{listing.dropoff_address}</div>
            </div>
          </div>
        </div>
      </section>

      {listing.notes ? (
        <section className="rounded-3xl border border-chalk bg-white p-5">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 size-4 text-gravel" />
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
                müşteri notu
              </div>
              <div className="mt-1 text-[13px] leading-6">{listing.notes}</div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-chalk bg-eggshell p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          tahmini fiyat aralığı
        </div>
        <div className="mt-1 font-display text-[32px] leading-none">
          {formatPriceRange(listing.est_price_min, listing.est_price_max)}
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-gravel">
          <Clock className="size-3" /> Komisyon %10
        </div>
      </section>

      {/* Bid CTA */}
      {isOwnListing ? (
        <div className="rounded-3xl border border-chalk bg-powder p-4 text-center text-[12px] text-gravel">
          Bu senin ilanın. Kendi ilanına teklif atamazsın.
        </div>
      ) : existingBid ? (
        <div className="rounded-3xl border border-chalk bg-white p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            teklifin
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-[28px] leading-none">
              {formatPriceTRY(existingBid.price)}
            </span>
            <Chip className="bg-eggshell">{existingBid.status}</Chip>
          </div>
          {existingBid.message ? (
            <p className="mt-2 text-[12px] text-gravel">{existingBid.message}</p>
          ) : null}
        </div>
      ) : (
        <BidSheet
          listingId={listing.id}
          estMin={listing.est_price_min}
          estMax={listing.est_price_max}
          trigger={
            <Button variant="pill" size="lg" className="w-full">
              Teklif at →
            </Button>
          }
        />
      )}
    </div>
  );
}

function speciesEmoji(s: Pet["species"]): string {
  return { dog: "🐶", cat: "🐱", bird: "🐦", rabbit: "🐰", other: "🐾" }[s];
}
