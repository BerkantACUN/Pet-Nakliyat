import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  Truck,
  Inbox,
  Package,
  PawPrint,
} from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/Chip";

export const metadata = { title: "Taşıyıcı paneli · Patiyolu" };
export const dynamic = "force-dynamic";

export default async function TasiyiciDashboardPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const [
    { data: tp },
    { count: openListings },
    { data: myBids, count: bidCount },
    { data: activeBookings, count: bookingCount },
  ] = await Promise.all([
    supabase
      .from("transporter_profiles")
      .select(
        "contract_signature_id, kyc_status, rating_avg, rating_count, completed_count, service_cities",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("bids")
      .select("id, status, price, listing_id", { count: "exact" })
      .eq("transporter_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select("id, status, agreed_price, listing_id", { count: "exact" })
      .eq("transporter_id", user.id)
      .in("status", ["accepted", "en_route", "delivered"])
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const contractSigned = !!tp?.contract_signature_id;
  const kycApproved = tp?.kyc_status === "approved";
  const setupStep: "contract" | "kyc" | "ready" = !contractSigned
    ? "contract"
    : !kycApproved
      ? "kyc"
      : "ready";

  const isAlsoCustomer = user.roles.includes("customer");
  const pendingBids = (myBids ?? []).filter((b) => b.status === "pending").length;
  const acceptedBids = (myBids ?? []).filter((b) => b.status === "accepted").length;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          {greeting()} —
        </span>
        <h1 className="font-display text-[28px] leading-tight">
          Selam {firstName(user.profile!.full_name)} 🚐
        </h1>
        <p className="text-[14px] text-gravel">
          {setupStep === "ready"
            ? "Bugün hangi tüylü dostu evine götürüyorsun?"
            : "Birkaç adım kaldı, sonra teklif vermeye başlayabilirsin."}
        </p>
      </header>

      {setupStep !== "ready" ? (
        <section
          className="rounded-3xl border p-5"
          style={{
            borderColor: "var(--color-chalk)",
            background:
              setupStep === "contract"
                ? "color-mix(in oklch, var(--color-paw) 12%, white)"
                : "color-mix(in oklch, var(--color-signal) 8%, white)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="grid size-10 shrink-0 place-items-center rounded-2xl"
              style={{
                background:
                  setupStep === "contract"
                    ? "color-mix(in oklch, var(--color-paw) 25%, white)"
                    : "color-mix(in oklch, var(--color-signal) 20%, white)",
              }}
            >
              {setupStep === "contract" ? (
                <FileText className="size-5" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
                Taşıyıcı kurulumu — {setupStep === "contract" ? "1/2" : "2/2"}
              </p>
              <h2 className="mt-0.5 font-display text-[20px] leading-tight">
                {setupStep === "contract"
                  ? "Sözleşmeni imzala 📜"
                  : tp?.kyc_status === "rejected"
                    ? "KYC reddedildi, yeniden yükle"
                    : "Kimlik & araç doğrulaması"}
              </h2>
              <p className="mt-1 text-[13px] text-gravel">
                {setupStep === "contract"
                  ? "Teklif verebilmen için taşıyıcı sözleşmesini elektronik olarak imzalaman gerekiyor."
                  : tp?.kyc_status === "pending"
                    ? "Belgelerini yükle, inceleme ekibimiz 1-3 iş günü içinde dönsün."
                    : "Belgelerini yeniden yükle ve onay bekle."}
              </p>
              <Button
                variant="pill"
                size="sm"
                className="mt-3"
                render={
                  <Link
                    href={setupStep === "contract" ? "/sozlesme" : "/tasiyici/kyc"}
                  />
                }
              >
                {setupStep === "contract" ? "Sözleşmeye git" : "Belgeleri yükle"}
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-2 gap-3">
          <StatCard
            label="Açık ilanlar"
            value={openListings ?? 0}
            icon={<Package className="size-4" />}
            href="/tasiyici/ilanlar"
          />
          <StatCard
            label="Tekliflerim"
            value={bidCount ?? 0}
            icon={<Inbox className="size-4" />}
            href="/tasiyici/tekliflerim"
            highlight={acceptedBids > 0}
          />
          <StatCard
            label="Aktif booking"
            value={bookingCount ?? 0}
            icon={<Truck className="size-4" />}
            href="/tasiyici/tekliflerim"
            highlight={(bookingCount ?? 0) > 0}
          />
          <StatCard
            label="Tamamlanan"
            value={tp?.completed_count ?? 0}
            icon={<ShieldCheck className="size-4" />}
            href="/tasiyici/tekliflerim"
          />
        </section>
      )}

      {setupStep === "ready" ? (
        <section className="grid gap-3">
          <ActionCard
            href="/tasiyici/ilanlar"
            emoji="🔎"
            accent="var(--color-clover)"
            title="İlan akışı"
            body={`${openListings ?? 0} açık ilan · teklif at`}
          />
          {pendingBids > 0 ? (
            <ActionCard
              href="/tasiyici/tekliflerim"
              emoji="✉️"
              accent="var(--color-signal)"
              title="Bekleyen tekliflerin"
              body={`${pendingBids} teklif yanıt bekliyor`}
            />
          ) : null}
          {acceptedBids > 0 ? (
            <ActionCard
              href="/tasiyici/tekliflerim"
              emoji="✅"
              accent="var(--color-paw)"
              title="Kabul edilen teklifler"
              body={`${acceptedBids} teklif booking'e dönüştü`}
            />
          ) : null}
        </section>
      ) : null}

      {tp && setupStep === "ready" ? (
        <section className="rounded-3xl border border-chalk bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[18px]">Profilin</h2>
            <Link
              href="/profil"
              className="text-[12px] text-signal hover:underline"
            >
              Düzenle
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip className="bg-powder">
              ⭐ {(tp.rating_avg ?? 0).toFixed(1)} ({tp.rating_count ?? 0})
            </Chip>
            {tp.service_cities && tp.service_cities.length > 0 ? (
              <Chip className="bg-powder">
                📍 {tp.service_cities.slice(0, 2).join(", ")}
                {tp.service_cities.length > 2
                  ? ` +${tp.service_cities.length - 2}`
                  : ""}
              </Chip>
            ) : null}
            <Chip className="bg-powder">✅ KYC onaylı</Chip>
          </div>
        </section>
      ) : null}

      {!isAlsoCustomer ? (
        <section className="rounded-3xl border border-chalk bg-white p-5">
          <div className="flex items-center gap-2">
            <PawPrint className="size-4 text-paw" />
            <h2 className="font-display text-[18px]">Sen de pet sahibi misin?</h2>
          </div>
          <p className="mt-1 text-[13px] text-gravel">
            Müşteri rolü ekle, kendi petini de taşıtabilirsin.
          </p>
          <Button
            variant="pill-outline"
            size="sm"
            className="mt-3"
            render={<Link href="/profil" />}
          >
            Müşteri rolü ekle
          </Button>
        </section>
      ) : null}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  highlight?: boolean;
}

function StatCard({ label, value, icon, href, highlight }: StatCardProps) {
  return (
    <Link
      href={href}
      className={`group rounded-3xl border bg-white p-4 transition hover:bg-powder ${
        highlight ? "border-paw" : "border-chalk"
      }`}
    >
      <div className="flex items-center justify-between text-gravel">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
          {label}
        </span>
        {icon}
      </div>
      <div className="mt-1 font-display text-[26px] leading-none">{value}</div>
    </Link>
  );
}

interface ActionCardProps {
  href: string;
  emoji: string;
  accent: string;
  title: string;
  body: string;
}

function ActionCard({ href, emoji, accent, title, body }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-chalk bg-white p-4 transition hover:bg-powder"
    >
      <div
        className="grid size-12 shrink-0 place-items-center rounded-2xl text-2xl"
        style={{ background: `${accent}1f` }}
      >
        {emoji}
      </div>
      <div className="flex-1">
        <div className="font-display text-[17px] leading-tight">{title}</div>
        <div className="text-[12px] text-gravel">{body}</div>
      </div>
      <ArrowRight className="size-4 text-gravel transition group-hover:translate-x-0.5 group-hover:text-obsidian" />
    </Link>
  );
}

function firstName(full: string): string {
  return full.split(" ")[0];
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "iyi geceler";
  if (h < 12) return "günaydın";
  if (h < 18) return "tünaydın";
  return "iyi akşamlar";
}
