import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/Chip";
import { PublishButton } from "@/components/listings/PublishButton";
import { BidList } from "@/components/listings/BidList";
import {
  formatPriceRange,
  formatDistanceKm,
  formatPriceTRY,
} from "@/lib/utils";
import { LISTING_FEE_TRY } from "@/lib/pricing";
import type { Listing, Pet } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABEL: Record<Listing["status"], string> = {
  draft: "Taslak",
  published: "Yayında",
  closed: "Kapandı",
  expired: "Süresi doldu",
  cancelled: "İptal",
};

const URGENCY_LABEL: Record<Listing["urgency"], string> = {
  standard: "Standart",
  express: "Express (24 saat)",
  sameday: "Aynı gün",
};

export default async function IlanDetayPage({ params }: PageProps) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!listing) notFound();

  let pet: Pet | null = null;
  if (listing.pet_id) {
    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("id", listing.pet_id)
      .maybeSingle();
    pet = data as Pet | null;
  }

  return (
    <div className="space-y-5">
      <Link
        href="/musteri/ilanlarim"
        className="inline-flex items-center gap-1 text-[12px] text-gravel hover:text-obsidian"
      >
        <ArrowLeft className="size-3.5" /> İlanlarım
      </Link>

      <header className="space-y-2">
        <Chip className="bg-eggshell">{STATUS_LABEL[listing.status]}</Chip>
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

      {/* Pet bilgisi */}
      {pet ? (
        <div className="flex items-center gap-3 rounded-3xl border border-chalk bg-white p-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-paw/20 text-2xl">
            {speciesEmoji(pet.species)}
          </div>
          <div>
            <div className="font-display text-[17px] leading-tight">{pet.name}</div>
            <div className="text-[12px] text-gravel">
              {[pet.breed, pet.weight_kg ? `${pet.weight_kg} kg` : null]
                .filter(Boolean)
                .join(" · ") || "Detay yok"}
            </div>
          </div>
        </div>
      ) : null}

      {/* Adresler */}
      <section className="space-y-3 rounded-3xl border border-chalk bg-white p-5">
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

      {/* Detaylar */}
      <section className="space-y-3 rounded-3xl border border-chalk bg-white p-5">
        <DetailRow
          icon={<Clock className="size-4 text-gravel" />}
          label="Acillik"
          value={URGENCY_LABEL[listing.urgency]}
        />
        <DetailRow
          icon={<MapPin className="size-4 text-gravel" />}
          label="Mesafe"
          value={formatDistanceKm(listing.distance_km)}
        />
        {listing.notes ? (
          <DetailRow
            icon={<FileText className="size-4 text-gravel" />}
            label="Not"
            value={listing.notes}
          />
        ) : null}
      </section>

      {/* Fiyat */}
      <section className="rounded-3xl border border-chalk bg-eggshell p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          tahmini fiyat
        </div>
        <div className="mt-1 font-display text-[32px] leading-none">
          {formatPriceRange(listing.est_price_min, listing.est_price_max)}
        </div>
        <div className="mt-2 text-[11px] text-gravel">
          Yayın ücreti {formatPriceTRY(LISTING_FEE_TRY)} · komisyon %10
        </div>
      </section>

      {/* Aksiyon */}
      {listing.status === "draft" ? (
        <div className="rounded-3xl border border-chalk bg-white p-5">
          <h2 className="font-display text-[18px] leading-tight">Yayınla</h2>
          <p className="mt-1 text-[13px] text-gravel">
            {formatPriceTRY(LISTING_FEE_TRY)} yayın ücretiyle ilanını teklif
            almaya aç.
          </p>
          <div className="mt-4">
            <PublishButton listingId={listing.id} />
          </div>
          <p className="mt-2 text-center text-[11px] text-gravel">
            Iyzico bağlanana kadar dev modunda ücretsiz.
          </p>
        </div>
      ) : null}

      {/* Teklifler */}
      {listing.status === "published" || listing.status === "closed" ? (
        <BidsSection
          listingId={listing.id}
          listingClosed={listing.status === "closed"}
        />
      ) : null}
    </div>
  );
}

async function BidsSection({
  listingId,
  listingClosed,
}: {
  listingId: string;
  listingClosed: boolean;
}) {
  const supabase = await createClient();
  const { data: bids } = await supabase
    .from("bids")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  const enriched = await Promise.all(
    (bids ?? []).map(async (b) => {
      const [{ data: tProfile }, { data: tBase }] = await Promise.all([
        supabase
          .from("transporter_profiles")
          .select("display_name,rating_avg,rating_count,completed_count")
          .eq("user_id", b.transporter_id)
          .maybeSingle(),
        supabase
          .from("public_profiles")
          .select("full_name,avatar_url,city")
          .eq("id", b.transporter_id)
          .maybeSingle(),
      ]);
      return {
        ...b,
        transporter: tBase,
        transporter_profile: tProfile,
      };
    }),
  );

  return (
    <section className="space-y-3">
      <h2 className="font-display text-[18px] leading-tight">
        {listingClosed ? "Teklifler" : "Gelen teklifler"}
      </h2>
      <BidList bids={enriched} listingClosed={listingClosed} />
    </section>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div className="flex-1">
        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
          {label}
        </div>
        <div className="text-[13px]">{value}</div>
      </div>
    </div>
  );
}

function speciesEmoji(s: Pet["species"]): string {
  return { dog: "🐶", cat: "🐱", bird: "🐦", rabbit: "🐰", other: "🐾" }[s];
}
