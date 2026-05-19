import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PawPrint, Truck } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";

export const metadata = { title: "Panel · Patiyolu" };
export const dynamic = "force-dynamic";

export default async function PanelHomePage() {
  const user = await requireOnboardedUser();
  const isCustomer = user.roles.includes("customer");
  const isTransporter = user.roles.includes("transporter");

  // Tek rol → direkt o role dashboard'a
  if (isCustomer && !isTransporter) redirect("/musteri");
  if (isTransporter && !isCustomer) redirect("/tasiyici");

  // İki rol de varsa → default_role'e yolla (kullanıcı switcher ile geçer)
  if (isCustomer && isTransporter) {
    redirect(user.profile!.default_role === "transporter" ? "/tasiyici" : "/musteri");
  }

  // Hiçbir rol yoksa (teorik) → rol ekleme ekranı
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          patiyolu
        </span>
        <h1 className="font-display text-[28px] leading-tight">
          Hoş geldin {firstName(user.profile!.full_name)} 🐾
        </h1>
        <p className="text-[14px] text-gravel">
          Devam etmek için bir rol seç.
        </p>
      </header>

      <section className="grid gap-3">
        <RoleCard
          href="/profil"
          icon={<PawPrint className="size-5" />}
          accent="var(--color-paw)"
          title="Müşteri ol"
          body="Petini taşıtmak için ilan aç, teklif al."
        />
        <RoleCard
          href="/profil"
          icon={<Truck className="size-5" />}
          accent="var(--color-clover)"
          title="Taşıyıcı ol"
          body="Ek gelir kapısı. KYC + sözleşme sonrası teklif at."
        />
      </section>
    </div>
  );
}

function RoleCard({
  href,
  icon,
  accent,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  accent: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-chalk bg-white p-4 transition hover:bg-powder"
    >
      <div
        className="grid size-12 shrink-0 place-items-center rounded-2xl"
        style={{ background: `${accent}1f`, color: accent }}
      >
        {icon}
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
