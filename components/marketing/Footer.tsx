import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-eggshell">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div>
            <div className="font-display text-[20px] tracking-tight">
              <span aria-hidden>🐾</span> patiyolu
            </div>
            <p className="mt-2 max-w-xs text-[12px] leading-5 text-gravel">
              Türkiye'de evcil hayvan taşımacılığını şeffaf ve güvene
              kavuşturuyoruz.
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]"
            aria-label="Footer"
          >
            <Link href="/nasil-calisir" className="text-obsidian hover:text-gravel">
              Nasıl çalışır
            </Link>
            <Link href="/tasiyici-ol" className="text-obsidian hover:text-gravel">
              Taşıyıcı ol
            </Link>
            <Link href="/sozlesme-ornegi" className="text-obsidian hover:text-gravel">
              Sözleşme
            </Link>
            <Link href="#" className="text-obsidian hover:text-gravel">
              İletişim
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center gap-1 border-t border-chalk pt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-gravel md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} patiyolu · tüm hakları saklıdır</span>
          <span>İstanbul, Türkiye 🇹🇷</span>
        </div>
      </div>
    </footer>
  );
}
