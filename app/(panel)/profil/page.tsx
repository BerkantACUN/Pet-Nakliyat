import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { TransporterProfileForm } from "@/components/profile/TransporterProfileForm";
import { EnableTransporterButton } from "@/components/profile/EnableTransporterButton";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Profil — Patiyolu" };

export default async function ProfilePage() {
  const user = await requireOnboardedUser();
  const supabase = await createClient();

  const isTransporter = user.roles.includes("transporter");
  const { data: tp } = isTransporter
    ? await supabase
        .from("transporter_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          Hesap
        </span>
        <h1 className="font-display text-[28px] leading-tight">Profil</h1>
        <p className="text-[13px] text-gravel">
          Adın, iletişim bilgilerin ve taşıyıcı detayların.
        </p>
      </header>

      <section className="rounded-3xl border border-chalk bg-white p-5">
        <h2 className="mb-4 font-display text-[18px]">Kişisel bilgiler</h2>
        <ProfileForm
          defaults={{
            fullName: user.profile!.full_name,
            city: user.profile!.city ?? "",
            phone: user.profile!.phone ?? "",
          }}
        />
      </section>

      {isTransporter ? (
        <section className="rounded-3xl border border-chalk bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-display text-[18px]">Taşıyıcı bilgileri</h2>
            <Button
              variant="pill-ghost"
              size="sm"
              render={<Link href={`/tasiyicilar/${tp?.slug ?? ""}`} />}
            >
              Public profil ↗
            </Button>
          </div>
          {tp ? (
            <TransporterProfileForm
              defaults={{
                displayName: tp.display_name,
                bio: tp.bio ?? "",
                companyName: tp.company_name ?? "",
                vehicleType: tp.vehicle_type ?? undefined,
                plate: tp.plate ?? "",
                serviceCities: (tp.service_cities ?? []).join(", "),
                baseRatePerKm: Number(tp.base_rate_per_km),
                minCharge: Number(tp.min_charge),
              }}
            />
          ) : (
            <p className="text-[13px] text-gravel">
              Taşıyıcı profili henüz hazır değil.
            </p>
          )}
        </section>
      ) : (
        <section className="rounded-3xl border border-chalk bg-powder/40 p-5">
          <h2 className="font-display text-[18px]">Taşıyıcı modunu aç</h2>
          <p className="mt-1 text-[13px] text-gravel">
            Aracınla pet nakliyat yapmak istiyorsan taşıyıcı modunu aç,
            sözleşmeyi imzala, KYC'yi tamamla.
          </p>
          <div className="mt-4">
            <EnableTransporterButton />
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-chalk bg-white p-5 text-[13px] text-gravel">
        <p>
          <strong className="text-obsidian">E-posta:</strong>{" "}
          {user.email ?? "—"}
        </p>
        <p className="mt-1">
          <strong className="text-obsidian">Üye olduğun:</strong>{" "}
          {new Date(user.profile!.created_at).toLocaleDateString("tr-TR")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="pill-outline"
            size="sm"
            render={<Link href="/ayarlar" />}
          >
            Ayarlar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/sifre-sifirla" />}
          >
            Şifre sıfırla
          </Button>
        </div>
      </section>
    </div>
  );
}
