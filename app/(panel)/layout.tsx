import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getUser } from "@/lib/auth";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/giris");

  if (!user.profile?.onboarding_completed_at) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      name={user.profile.full_name}
      email={user.email}
      avatarUrl={user.profile.avatar_url}
      roles={user.roles}
      defaultRole={user.profile.default_role}
    >
      {children}
    </AppShell>
  );
}
