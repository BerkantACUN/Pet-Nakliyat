"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  MessageCircle,
  User,
  PawPrint,
  Truck,
  Inbox,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/lib/supabase/types";
import { detectActiveRole } from "./role-context";

type IconComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface BottomNavItem {
  href: string;
  label: string;
  icon: IconComp;
  match?: (path: string) => boolean;
}

const CUSTOMER_ITEMS: BottomNavItem[] = [
  { href: "/musteri", label: "Anasayfa", icon: Home, match: (p) => p === "/musteri" || p === "/panel" },
  {
    href: "/musteri/ilanlarim",
    label: "İlanlarım",
    icon: Package,
    match: (p) =>
      p.startsWith("/musteri/ilanlarim") || p.startsWith("/musteri/ilan-olustur"),
  },
  {
    href: "/musteri/petlerim",
    label: "Petlerim",
    icon: PawPrint,
    match: (p) => p.startsWith("/musteri/petlerim"),
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

const TRANSPORTER_ITEMS: BottomNavItem[] = [
  { href: "/tasiyici", label: "Anasayfa", icon: Home, match: (p) => p === "/tasiyici" || p === "/panel" },
  {
    href: "/tasiyici/ilanlar",
    label: "İlanlar",
    icon: Truck,
    match: (p) => p.startsWith("/tasiyici/ilanlar"),
  },
  {
    href: "/tasiyici/tekliflerim",
    label: "Tekliflerim",
    icon: Inbox,
    match: (p) =>
      p.startsWith("/tasiyici/tekliflerim") || p.startsWith("/tasiyici/booking"),
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
    match: (p) => p === "/profil" || p === "/ayarlar" || p.startsWith("/tasiyici/kyc") || p.startsWith("/sozlesme"),
  },
];

const NEUTRAL_ITEMS: BottomNavItem[] = [
  { href: "/panel", label: "Anasayfa", icon: Home, match: (p) => p === "/panel" },
  {
    href: "/profil",
    label: "Rolü tamamla",
    icon: Plus,
    match: (p) => p === "/profil",
  },
  {
    href: "/mesajlar",
    label: "Mesajlar",
    icon: MessageCircle,
    match: (p) => p.startsWith("/mesajlar"),
  },
  {
    href: "/ayarlar",
    label: "Ayarlar",
    icon: User,
    match: (p) => p === "/ayarlar",
  },
];

interface BottomNavProps {
  roles: AppRole[];
  defaultRole: AppRole;
}

export function BottomNav({ roles, defaultRole }: BottomNavProps) {
  const pathname = usePathname();
  const activeRole = detectActiveRole(pathname, roles, defaultRole);

  const items =
    activeRole === "customer" && roles.includes("customer")
      ? CUSTOMER_ITEMS
      : activeRole === "transporter" && roles.includes("transporter")
        ? TRANSPORTER_ITEMS
        : NEUTRAL_ITEMS;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-chalk bg-eggshell/95 backdrop-blur md:hidden"
      aria-label="Alt navigasyon"
    >
      <ul
        className={cn(
          "mx-auto grid max-w-2xl px-2 py-1.5",
          items.length === 5 ? "grid-cols-5" : "grid-cols-4",
        )}
      >
        {items.map((item) => {
          const active = item.match
            ? item.match(pathname)
            : pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl px-1.5 py-2 text-[10px] transition",
                  active ? "text-obsidian" : "text-gravel hover:bg-chalk/40",
                )}
              >
                <Icon
                  className={cn("size-5 transition", active && "scale-110")}
                  strokeWidth={(active ? 2.2 : 1.6) as unknown as number}
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
