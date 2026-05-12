import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-chalk bg-eggshell">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-[18px] tracking-tight">patiyolu</div>
          <p className="mt-3 max-w-sm text-[13px] leading-6 text-gravel">
            Türkiye'de evcil hayvan taşımacılığını şeffaf, sözleşmeli ve puanlı
            bir sicille güvene kavuşturuyoruz.
          </p>
        </div>
        <FooterCol
          title="Ürün"
          items={[
            { label: "Nasıl çalışır", href: "/nasil-calisir" },
            { label: "Taşıyıcı ol", href: "/tasiyici-ol" },
            { label: "Sözleşme", href: "/sozlesme-ornegi" },
          ]}
        />
        <FooterCol
          title="Şirket"
          items={[
            { label: "Hakkımızda", href: "#" },
            { label: "İletişim", href: "#" },
            { label: "KVKK", href: "#" },
          ]}
        />
      </div>
      <div className="border-t border-chalk">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 font-mono text-[10px] text-gravel">
          <span>© {new Date().getFullYear()} patiyolu</span>
          <span>tüm hakları saklıdır</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="font-mono text-[10px] text-gravel">{title}</div>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              className="text-[13px] text-obsidian transition hover:text-gravel"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
