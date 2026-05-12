import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/Chip";
import { formatPriceRange, formatDistanceKm } from "@/lib/utils";
import type { Listing } from "@/lib/supabase/types";

export const metadata = { title: "İlanlarım · Patiyolu" };

const STATUS_LABEL: Record<Listing["status"], string> = {
  draft: "Taslak",
  published: "Yayında",
  closed: "Kapandı",
  expired: "Süresi doldu",
  cancelled: "İptal",
};

const STATUS_DOT: Record<Listing["status"], string> = {
  draft: "var(--color-fog)",
  published: "var(--color-clover)",
  closed: "var(--color-paw)",
  expired: "var(--color-slate)",
  cancelled: "var(--color-danger)",
};

export default async function IlanlarimPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  const list = (listings ?? []) as Listing[];

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            müşteri paneli
          </span>
          <h1 className="font-display text-[28px] leading-tight">İlanlarım</h1>
        </div>
        <Button
          variant="pill"
          size="sm"
          render={<Link href="/musteri/ilan-olustur" />}
        >
          <Plus className="size-3.5" /> Yeni
        </Button>
      </header>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-chalk bg-powder p-6 text-center">
          <div className="text-3xl" aria-hidden>📍</div>
          <p className="mt-3 text-[14px] text-gravel">
            Henüz ilan açmadın. Pati yolculuğun nereden başlayacak?
          </p>
          <Button
            variant="pill"
            size="lg"
            className="mt-4"
            render={<Link href="/musteri/ilan-olustur" />}
          >
            <Plus className="size-3.5" /> İlk ilanını aç
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((l) => (
            <Link
              key={l.id}
              href={`/musteri/${l.id}`}
              className="group block rounded-3xl border border-chalk bg-white p-4 transition hover:bg-powder"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ background: STATUS_DOT[l.status] }}
                    aria-hidden
                  />
                  <Chip className="bg-eggshell">
                    {STATUS_LABEL[l.status]}
                  </Chip>
                </div>
                <ArrowRight className="size-4 text-gravel transition group-hover:translate-x-0.5 group-hover:text-obsidian" />
              </div>

              <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
                <div>
                  <div className="text-[13px]">
                    <span className="text-gravel">{l.pickup_city ?? "—"}</span>
                    <span className="mx-2 text-gravel">→</span>
                    <span>{l.dropoff_city ?? "—"}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-gravel">
                    {formatDistanceKm(l.distance_km)} ·{" "}
                    {l.scheduled_at
                      ? new Date(l.scheduled_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                        })
                      : "tarih belirsiz"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-[18px] leading-none">
                    {formatPriceRange(l.est_price_min, l.est_price_max)}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
                    tahmini
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
