import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="grid items-end gap-12 md:grid-cols-[1.4fr_1fr] md:gap-16">
          <div>
            <span className="font-mono text-[10px] text-gravel">
              evcil • nakliyat • güven
            </span>
            <h1 className="font-display mt-4 text-[clamp(44px,7vw,80px)] leading-[1.02] tracking-[-0.025em]">
              Tüylü dostların
              <br />
              <em className="not-italic text-gravel">güvenli bir yolda.</em>
            </h1>
          </div>

          <div className="md:pb-3">
            <p className="text-[16px] leading-7 text-gravel">
              Şehir içi ve şehirler arası evcil hayvan taşımacılığı. Şeffaf
              kilometre bazlı fiyat, imzalı sözleşmeli taşıyıcılar, puanlı sicil.
              İlanını aç, teklif al, gönlün rahat olarak yolla.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="pill"
                size="lg"
                render={<Link href="/musteri/ilan-olustur" />}
              >
                İlan aç
              </Button>
              <Button
                variant="pill-outline"
                size="lg"
                render={<Link href="/tasiyici-ol" />}
              >
                Taşıyıcı ol
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-20 flex items-center gap-6 border-t border-chalk pt-6">
          <SocialProof label="Şehir" value="81" />
          <SocialProof label="Doğrulanmış taşıyıcı" value="ön kayıt" />
          <SocialProof label="Ortalama yanıt" value="< 2 sa" />
          <SocialProof label="Komisyon" value="%10" />
        </div>
      </div>
    </section>
  );
}

function SocialProof({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-display text-[24px] font-light leading-none tracking-tight">
        {value}
      </span>
      <span className="font-mono text-[10px] text-gravel">{label}</span>
    </div>
  );
}
