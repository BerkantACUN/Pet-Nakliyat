"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/Chip";
import {
  acceptBidAction,
  rejectBidAction,
} from "@/app/(panel)/musteri/[id]/actions";
import { formatPriceTRY } from "@/lib/utils";
import type { Bid } from "@/lib/supabase/types";

export interface BidWithTransporter extends Bid {
  transporter: {
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
  } | null;
  transporter_profile: {
    display_name: string;
    rating_avg: number;
    rating_count: number;
    completed_count: number;
  } | null;
}

interface BidListProps {
  bids: BidWithTransporter[];
  listingClosed: boolean;
}

export function BidList({ bids, listingClosed }: BidListProps) {
  if (bids.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-chalk bg-powder p-6 text-center">
        <div className="text-3xl" aria-hidden>📬</div>
        <p className="mt-3 text-[13px] text-gravel">
          Henüz teklif gelmedi. Taşıyıcılar yakında geliyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids.map((b) => (
        <BidCard key={b.id} bid={b} listingClosed={listingClosed} />
      ))}
    </div>
  );
}

function BidCard({
  bid,
  listingClosed,
}: {
  bid: BidWithTransporter;
  listingClosed: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function accept() {
    if (!confirm("Bu teklifi kabul ediyor musun? Diğer teklifler reddedilecek."))
      return;
    startTransition(async () => {
      const result = await acceptBidAction(bid.id);
      if (!result.ok) {
        toast.error(result.error ?? "Kabul edilemedi");
        return;
      }
      toast.success("Teklif kabul edildi 🎉");
    });
  }

  function reject() {
    startTransition(async () => {
      const result = await rejectBidAction(bid.id);
      if (!result.ok) {
        toast.error(result.error ?? "Reddedilemedi");
        return;
      }
      toast.success("Teklif reddedildi");
    });
  }

  const name =
    bid.transporter_profile?.display_name ??
    bid.transporter?.full_name ??
    "Taşıyıcı";

  return (
    <article className="rounded-3xl border border-chalk bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-[17px] leading-tight">{name}</span>
            <Chip className="bg-eggshell text-[11px]">
              <Star className="size-3 fill-paw text-paw" />{" "}
              {(bid.transporter_profile?.rating_avg ?? 0).toFixed(1)} (
              {bid.transporter_profile?.rating_count ?? 0})
            </Chip>
          </div>
          <div className="mt-1 text-[11px] text-gravel">
            {bid.transporter?.city ?? "—"} ·{" "}
            {bid.transporter_profile?.completed_count ?? 0} tamamlanmış nakliyat
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-[22px] leading-none">
            {formatPriceTRY(bid.price)}
          </div>
          {bid.eta_hours ? (
            <div className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-gravel">
              <Clock className="size-3" /> {bid.eta_hours} sa
            </div>
          ) : null}
        </div>
      </div>

      {bid.message ? (
        <p className="mt-3 rounded-2xl bg-powder p-3 text-[12px] leading-5 text-gravel">
          {bid.message}
        </p>
      ) : null}

      {bid.status === "accepted" ? (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-success/10 px-3 py-2 text-[12px] text-success">
          <Check className="size-3.5" /> Kabul edildi
        </div>
      ) : bid.status === "rejected" ? (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-fog/10 px-3 py-2 text-[12px] text-gravel">
          <X className="size-3.5" /> Reddedildi
        </div>
      ) : listingClosed ? (
        <div className="mt-3 text-center text-[11px] text-gravel">
          İlan kapalı, işlem yapılamaz
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="pill-outline"
            size="sm"
            className="flex-1"
            disabled={pending}
            onClick={reject}
          >
            Reddet
          </Button>
          <Button
            type="button"
            variant="pill"
            size="sm"
            className="flex-1"
            disabled={pending}
            onClick={accept}
          >
            Kabul et
          </Button>
        </div>
      )}
    </article>
  );
}
