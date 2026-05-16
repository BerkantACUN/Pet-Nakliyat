import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/Chip";

export const metadata = {
  title: "Nasıl çalışır — Patiyolu",
  description:
    "Patiyolu üzerinde nakliyat ilanı vermek, teklif toplamak ve güvenli ödeme almak nasıl çalışır?",
};

const STEPS_CUSTOMER = [
  {
    n: "1",
    emoji: "📍",
    title: "İlanını oluştur",
    body: "Petini, alış ve teslim adresini, tarihi seç. Sistem km bazlı tahmini fiyatı sana anında söyler.",
  },
  {
    n: "2",
    emoji: "📨",
    title: "Teklifleri karşılaştır",
    body: "Doğrulanmış taşıyıcılardan teklifler gelsin. Puanlarına, sürelerine, fiyatlarına bak.",
  },
  {
    n: "3",
    emoji: "✅",
    title: "Kabul et, ödeme yap",
    body: "İstediğin teklifi kabul et, ödemeyi güvenli emanet sistemiyle yap. Pet teslim edilince ödeme aktarılır.",
  },
  {
    n: "4",
    emoji: "⭐",
    title: "Değerlendir",
    body: "Yolculuk biter bitmez taşıyıcıyı puanla. Diğer pet sahipleri seçim yaparken sana güvensin.",
  },
];

const STEPS_TRANSPORTER = [
  {
    n: "1",
    emoji: "🪪",
    title: "Sözleşme + KYC",
    body: "Taşıyıcı sözleşmesini elektronik olarak imzala, kimlik + araç belgelerini yükle. 1-3 iş günü içinde onaylanır.",
  },
  {
    n: "2",
    emoji: "🔍",
    title: "İlanları gözle",
    body: "Şehrin, rotan, müsaitliğine göre ilanları filtrele. Sana uygun olana teklif at.",
  },
  {
    n: "3",
    emoji: "🚐",
    title: "Yolculuğu tamamla",
    body: "Hayvanı teslim al, klimalı + sabit kafesli aracında güvenle taşı, teslim et.",
  },
  {
    n: "4",
    emoji: "💸",
    title: "Ödemen yat",
    body: "Müşteri teslimi onayladıktan sonra 3-5 iş günü içinde %10 komisyon düşülerek hesabına yatar.",
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pt-12 pb-6 sm:pt-20">
        <Chip className="mb-4 bg-powder">
          <span aria-hidden>🐾</span> Patiyolu rehberi
        </Chip>
        <h1 className="font-display text-[42px] leading-[1.05] tracking-tight sm:text-[56px]">
          Pati yolculuğu <br />
          <span className="text-gravel">dört adımda</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] text-gravel">
          Hem pet sahibi hem taşıyıcı için akış nasıl ilerliyor — adım adım,
          şeffafça anlatalım.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-paw/15 text-lg">
            👤
          </span>
          <h2 className="font-display text-[22px]">Müşteri (pet sahibi)</h2>
        </div>
        <ol className="grid gap-3">
          {STEPS_CUSTOMER.map((s) => (
            <StepCard key={s.n} step={s} accent="paw" />
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-clover/20 text-lg">
            🚐
          </span>
          <h2 className="font-display text-[22px]">Taşıyıcı</h2>
        </div>
        <ol className="grid gap-3">
          {STEPS_TRANSPORTER.map((s) => (
            <StepCard key={s.n} step={s} accent="clover" />
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 className="font-display text-[28px] leading-tight">
          Hazır mısın? Hemen başla
        </h2>
        <p className="mt-2 text-[14px] text-gravel">
          Üyelik ücretsiz. İlk ilan sadece 49 ₺.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button variant="pill" size="lg" render={<Link href="/kayit" />}>
            Ücretsiz hesap aç
          </Button>
          <Button variant="pill-outline" size="lg" render={<Link href="/tasiyici-ol" />}>
            Taşıyıcı ol
          </Button>
        </div>
      </section>
    </MarketingShell>
  );
}

interface StepCardProps {
  step: { n: string; emoji: string; title: string; body: string };
  accent: "paw" | "clover";
}

function StepCard({ step, accent }: StepCardProps) {
  return (
    <li className="flex items-start gap-4 rounded-3xl border border-chalk bg-white p-5">
      <div
        className="grid size-12 shrink-0 place-items-center rounded-2xl text-xl"
        style={{
          background:
            accent === "paw"
              ? "color-mix(in oklch, var(--color-paw) 18%, white)"
              : "color-mix(in oklch, var(--color-clover) 18%, white)",
        }}
      >
        {step.emoji}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gravel">
            Adım {step.n}
          </span>
        </div>
        <h3 className="mt-0.5 font-display text-[18px] leading-tight">
          {step.title}
        </h3>
        <p className="mt-1 text-[13px] text-gravel">{step.body}</p>
      </div>
    </li>
  );
}
