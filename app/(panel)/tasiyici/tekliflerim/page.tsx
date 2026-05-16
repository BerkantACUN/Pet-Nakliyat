import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { Chip } from "@/components/marketing/Chip";
import { formatPriceTRY, formatDistanceKm } from "@/lib/utils";
import type { Bid, Listing, BidStatus } from "@/lib/supabase/types";

export const metadata = { title: "Tekliflerim · Patiyolu" };

const BID_LABEL: Record<BidStatus, string> = {
  pending: "Bekliyor",
  accepted: "Kabul edildi",
  rejected: "Reddedildi",
  withdrawn: "Geri çekildi",
};

const BID_DOT: Record<BidStatus, string> = {
  pending: "var(--color-paw)",
  accepted: "var(--color-success)",
  rejected: "var(--color-danger)",
  withdrawn: "var(--color-fog)",
};

export default async function TekliflerimPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const { data: bids } = await supabase
    .from("bids")
    .select("*")
    .eq("transporter_id", user.id)
    .order("created_at", { ascending: false });

  const bidList = (bids ?? []) as Bid[];
  const listingIds = Array.from(new Set(bidList.map((b) => b.listing_id)));

  let listings: Listing[] = [];
  if (listingIds.length > 0) {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .in("id", listingIds);
    listings = (data ?? []) as Listing[];
  }

  const rows = bidList.map((b) => ({
    bid: b,
    listing: listings.find((l) => l.id === b.listing_id) ?? null,
  }));

  return (
    <div className="space-y-5">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          taşıyıcı paneli
        </span>
        <h1 className="font-display text-[28px] leading-tight">Tekliflerim</h1>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-chalk bg-powder p-6 text-center">
          <div className="text-3xl" aria-hidden>📨</div>
          <p className="mt-3 text-[13px] text-gravel">
            Henüz teklif atmadın.
          </p>
          <Link
            href="/tasiyici/ilanlar"
            className="mt-3 inline-block text-[13px] underline decoration-chalk underline-offset-2 hover:decoration-obsidian"
          >
            Açık ilanları gör →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(({ bid, listing }) => (
            <Link
              key={bid.id}
              href={`/tasiyici/ilanlar/${bid.listing_id}`}
              className="group block rounded-3xl border border-chalk bg-white p-4 transition hover:bg-powder"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ background: BID_DOT[bid.status] }}
                    aria-hidden
                  />
                  <Chip className="bg-eggshell">{BID_LABEL[bid.status]}</Chip>
                </div>
                <ArrowRight className="size-4 text-gravel transition group-hover:translate-x-0.5 group-hover:text-obsidian" />
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
                <div>
                  <div className="text-[14px]">
                    {listing ? (
                      <>
                        <span className="text-gravel">
                          {listing.pickup_city ?? "—"}
                        </span>
                        <span className="mx-2 text-gravel">→</span>
                        <span>{listing.dropoff_city ?? "—"}</span>
                      </>
                    ) : (
                      "İlan bulunamadı"
                    )}
                  </div>
                  {listing ? (
                    <div className="mt-0.5 text-[11px] text-gravel">
                      {formatDistanceKm(listing.distance_km)} ·{" "}
                      {listing.scheduled_at
                        ? new Date(listing.scheduled_at).toLocaleDateString(
                            "tr-TR",
                            { day: "numeric", month: "long" },
                          )
                        : "tarih yok"}
                    </div>
                  ) : null}
                </div>
                <div className="text-right">
                  <div className="font-display text-[18px] leading-none">
                    {formatPriceTRY(bid.price)}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
                    teklifin
                  </div>
                </div>
              </div>

              {bid.message ? (
                <p className="mt-3 line-clamp-2 text-[12px] text-gravel">
                  &ldquo;{bid.message}&rdquo;
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
