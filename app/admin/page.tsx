import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Patiyolu" };

async function fetchCounts() {
  const supabase = createServiceRoleClient();
  const [users, transporters, listings, bids, pendingKyc, signedContracts] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("transporter_profiles")
        .select("*", { count: "exact", head: true }),
      supabase.from("listings").select("*", { count: "exact", head: true }),
      supabase.from("bids").select("*", { count: "exact", head: true }),
      supabase
        .from("kyc_documents")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("contract_signatures")
        .select("*", { count: "exact", head: true }),
    ]);
  return {
    users: users.count ?? 0,
    transporters: transporters.count ?? 0,
    listings: listings.count ?? 0,
    bids: bids.count ?? 0,
    pendingKyc: pendingKyc.count ?? 0,
    signedContracts: signedContracts.count ?? 0,
  };
}

export default async function AdminHome() {
  const counts = await fetchCounts();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-[28px]">Yönetim paneli</h1>
        <p className="text-[13px] text-gravel">
          Sistemin nabzı. Tüm sayılar gerçek zamanlı.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Toplam kullanıcı" value={counts.users} />
        <Stat label="Taşıyıcı" value={counts.transporters} />
        <Stat
          label="Bekleyen KYC"
          value={counts.pendingKyc}
          highlight={counts.pendingKyc > 0}
          href={counts.pendingKyc > 0 ? "/admin/kyc" : undefined}
        />
        <Stat label="İlan" value={counts.listings} />
        <Stat label="Teklif" value={counts.bids} />
        <Stat label="İmzalı sözleşme" value={counts.signedContracts} />
      </section>

      <section className="rounded-3xl border border-chalk bg-white p-5">
        <h2 className="font-display text-[18px]">Hızlı eylemler</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionLink href="/admin/kyc">KYC kuyruğu</ActionLink>
          <ActionLink href="/admin/ilanlar">İlan moderasyonu</ActionLink>
          <ActionLink href="/admin/odemeler">Ödeme defteri</ActionLink>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  href,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  href?: string;
}) {
  const inner = (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
        {label}
      </p>
      <p className="mt-1 font-display text-[32px] leading-tight">{value}</p>
    </>
  );
  const cls = `rounded-3xl border p-5 ${highlight ? "border-paw bg-paw/10" : "border-chalk bg-white"}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

function ActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full bg-obsidian px-4 py-2 text-[13px] font-medium text-eggshell hover:bg-obsidian/85"
    >
      {children}
    </Link>
  );
}
