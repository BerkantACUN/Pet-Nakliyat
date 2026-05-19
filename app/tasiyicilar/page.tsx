import Link from "next/link";
import { ArrowRight, Star, Truck, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chip } from "@/components/marketing/Chip";

export const metadata = {
  title: "Doğrulanmış taşıyıcılar — Patiyolu",
  description:
    "Patiyolu'nun KYC'den geçmiş, sözleşme imzalamış taşıyıcılarının tamamı.",
};

const VEHICLE_LABEL: Record<string, string> = {
  car: "Otomobil",
  van: "Van",
  truck: "Kamyon",
};

interface TransporterRow {
  user_id: string;
  display_name: string;
  slug: string;
  bio: string | null;
  vehicle_type: string | null;
  service_cities: string[] | null;
  base_rate_per_km: number;
  min_charge: number;
  rating_avg: number | null;
  rating_count: number | null;
  completed_count: number | null;
  avatar_url: string | null;
  city: string | null;
}

export default async function TasiyicilarPage() {
  const supabase = await createClient();

  const { data: tps } = await supabase
    .from("transporter_profiles")
    .select(
      "user_id, display_name, slug, bio, vehicle_type, service_cities, base_rate_per_km, min_charge, rating_avg, rating_count, completed_count",
    )
    .eq("kyc_status", "approved")
    .not("contract_signature_id", "is", null)
    .order("rating_avg", { ascending: false, nullsFirst: false })
    .order("completed_count", { ascending: false, nullsFirst: false });

  const userIds = (tps ?? []).map((t) => t.user_id);
  const { data: profileRows } =
    userIds.length > 0
      ? await supabase
          .from("public_profiles")
          .select("id, avatar_url, city")
          .in("id", userIds)
      : { data: [] };

  const profileById = new Map(
    (profileRows ?? []).map((p) => [p.id, p] as const),
  );

  const list: TransporterRow[] = (tps ?? []).map((row) => {
    const profile = profileById.get(row.user_id);
    return {
      user_id: row.user_id,
      display_name: row.display_name,
      slug: row.slug,
      bio: row.bio,
      vehicle_type: row.vehicle_type,
      service_cities: row.service_cities,
      base_rate_per_km: row.base_rate_per_km,
      min_charge: row.min_charge,
      rating_avg: row.rating_avg,
      rating_count: row.rating_count,
      completed_count: row.completed_count,
      avatar_url: profile?.avatar_url ?? null,
      city: profile?.city ?? null,
    };
  });

  return (
    <MarketingShell>
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-8">
        <div className="max-w-2xl">
          <Chip className="bg-white">
            <ShieldCheck className="size-3.5" aria-hidden /> KYC + sözleşme onaylı
          </Chip>
          <h1 className="mt-4 font-display text-[40px] leading-tight tracking-tight sm:text-[52px]">
            Doğrulanmış taşıyıcılar
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-gravel">
            Kimliği, aracı ve ruhsatı incelenmiş, sözleşme imzalamış pet
            nakliyatçıları. Profil sayfasından deneyim, puan ve hizmet
            şehirlerine göz at.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((tp) => (
              <TransporterCard key={tp.user_id} tp={tp} />
            ))}
          </div>
        )}
      </section>
    </MarketingShell>
  );
}

function TransporterCard({ tp }: { tp: TransporterRow }) {
  const rating = tp.rating_avg ? Number(tp.rating_avg).toFixed(1) : null;
  const ratingCount = tp.rating_count ?? 0;
  const completedCount = tp.completed_count ?? 0;
  const cities = tp.service_cities ?? [];
  const visibleCities = cities.slice(0, 3);
  const extraCities = cities.length - visibleCities.length;

  return (
    <Link
      href={`/u/${tp.user_id}`}
      className="group flex flex-col gap-3 rounded-3xl border border-chalk bg-white p-5 transition hover:border-fog hover:shadow-[0_8px_28px_-22px_rgba(17,17,17,0.25)]"
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-14 shrink-0 border border-chalk">
          {tp.avatar_url ? (
            <AvatarImage src={tp.avatar_url} alt={tp.display_name} />
          ) : null}
          <AvatarFallback className="bg-paw/20 text-[16px] font-medium text-obsidian">
            {initials(tp.display_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-[19px] leading-tight">
              {tp.display_name}
            </h3>
            <ShieldCheck
              className="size-4 shrink-0 text-clover"
              aria-label="Doğrulanmış"
            />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-gravel">
            {tp.city ? <span>{tp.city}</span> : null}
            {tp.vehicle_type ? (
              <span className="inline-flex items-center gap-1">
                <Truck className="size-3" aria-hidden />
                {VEHICLE_LABEL[tp.vehicle_type] ?? tp.vehicle_type}
              </span>
            ) : null}
          </div>
        </div>
        {rating ? (
          <div className="shrink-0 rounded-full bg-eggshell px-3 py-1">
            <span className="inline-flex items-center gap-1 text-[13px] font-medium">
              <Star className="size-3.5 fill-paw text-paw" aria-hidden />
              {rating}
            </span>
            <span className="ml-1 text-[11px] text-gravel">({ratingCount})</span>
          </div>
        ) : (
          <div className="shrink-0 rounded-full bg-powder px-3 py-1 text-[11px] text-gravel">
            yeni
          </div>
        )}
      </div>

      {tp.bio ? (
        <p className="line-clamp-2 text-[13px] leading-6 text-gravel">
          {tp.bio}
        </p>
      ) : null}

      {visibleCities.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {visibleCities.map((c) => (
            <span
              key={c}
              className="rounded-full bg-powder px-2.5 py-0.5 text-[11px] text-foreground"
            >
              {c}
            </span>
          ))}
          {extraCities > 0 ? (
            <span className="rounded-full bg-powder/60 px-2.5 py-0.5 text-[11px] text-gravel">
              +{extraCities}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            başlangıç
          </div>
          <div className="font-display text-[18px] leading-none">
            {Number(tp.base_rate_per_km).toFixed(0)}{" "}
            <span className="text-[11px] font-normal text-gravel">₺/km</span>
          </div>
          <div className="mt-1 text-[10px] text-gravel">
            min. {Number(tp.min_charge).toFixed(0)}₺
            {completedCount > 0 ? ` · ${completedCount} taşıma` : ""}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[12px] text-gravel transition group-hover:text-obsidian">
          Profili gör <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-chalk bg-white px-6 py-16 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-powder text-2xl">
        🚐
      </div>
      <h2 className="mt-4 font-display text-[22px] leading-tight">
        Henüz doğrulanmış taşıyıcı yok
      </h2>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-gravel">
        Patiyolu yeni başlıyor. KYC süreçlerini tamamlayıp sözleşmesini imzalayan
        taşıyıcılar burada listelenecek.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          href="/tasiyici-ol"
          className="inline-flex items-center gap-1.5 rounded-pill bg-obsidian px-5 py-2.5 text-[13px] font-medium text-eggshell transition hover:bg-obsidian/85"
        >
          Taşıyıcı ol →
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-pill border border-chalk bg-white px-5 py-2.5 text-[13px] font-medium hover:bg-powder"
        >
          Anasayfa
        </Link>
      </div>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
