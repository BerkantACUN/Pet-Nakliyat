import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Chip } from "@/components/marketing/Chip";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("transporter_profiles")
    .select("display_name, bio")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return { title: "Taşıyıcı bulunamadı — Patiyolu" };
  return {
    title: `${data.display_name} — Patiyolu Taşıyıcısı`,
    description: data.bio ?? `${data.display_name} — doğrulanmış Patiyolu taşıyıcısı.`,
  };
}

const VEHICLE_LABEL: Record<string, string> = {
  car: "Otomobil",
  van: "Van",
  truck: "Kamyon",
};

export default async function PublicTransporterPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tp } = await supabase
    .from("transporter_profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!tp) notFound();

  const { data: ownerProfile } = await supabase
    .from("public_profiles")
    .select("full_name, avatar_url, city")
    .eq("id", tp.user_id)
    .maybeSingle();

  const initials = (tp.display_name ?? "P")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pt-10 pb-6">
        <div className="rounded-3xl border border-chalk bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-clover/15 font-display text-[22px] text-obsidian">
              {initials}
            </div>
            <div className="flex-1">
              <Chip className="mb-2 bg-clover/15">
                <span aria-hidden>🚐</span> Doğrulanmış taşıyıcı
              </Chip>
              <h1 className="font-display text-[32px] leading-tight">
                {tp.display_name}
              </h1>
              {tp.company_name ? (
                <p className="mt-0.5 text-[13px] text-gravel">
                  {tp.company_name}
                </p>
              ) : null}
              {ownerProfile?.city ? (
                <p className="mt-0.5 text-[12px] text-gravel">
                  📍 {ownerProfile.city}
                </p>
              ) : null}
            </div>
          </div>

          {tp.bio ? (
            <p className="mt-4 text-[14px] leading-7 text-gravel">{tp.bio}</p>
          ) : null}

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Stat
              label="Puan"
              value={
                tp.rating_count > 0
                  ? `${Number(tp.rating_avg).toFixed(1)}`
                  : "—"
              }
              hint={tp.rating_count > 0 ? `${tp.rating_count} oy` : "henüz yok"}
              icon={<Star className="size-3.5" />}
            />
            <Stat
              label="Tamamlanan"
              value={String(tp.completed_count)}
              hint="taşıma"
              icon={<Truck className="size-3.5" />}
            />
            <Stat
              label="Km ücreti"
              value={`${Number(tp.base_rate_per_km).toFixed(0)} ₺`}
              hint={`min ${Number(tp.min_charge).toFixed(0)} ₺`}
              icon={<span className="text-[11px]">₺</span>}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Araç">
            <p>
              {tp.vehicle_type ? VEHICLE_LABEL[tp.vehicle_type] : "Belirtilmedi"}
            </p>
            {tp.plate ? (
              <p className="font-mono text-[11px] uppercase tracking-wider text-gravel">
                {tp.plate}
              </p>
            ) : null}
          </InfoCard>
          <InfoCard title="Hizmet bölgeleri">
            {tp.service_cities.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {tp.service_cities.map((c) => (
                  <Chip key={c} className="bg-powder">
                    {c}
                  </Chip>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-gravel">Belirtilmedi</p>
            )}
          </InfoCard>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-[13px] text-gravel">
          Bu taşıyıcıdan teklif almak istiyorsan önce bir nakliyat ilanı oluştur.
        </p>
        <Button
          variant="pill"
          size="lg"
          className="mt-4"
          render={<Link href="/musteri/ilan-olustur" />}
        >
          İlan oluştur
        </Button>
      </section>
    </MarketingShell>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-chalk bg-powder/30 p-3 text-center">
      <p className="flex items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] text-gravel">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-display text-[22px] leading-tight">{value}</p>
      <p className="text-[10px] text-gravel">{hint}</p>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-chalk bg-white p-4">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
        {title}
      </h3>
      <div className="mt-2 text-[14px] text-obsidian">{children}</div>
    </div>
  );
}
