import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth";
import { Chip } from "@/components/marketing/Chip";
import { formatPriceRange, formatDistanceKm } from "@/lib/utils";
import type { Listing } from "@/lib/supabase/types";

export const metadata = { title: "Açık ilanlar · Patiyolu" };

const URGENCY_META: Record<
  Listing["urgency"],
  { label: string; emoji: string; tint: string }
> = {
  standard: { label: "Standart", emoji: "🐾", tint: "var(--color-fog)" },
  express: { label: "Express", emoji: "⚡", tint: "var(--color-paw)" },
  sameday: { label: "Aynı gün", emoji: "🚀", tint: "var(--color-ember)" },
};

export default async function TasiyiciIlanlarPage() {
  await requireOnboardedUser();
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "published")
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .limit(50);

  const list = (listings ?? []) as Listing[];

  return (
    <div className="space-y-5">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          taşıyıcı paneli
        </span>
        <h1 className="font-display text-[28px] leading-tight">
          Açık ilanlar
        </h1>
        <p className="mt-1 text-[13px] text-gravel">
          Yayında olan ilanlardan birini seç, teklif at.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-chalk bg-powder p-6 text-center">
          <div className="text-3xl" aria-hidden>📭</div>
          <p className="mt-3 text-[13px] text-gravel">
            Şu an açık ilan yok. Birazdan tekrar bak.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((l) => {
            const urg = URGENCY_META[l.urgency];
            return (
              <Link
                key={l.id}
                href={`/tasiyici/ilanlar/${l.id}`}
                className="group block rounded-3xl border border-chalk bg-white p-4 transition hover:bg-powder"
              >
                <div className="flex items-start justify-between gap-3">
                  <Chip className="bg-eggshell">
                    <span aria-hidden>{urg.emoji}</span> {urg.label}
                  </Chip>
                  {l.urgency !== "standard" ? (
                    <Zap
                      className="size-4"
                      style={{ color: urg.tint }}
                      aria-hidden
                    />
                  ) : null}
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
                  <div>
                    <div className="text-[14px]">
                      <span className="text-gravel">
                        {l.pickup_city ?? "—"}
                      </span>
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

                <div className="mt-3 flex justify-end">
                  <span className="inline-flex items-center gap-1 text-[12px] text-gravel transition group-hover:text-obsidian">
                    Detayı gör <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
