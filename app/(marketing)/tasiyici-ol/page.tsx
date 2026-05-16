import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/Chip";

export const metadata = {
  title: "Taşıyıcı ol — Patiyolu",
  description:
    "Aracınla evcil hayvan taşıyarak Patiyolu'da ek gelir kapısı aç. KYC + sözleşme sonrası teklif vermeye başla.",
};

const PERKS = [
  {
    emoji: "💸",
    title: "Net %90 senin",
    body: "Mutabık kalınan fiyatın %10 komisyon düştükten sonra kalanı banka hesabına yatar.",
  },
  {
    emoji: "📅",
    title: "Esnek çalış",
    body: "İstediğin ilana teklif at, kabul gelirse yola çık. Tam zamanlı zorunluluk yok.",
  },
  {
    emoji: "🛡️",
    title: "Şeffaf sicil",
    body: "Tamamladığın her iş profilinde birikir. Puan + yorum müşterilerin tercih sebebi olur.",
  },
  {
    emoji: "🤝",
    title: "Anında ödeme",
    body: "Teslim onaylandıktan 3-5 iş günü içinde otomatik EFT/havale.",
  },
];

const REQS = [
  "18 yaşını doldurmuş, geçerli sürücü belgesi sahibi olmak",
  "Klima + sabit kafes düzeneği bulunan bir araç (otomobil, van veya küçük kamyon)",
  "Hayvanlar konusunda işlenmiş suçtan ceza kaydı bulunmamak",
  "KYC belgeleri (kimlik ön/arka, plaka, ruhsat) yüklemeyi kabul etmek",
  "Taşıyıcı sözleşmesini elektronik olarak imzalamak",
];

export default function BecomeTransporterPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pt-12 pb-6 sm:pt-20">
        <Chip className="mb-4 bg-clover/15">
          <span aria-hidden>🚐</span> Taşıyıcı programı
        </Chip>
        <h1 className="font-display text-[42px] leading-[1.05] tracking-tight sm:text-[56px]">
          Aracınla tüylü <br />
          <span className="text-gravel">dostlara güvenli yol</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] text-gravel">
          Patiyolu'da doğrulanmış taşıyıcı ol, kendi şehrinde veya şehirler
          arası evcil hayvan nakliyat ilanlarına teklif at.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="pill" size="lg" render={<Link href="/kayit?rol=tasiyici" />}>
            Hemen başla
          </Button>
          <Button
            variant="pill-outline"
            size="lg"
            render={<Link href="/sozlesme-ornegi" />}
          >
            Sözleşmeyi gör
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-4 font-display text-[24px]">Neden Patiyolu?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PERKS.map((p) => (
            <div
              key={p.title}
              className="rounded-3xl border border-chalk bg-white p-5"
            >
              <div className="text-2xl">{p.emoji}</div>
              <h3 className="mt-2 font-display text-[17px] leading-tight">
                {p.title}
              </h3>
              <p className="mt-1 text-[13px] text-gravel">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-4 font-display text-[24px]">Gereksinimler</h2>
        <ul className="grid gap-2 rounded-3xl border border-chalk bg-white p-5">
          {REQS.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-[14px] text-obsidian"
            >
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-clover/20 text-[11px]">
                ✓
              </span>
              {r}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-4 font-display text-[24px]">Komisyon yapısı</h2>
        <div className="rounded-3xl border border-chalk bg-powder/60 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Komisyon" value="%10" hint="agreed price üzerinden" />
            <Stat label="Kazancın" value="%90" hint="net taşıyıcıya" />
            <Stat label="Ödeme süresi" value="3-5 gün" hint="teslim onayı sonrası" />
          </div>
          <p className="mt-5 text-[12px] text-gravel">
            Örnek: 1.500 ₺ anlaşma → 150 ₺ komisyon → 1.350 ₺ banka hesabına.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 className="font-display text-[28px] leading-tight">Hadi başlayalım</h2>
        <p className="mt-2 text-[14px] text-gravel">
          Kayıt → onboarding'de "taşıyıcı" rolünü aç → sözleşme + KYC → teklif vermeye başla.
        </p>
        <Button
          variant="pill"
          size="lg"
          className="mt-5"
          render={<Link href="/kayit?rol=tasiyici" />}
        >
          Taşıyıcı hesabı aç
        </Button>
      </section>
    </MarketingShell>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
        {label}
      </p>
      <p className="font-display text-[28px] leading-tight">{value}</p>
      <p className="text-[11px] text-gravel">{hint}</p>
    </div>
  );
}
