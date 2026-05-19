import { requireOnboardedUser } from "@/lib/auth";
import { SettingsToggle } from "@/components/settings/SettingsToggle";
import { DefaultRoleSelector } from "@/components/settings/DefaultRoleSelector";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { ChangeEmailForm } from "@/components/settings/ChangeEmailForm";
import { ChangePhoneForm } from "@/components/settings/ChangePhoneForm";

export const metadata = { title: "Ayarlar — Patiyolu" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireOnboardedUser();
  const profile = user.profile!;
  const canTransporter = user.roles.includes("transporter");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
          Hesap
        </span>
        <h1 className="font-display text-[28px] leading-tight">Ayarlar</h1>
      </header>

      <section className="rounded-3xl border border-chalk bg-white p-5">
        <h2 className="mb-1 font-display text-[18px]">E-posta</h2>
        <p className="mb-3 text-[12px] text-gravel">
          Mevcut: <strong className="text-obsidian">{user.email}</strong>
          <br />
          Değiştirirsen yeni adrese onay maili gider, tıklayınca aktif olur.
        </p>
        <ChangeEmailForm currentEmail={user.email ?? ""} />
      </section>

      <section className="rounded-3xl border border-chalk bg-white p-5">
        <h2 className="mb-1 font-display text-[18px]">Şifre</h2>
        <p className="mb-3 text-[12px] text-gravel">
          Güvenlik için en az 8 karakter olsun, sayı + harf karışsın.
        </p>
        <ChangePasswordForm />
      </section>

      <section className="rounded-3xl border border-chalk bg-white p-5">
        <h2 className="mb-1 font-display text-[18px]">Telefon</h2>
        <p className="mb-3 text-[12px] text-gravel">
          Mevcut: <strong className="text-obsidian">{profile.phone ?? "—"}</strong>
        </p>
        <ChangePhoneForm currentPhone={profile.phone ?? ""} />
      </section>

      <section className="rounded-3xl border border-chalk bg-white p-5 space-y-3">
        <h2 className="font-display text-[18px]">Varsayılan rol</h2>
        <p className="text-[13px] text-gravel">
          Panele girdiğinde önce hangi modda olmak istiyorsun?
        </p>
        <DefaultRoleSelector
          current={profile.default_role === "transporter" ? "transporter" : "customer"}
          canTransporter={canTransporter}
        />
      </section>

      <section className="rounded-3xl border border-chalk bg-white p-5 space-y-3">
        <h2 className="font-display text-[18px]">Bildirimler</h2>
        <SettingsToggle
          label="Kampanya & yenilikler"
          description="Patiyolu yenilikleri, kampanyalar ve ipuçları için e-posta al."
          initial={profile.marketing_consent}
        />
      </section>

      <section className="space-y-3 text-[13px] text-gravel">
        <h2 className="font-display text-[18px] text-obsidian">Yasal</h2>
        <ul className="space-y-2">
          <li>
            • KVKK aydınlatma metni — kayıt sırasında onayladığın metnin son
            sürümü, panel'in altındaki sözleşmede.
          </li>
          <li>
            • Hesabımı silmek istiyorum →{" "}
            <a
              href="mailto:hesap-silme@patiyolu.app"
              className="text-obsidian underline decoration-chalk underline-offset-2 hover:decoration-obsidian"
            >
              hesap-silme@patiyolu.app
            </a>
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-danger/20 bg-danger/5 p-4">
        <h2 className="font-display text-[16px] text-danger">Oturum</h2>
        <p className="mt-1 text-[12px] text-gravel">
          Bu cihazdaki Patiyolu oturumunu kapat.
        </p>
        <div className="mt-3">
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
