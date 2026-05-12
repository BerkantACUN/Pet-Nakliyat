import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/Chip";
import { PhonePreview } from "@/components/marketing/PhonePreview";
import { PawDots } from "@/components/marketing/PawDots";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-eggshell">
      <PawDots className="-right-32 -top-20 text-paw" opacity={0.08} />
      <PawDots className="-left-32 top-1/2 text-signal" opacity={0.04} />

      <div className="relative mx-auto max-w-5xl px-6 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-[1.15fr_1fr] md:gap-10">
          {/* Text yarısı */}
          <div className="text-center md:text-left">
            <Chip>
              <span aria-hidden>🐾</span>
              Türkiye'nin pet nakliyat platformu
            </Chip>

            <h1 className="font-display mt-5 text-[clamp(36px,6vw,64px)] leading-[1.04] tracking-[-0.025em]">
              Tüylü dostlarına özel
              <br />
              <em className="not-italic text-gravel">güvenli yolculuklar.</em>
            </h1>

            <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-gravel md:mx-0">
              Şehir içi ve şehirler arası evcil hayvan taşımacılığı. Şeffaf
              km bazlı fiyat, imzalı sözleşmeli taşıyıcılar, puanlı sicil.
              <br />
              Pati yolculuğu birkaç dokunuş uzakta.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button
                variant="pill"
                size="lg"
                render={<Link href="/musteri/ilan-olustur" />}
              >
                İlan aç · ücretsiz
              </Button>
              <Button
                variant="pill-outline"
                size="lg"
                render={<Link href="/nasil-calisir" />}
              >
                Nasıl çalışır
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2 md:justify-start">
              <Chip className="bg-eggshell">
                <span aria-hidden>★</span> 4.9 ort. puan
              </Chip>
              <Chip className="bg-eggshell">
                <span aria-hidden>🚐</span> 81 şehir
              </Chip>
              <Chip className="bg-eggshell">
                <span aria-hidden>🤝</span> İmzalı sözleşme
              </Chip>
            </div>
          </div>

          {/* Phone preview */}
          <div className="relative flex justify-center md:justify-end">
            <div className="absolute -left-6 top-10 hidden size-20 rounded-full bg-paw/20 md:block" />
            <div className="absolute -right-4 bottom-4 hidden size-12 rounded-full bg-signal/15 md:block" />
            <PhonePreview />
          </div>
        </div>
      </div>
    </section>
  );
}
