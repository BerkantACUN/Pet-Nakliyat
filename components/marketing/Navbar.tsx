"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full bg-eggshell/80 backdrop-blur transition-all",
        scrolled
          ? "border-b border-chalk"
          : "border-b border-transparent",
      )}
      aria-label="Ana navigasyon"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-[20px] font-light tracking-tight"
        >
          <PawMark className="size-5" />
          patiyolu
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/nasil-calisir"
            className="px-3 py-2 text-sm text-gravel transition hover:text-obsidian"
          >
            Nasıl çalışır
          </Link>
          <Link
            href="/tasiyici-ol"
            className="px-3 py-2 text-sm text-gravel transition hover:text-obsidian"
          >
            Taşıyıcı ol
          </Link>
          <Link
            href="/sozlesme-ornegi"
            className="px-3 py-2 text-sm text-gravel transition hover:text-obsidian"
          >
            Sözleşme
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/giris" />}>
            Giriş
          </Button>
          <Button variant="pill" size="sm" render={<Link href="/kayit" />}>
            Üye ol
          </Button>
        </div>
      </div>
    </nav>
  );
}

function PawMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <circle cx="6" cy="9" r="2.2" />
      <circle cx="12" cy="6" r="2.4" />
      <circle cx="18" cy="9" r="2.2" />
      <circle cx="9" cy="14" r="1.8" />
      <circle cx="15" cy="14" r="1.8" />
      <path d="M12 14c-3 0-5 2-5 4.5C7 21 9 22 12 22s5-1 5-3.5C17 16 15 14 12 14Z" />
    </svg>
  );
}
