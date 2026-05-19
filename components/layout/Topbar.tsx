"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, LogOut, UserCircle2, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOutAction } from "@/app/(auth)/actions";
import type { AppRole } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { detectActiveRole } from "./role-context";

const ROLE_META: Record<AppRole, { label: string; emoji: string; href: string }> =
  {
    customer: { label: "Müşteri", emoji: "🐾", href: "/musteri" },
    transporter: { label: "Taşıyıcı", emoji: "🚐", href: "/tasiyici" },
    sitter: { label: "Bakıcı", emoji: "🏠", href: "/panel" },
    vet: { label: "Veteriner", emoji: "🏥", href: "/panel" },
  };

interface TopbarProps {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  roles: AppRole[];
  defaultRole: AppRole;
}

export function Topbar({
  name,
  email,
  avatarUrl,
  roles,
  defaultRole,
}: TopbarProps) {
  const pathname = usePathname();
  const activeRole = detectActiveRole(pathname, roles, defaultRole);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-chalk/80 bg-eggshell/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link
          href="/panel"
          className="flex items-center gap-1.5 font-display text-[17px] tracking-tight"
        >
          <span aria-hidden>🐾</span>
          patiyolu
        </Link>

        <div className="flex items-center gap-2">
          <RoleSwitcher roles={roles} activeRole={activeRole} />

          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-1 rounded-full border border-chalk bg-white p-0.5 transition hover:bg-powder",
                pending && "opacity-50",
              )}
            >
              <Avatar className="size-8">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={name} />
                ) : null}
                <AvatarFallback className="bg-paw/20 text-[12px] font-medium text-obsidian">
                  {initials(name)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="mr-1 size-3.5 text-gravel" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="min-w-56 rounded-2xl border-chalk bg-white p-2 shadow-[0_12px_40px_-12px_rgba(17,17,17,0.18)]"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <div className="text-[13px] font-medium text-obsidian">
                  {name}
                </div>
                {email ? (
                  <div className="truncate text-[11px] text-gravel">
                    {email}
                  </div>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={<Link href="/profil" />}
                className="cursor-pointer rounded-xl px-3 py-2 text-[13px]"
              >
                <UserCircle2 className="mr-2 size-4" /> Profilim
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/ayarlar" />}
                className="cursor-pointer rounded-xl px-3 py-2 text-[13px]"
              >
                <Settings className="mr-2 size-4" /> Ayarlar
              </DropdownMenuItem>
              {!roles.includes("transporter") ? (
                <DropdownMenuItem
                  render={<Link href="/profil" />}
                  className="cursor-pointer rounded-xl px-3 py-2 text-[13px]"
                >
                  <Plus className="mr-2 size-4" /> Taşıyıcı rolü ekle
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  startTransition(() => signOutAction());
                }}
                className="cursor-pointer rounded-xl px-3 py-2 text-[13px] text-danger focus:bg-danger/10 focus:text-danger"
              >
                <LogOut className="mr-2 size-4" /> Çıkış yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function RoleSwitcher({
  roles,
  activeRole,
}: {
  roles: AppRole[];
  activeRole: AppRole;
}) {
  if (roles.length <= 1) {
    const meta = ROLE_META[activeRole];
    return (
      <span className="hidden items-center gap-1.5 rounded-full border border-chalk bg-white px-3 py-1.5 text-[12px] sm:inline-flex">
        <span aria-hidden>{meta.emoji}</span>
        {meta.label}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-full border border-chalk bg-white px-3 py-1.5 text-[12px] transition hover:bg-powder">
        <span aria-hidden>{ROLE_META[activeRole].emoji}</span>
        {ROLE_META[activeRole].label}
        <ChevronDown className="size-3 text-gravel" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="min-w-48 rounded-2xl border-chalk bg-white p-2 shadow-[0_12px_40px_-12px_rgba(17,17,17,0.18)]"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[11px] uppercase tracking-[0.15em] text-gravel">
          Hangi rolde çalışıyorsun?
        </DropdownMenuLabel>
        {roles.map((r) => {
          const meta = ROLE_META[r];
          return (
            <DropdownMenuItem
              key={r}
              render={<Link href={meta.href} />}
              className="cursor-pointer rounded-xl px-3 py-2 text-[13px]"
            >
              <span aria-hidden className="mr-2">
                {meta.emoji}
              </span>
              {meta.label}
              {r === activeRole ? (
                <span className="ml-auto text-[10px] text-gravel">aktif</span>
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
