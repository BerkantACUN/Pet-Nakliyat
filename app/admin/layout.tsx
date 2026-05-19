import Link from "next/link";
import { adminGate } from "@/lib/admin";
import { Toaster } from "@/components/ui/sonner";
import { AdminUuidCopy } from "@/components/admin/AdminUuidCopy";

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
  const { user, isAdmin, configuredCount } = await adminGate();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-eggshell">
        <header className="border-b border-chalk bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-[18px]"
            >
              <span aria-hidden>🐾</span> Patiyolu
            </Link>
            <Link
              href="/panel"
              className="text-[13px] text-signal hover:underline"
            >
              Panele dön →
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-card border border-chalk bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-danger">
              403 · Yetki yok
            </p>
            <h1 className="mt-2 font-display text-[28px] leading-tight text-obsidian">
              Bu hesap admin değil
            </h1>
            <p className="mt-3 text-[14px] text-gravel">
              Admin paneline erişmek için Vercel'deki{" "}
              <code className="rounded bg-powder px-1.5 py-0.5 font-mono text-[12px]">
                ADMIN_USER_IDS
              </code>{" "}
              env var'ına aşağıdaki UUID'i eklemen lazım, sonra deploy'u
              yenilemen gerekiyor.
            </p>

            <div className="mt-6 space-y-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
                  Giriş yapan hesap
                </p>
                <p className="mt-1 text-[14px] text-obsidian">{user.email}</p>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
                  Senin User UUID'in (bunu kopyala)
                </p>
                <AdminUuidCopy uuid={user.id} />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
                  ADMIN_USER_IDS env'inde tanımlı UUID sayısı
                </p>
                <p className="mt-1 font-mono text-[13px] text-obsidian">
                  {configuredCount}{" "}
                  {configuredCount === 0 ? "(env var boş veya yok)" : "UUID"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-input border border-chalk bg-powder/50 p-4 text-[13px] text-gravel">
              <p className="font-medium text-obsidian">Adım adım:</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5">
                <li>Yukarıdaki UUID'i kopyala</li>
                <li>
                  Vercel → Pet-Nakliyat → Settings → Environment Variables aç
                </li>
                <li>
                  <code className="rounded bg-white px-1 font-mono text-[11px]">
                    ADMIN_USER_IDS
                  </code>{" "}
                  satırını edit et (yoksa add et), kopyaladığın UUID'i yapıştır
                </li>
                <li>Save</li>
                <li>
                  Deployments → en üstteki → ⋯ → Redeploy (build cache kapalı)
                </li>
                <li>Bu sayfayı tekrar aç</li>
              </ol>
            </div>
          </div>
        </main>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

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
