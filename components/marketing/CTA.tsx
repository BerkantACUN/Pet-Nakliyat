import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion";

export function CTA() {
  return (
    <section className="border-t border-chalk bg-powder">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
        <FadeUp>
          <h2 className="font-display text-[clamp(36px,5vw,56px)] leading-[1.05] tracking-[-0.025em]">
            Bugünden başla.
            <br />
            <em className="not-italic text-gravel">İlk ilanın 49₺.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-gravel">
            Tek seferlik yayın ücretiyle ilanını aç. Komisyon yalnızca anlaşma
            tamamlandığında: agreed price üzerinden %10.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              variant="pill"
              size="lg"
              render={<Link href="/kayit" />}
            >
              Ücretsiz hesap aç
            </Button>
            <Button
              variant="pill-outline"
              size="lg"
              render={<Link href="/sozlesme-ornegi" />}
            >
              Sözleşmeyi oku
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
