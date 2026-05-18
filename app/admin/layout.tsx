import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Anasayfa" },
  { href: "/admin/kyc", label: "KYC" },
  { href: "/admin/ilanlar", label: "İlanlar" },
  { href: "/admin/odemeler", label: "Ödemeler" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen bg-eggshell">
      <header className="border-b border-chalk bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-display text-[18px]"
          >
            <span aria-hidden>🐾</span> Patiyolu · admin
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            {user.email}
          </p>
        </div>
        <nav className="border-t border-chalk">
          <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="block rounded-t-lg px-3 py-2 text-[13px] text-gravel hover:bg-powder hover:text-obsidian"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
