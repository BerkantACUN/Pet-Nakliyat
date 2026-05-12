"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  match?: (path: string) => boolean;
}

const ITEMS: BottomNavItem[] = [
  { href: "/panel", label: "Anasayfa", icon: Home },
  {
    href: "/musteri/ilanlarim",
    label: "İlanlar",
    icon: Package,
    match: (p) => p.startsWith("/musteri") || p.startsWith("/tasiyici"),
  },
  {
    href: "/mesajlar",
    label: "Mesajlar",
    icon: MessageCircle,
    match: (p) => p.startsWith("/mesajlar"),
  },
  {
    href: "/profil",
    label: "Profil",
    icon: User,
    match: (p) => p === "/profil" || p === "/ayarlar",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-chalk bg-eggshell/95 backdrop-blur md:hidden"
      aria-label="Alt navigasyon"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4 px-2 py-1.5">
        {ITEMS.map((item) => {
          const active = item.match
            ? item.match(pathname)
            : pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[10px] transition",
                  active
                    ? "text-obsidian"
                    : "text-gravel hover:bg-chalk/40",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 transition",
                    active && "scale-110",
                  )}
                  strokeWidth={active ? 2.2 : 1.6 as unknown as number}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
