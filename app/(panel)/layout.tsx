import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AppShell } from "@/components/layout/AppShell";
import { getUser } from "@/lib/auth";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/giris");

  // Onboarding tamamlanmadıysa zorla (route-based check yerine; her sayfa için
  // tutarlı). Onboarding sayfası kendisi (auth) grubu altında — buraya düşmez.
  if (!user.profile?.onboarding_completed_at) {
    redirect("/onboarding");
  }

  // Aktif rolü URL'den oku (eğer mümkünse) — yoksa default_role
  const reqHeaders = await headers();
  const pathname =
    reqHeaders.get("x-pathname") ?? reqHeaders.get("next-url") ?? "";
  const activeRole = pathname.startsWith("/tasiyici")
    ? "transporter"
    : pathname.startsWith("/musteri")
      ? "customer"
      : user.profile.default_role;

  return (
    <AppShell
      name={user.profile.full_name}
      email={user.email}
      avatarUrl={user.profile.avatar_url}
      roles={user.roles}
      activeRole={activeRole}
    >
      {children}
    </AppShell>
  );
}
