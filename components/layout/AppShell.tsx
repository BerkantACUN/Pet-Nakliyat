import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { Toaster } from "@/components/ui/sonner";
import type { AppRole } from "@/lib/supabase/types";

interface AppShellProps {
  children: React.ReactNode;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  roles: AppRole[];
  defaultRole: AppRole;
}

export function AppShell({
  children,
  name,
  email,
  avatarUrl,
  roles,
  defaultRole,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-eggshell">
      <Topbar
        name={name}
        email={email}
        avatarUrl={avatarUrl}
        roles={roles}
        defaultRole={defaultRole}
      />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-4 pb-24 md:pb-10">
        {children}
      </main>
      <BottomNav roles={roles} defaultRole={defaultRole} />
      <Toaster richColors position="top-center" />
    </div>
  );
}
