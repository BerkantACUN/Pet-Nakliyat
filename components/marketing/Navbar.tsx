"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3">
      <nav
        className={cn(
          "mx-auto flex h-12 max-w-5xl items-center justify-between rounded-full bg-eggshell/80 px-4 transition-all duration-300 backdrop-blur-md",
          scrolled
            ? "border border-chalk shadow-[0_8px_30px_-12px_rgba(17,17,17,0.12)]"
            : "border border-transparent",
        )}
        aria-label="Ana navigasyon"
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 font-display text-[17px] tracking-tight"
        >
          <span aria-hidden className="text-[15px]">🐾</span>
          patiyolu
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink href="/nasil-calisir">Nasıl çalışır</NavLink>
          <NavLink href="/tasiyicilar">Taşıyıcılar</NavLink>
          <NavLink href="/tasiyici-ol">Taşıyıcı ol</NavLink>
          <NavLink href="/sozlesme-ornegi">Sözleşme</NavLink>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            render={<Link href="/giris" />}
          >
            Giriş
          </Button>
          <Button variant="pill" size="sm" render={<Link href="/kayit" />}>
            Üye ol
          </Button>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-[13px] text-gravel transition-colors hover:bg-chalk/50 hover:text-obsidian"
    >
      {children}
    </Link>
  );
}
