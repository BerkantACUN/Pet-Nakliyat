import Link from "next/link";
import {
  ArrowRight,
  PawPrint,
  Plus,
  Package,
  Inbox,
  Truck,
} from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/Chip";

export const metadata = { title: "Müşteri paneli · Patiyolu" };
export const dynamic = "force-dynamic";

export default async function MusteriDashboardPage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const [
    { count: petCount },
    { data: activeListings, count: activeCount },
    { count: bidCount },
    { data: activeBookings, count: bookingCount },
  ] = await Promise.all([
    supabase
      .from("pets")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id),
    supabase
      .from("listings")
      .select("id, pickup_address, dropoff_address, status, scheduled_at", {
        count: "exact",
      })
      .eq("customer_id", user.id)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3),
    supabase
      .from("bids")
      .select("id, listing_id, listings!inner(customer_id)", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending")
      .eq("listings.customer_id", user.id),
    supabase
      .from("bookings")
      .select("id, status, agreed_price", { count: "exact" })
      .eq("customer_id", user.id)
      .in("status", ["pending_payment", "accepted", "en_route", "delivered"])
      .order("created_at", { ascending: false })
      .limit(2),
  ]);

  const pets = petCount ?? 0;
  const listings = activeCount ?? 0;
  const bids = bidCount ?? 0;
  const bookings = bookingCount ?? 0;
  const hasPets = pets > 0;
  const isAlsoTransporter = user.roles.includes("transporter");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          {greeting()} —
        </span>
        <h1 className="font-display text-[28px] leading-tight">
          Selam {firstName(user.profile!.full_name)} 🐾
        </h1>
        <p className="text-[14px] text-gravel">
          {hasPets
            ? "Pati yolculuğun nereden başlasın?"
            : "Önce tüylü dostunu tanıyalım, sonra ilan açalım."}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Petlerim" value={pets} icon={<PawPrint className="size-4" />} href="/musteri/petlerim" />
        <StatCard label="Açık ilanlarım" value={listings} icon={<Package className="size-4" />} href="/musteri/ilanlarim" />
        <StatCard label="Bekleyen teklifler" value={bids} icon={<Inbox className="size-4" />} href="/musteri/ilanlarim" highlight={bids > 0} />
        <StatCard label="Aktif booking" value={bookings} icon={<Truck className="size-4" />} href="/musteri/ilanlarim" highlight={bookings > 0} />
      </section>

      {!hasPets ? (
        <section className="rounded-3xl border border-dashed border-chalk bg-powder p-6 text-center">
          <div className="text-3xl" aria-hidden>
            🐾
          </div>
          <h2 className="mt-3 font-display text-[20px]">
            Henüz pet eklemedin
          </h2>
          <p className="mt-1 text-[13px] text-gravel">
            İlk peti ekledikten sonra ilan oluşturabilirsin.
          </p>
          <Button
            variant="pill"
            size="sm"
            className="mt-4"
            render={<Link href="/musteri/petlerim" />}
          >
            <Plus className="size-3.5" /> Pet ekle
          </Button>
        </section>
      ) : (
        <section className="grid gap-3">
          <ActionCard
            href="/musteri/ilan-olustur"
            emoji="📍"
            accent="var(--color-paw)"
            title="Yeni nakliyat ilanı"
            body="Petini, adresleri ve tarihi seç. Fiyat anında."
          />
          <ActionCard
            href="/musteri/ilanlarim"
            emoji="📦"
            accent="var(--color-signal)"
            title="İlanlarım"
            body={`${listings} açık ilan${bids > 0 ? ` · ${bids} yeni teklif` : ""}`}
          />
        </section>
      )}

      {activeListings && activeListings.length > 0 ? (
        <section className="space-y-2">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            Son ilanların
          </h2>
          <ul className="space-y-2">
            {activeListings.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/musteri/${l.id}`}
                  className="flex items-center justify-between rounded-3xl border border-chalk bg-white p-4 transition hover:bg-powder"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-medium">
                      {shortAddr(l.pickup_address)} → {shortAddr(l.dropoff_address)}
                    </div>
                    <div className="mt-0.5 text-[12px] text-gravel">
                      {l.scheduled_at
                        ? new Date(l.scheduled_at).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                          })
                        : "Tarih esnek"}
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-gravel" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!isAlsoTransporter ? (
        <section className="rounded-3xl border border-chalk bg-white p-5">
          <h2 className="font-display text-[18px]">Taşıyıcı olmak ister misin?</h2>
          <p className="mt-1 text-[13px] text-gravel">
            KYC + sözleşme sonrası teklif verip ek gelir kazanabilirsin.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip className="bg-powder">🐾 Esnek saatler</Chip>
            <Chip className="bg-powder">💰 %10 komisyon</Chip>
          </div>
          <Button
            variant="pill-outline"
            size="sm"
            className="mt-4"
            render={<Link href="/profil" />}
          >
            Taşıyıcı rolü ekle
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

function shortAddr(addr: string): string {
  return addr.length > 32 ? addr.slice(0, 32) + "…" : addr;
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
